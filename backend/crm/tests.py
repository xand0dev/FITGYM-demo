from datetime import date, datetime, timedelta
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError

from django.utils import timezone as dj_tz

from .models import (
    Gym, Member, MembershipType, MembershipHistory, Attendance,
    WalletTransaction, DeviceToken, NotificationLog, GymInvite, Instructor,
)
from .services import check_client_access, top_up_wallet, charge_wallet
from .notifications import notify_expiring_subscriptions, send_push


class CheckClientAccessTests(TestCase):
    """Unit-тести для services.check_client_access()."""

    def setUp(self):
        self.gym = Gym.objects.create(name="Test Gym", timezone="Europe/Kyiv")

        user = User.objects.create_user(username="testclient", password="pass")
        self.member = Member.objects.create(user=user, gym=self.gym)

        self.unlimited_plan = MembershipType.objects.create(
            gym=self.gym,
            name="Classic",
            amount=500,
            period_months=1,
        )
        self.morning_plan = MembershipType.objects.create(
            gym=self.gym,
            name="Morning Pass",
            amount=300,
            period_months=1,
            time_limit_start="08:00",
            time_limit_end="13:00",
        )

    def _create_membership(self, membership_type, days_offset=30, status='active'):
        return MembershipHistory.objects.create(
            member=self.member,
            membership_type=membership_type,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=days_offset),
            status=status,
        )

    # ── Тест 1: Активна підписка без часового вікна → доступ дозволено ──────

    def test_access_granted_unlimited_plan(self):
        self._create_membership(self.unlimited_plan)
        result = check_client_access(self.member.id, self.gym.id)
        self.assertTrue(result.granted)
        self.assertEqual(result.reason, 'Доступ дозволено')

    # ── Тест 2: Немає підписки → відмова ─────────────────────────────────────

    def test_denied_no_membership(self):
        result = check_client_access(self.member.id, self.gym.id)
        self.assertFalse(result.granted)
        self.assertIn('Підписка', result.reason)

    # ── Тест 3: Підписка закінчилась вчора → відмова ─────────────────────────

    def test_denied_expired_membership(self):
        self._create_membership(self.unlimited_plan, days_offset=-1)
        result = check_client_access(self.member.id, self.gym.id)
        self.assertFalse(result.granted)
        self.assertIn('Підписка', result.reason)

    # ── Тест 4: Morning Pass, час поза вікном 08–13 → відмова ────────────────

    def test_denied_outside_time_window(self):
        self._create_membership(self.morning_plan)
        # Мокуємо datetime.now() всередині services.py — повертаємо 15:30 за Kyiv
        import pytz
        kyiv = pytz.timezone('Europe/Kyiv')
        fake_now = kyiv.localize(datetime(2026, 4, 23, 15, 30, 0))

        with patch('crm.services.datetime') as mock_dt:
            mock_dt.now.return_value = fake_now
            mock_dt.now.side_effect = lambda tz=None: fake_now.astimezone(tz) if tz else fake_now
            mock_dt.today.side_effect = lambda: date.today()

            result = check_client_access(self.member.id, self.gym.id)

        self.assertFalse(result.granted)
        self.assertIn('Morning Pass', result.reason)

    # ── Тест 5: Attendance завжди логується — і при дозволі, і при відмові ───

    def test_attendance_always_logged(self):
        # Без підписки — відмова, але лог має бути
        check_client_access(self.member.id, self.gym.id)
        self.assertEqual(Attendance.objects.count(), 1)

        entry = Attendance.objects.first()
        self.assertFalse(entry.is_access_granted)
        self.assertEqual(entry.member, self.member)
        self.assertEqual(entry.gym, self.gym)

        # З підпискою — дозвіл, теж лог
        self._create_membership(self.unlimited_plan)
        check_client_access(self.member.id, self.gym.id)
        self.assertEqual(Attendance.objects.count(), 2)

        latest = Attendance.objects.order_by('-timestamp').first()
        self.assertTrue(latest.is_access_granted)

    # ── Тест 6: Клієнт з іншого gym → відмова без логу ──────────────────────

    def test_denied_wrong_gym(self):
        other_gym = Gym.objects.create(name="Other Gym", timezone="Europe/Kyiv")
        result = check_client_access(self.member.id, other_gym.id)
        self.assertFalse(result.granted)
        self.assertIn('не знайдений', result.reason)
        # Attendance не створено — не можемо прив'язати до gym без валідного member
        self.assertEqual(Attendance.objects.count(), 0)

    # ── Тест 7: Morning Pass — час у вікні 08–13 → доступ дозволено ──────────

    def test_granted_inside_time_window(self):
        self._create_membership(self.morning_plan)
        import pytz
        kyiv = pytz.timezone('Europe/Kyiv')
        fake_now = kyiv.localize(datetime(2026, 4, 23, 10, 0, 0))

        with patch('crm.services.datetime') as mock_dt:
            mock_dt.now.return_value = fake_now
            mock_dt.now.side_effect = lambda tz=None: fake_now.astimezone(tz) if tz else fake_now
            mock_dt.today.side_effect = lambda: date.today()

            result = check_client_access(self.member.id, self.gym.id)

        self.assertTrue(result.granted)


# ─────────────────────────────────────────────────────────────────────────────
# MeView — GET /api/me/
# ─────────────────────────────────────────────────────────────────────────────

class MeViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Test Gym", timezone="Europe/Kyiv")

        self.user = User.objects.create_user(username="member_user", password="pass")
        self.member = Member.objects.create(user=self.user, gym=self.gym, status='active')
        self.token, _ = Token.objects.get_or_create(user=self.user)

        self.staff_user = User.objects.create_user(username="staff_user", password="pass", is_staff=True)
        self.staff_token, _ = Token.objects.get_or_create(user=self.staff_user)

    # ── Тест 8: /api/me/ для member повертає member_id і gym_id ──────────────

    def test_me_returns_member_id_and_gym_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['member_id'], self.member.id)
        self.assertEqual(response.data['gym_id'], self.gym.id)
        self.assertFalse(response.data['is_staff'])

    # ── Тест 9: /api/me/ без токена → 401 ────────────────────────────────────

    def test_me_unauthenticated(self):
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, 401)

    # ── Тест 10: /api/me/ для staff → member_id=None ─────────────────────────

    def test_me_staff_has_null_member_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['member_id'])
        self.assertTrue(response.data['is_staff'])


# ─────────────────────────────────────────────────────────────────────────────
# MembershipAssignView — POST /api/admin/memberships/assign/
# ─────────────────────────────────────────────────────────────────────────────

class MembershipAssignViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Test Gym", timezone="Europe/Kyiv")

        # staff user
        self.staff_user = User.objects.create_user(
            username="gym_admin", password="pass", is_staff=True
        )
        self.staff_token, _ = Token.objects.get_or_create(user=self.staff_user)

        # member user
        member_user = User.objects.create_user(username="ivan", password="pass")
        self.member = Member.objects.create(user=member_user, gym=self.gym)

        self.membership_type = MembershipType.objects.create(
            gym=self.gym, name="Повний (1 місяць)", amount=2000, period_months=1
        )

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')

    # ── Тест 11: Успішне призначення абонементу → 201, end_date у відповіді ───

    def test_assign_success(self):
        self._auth()
        response = self.client.post('/api/admin/memberships/assign/', {
            'member_id': self.member.id,
            'membership_type_id': self.membership_type.id,
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
        self.assertIn('end_date', response.data)
        self.assertEqual(MembershipHistory.objects.count(), 1)

    # ── Тест 12: Неіснуючий member → 404 ────────────────────────────────────

    def test_assign_member_not_found(self):
        self._auth()
        response = self.client.post('/api/admin/memberships/assign/', {
            'member_id': 99999,
            'membership_type_id': self.membership_type.id,
        })
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)

    # ── Тест 13: Неіснуючий тарифний план → 404 ──────────────────────────────

    def test_assign_membership_type_not_found(self):
        self._auth()
        response = self.client.post('/api/admin/memberships/assign/', {
            'member_id': self.member.id,
            'membership_type_id': 99999,
        })
        self.assertEqual(response.status_code, 404)

    # ── Тест 14: Без авторизації → 401 ───────────────────────────────────────

    def test_assign_unauthenticated(self):
        response = self.client.post('/api/admin/memberships/assign/', {
            'member_id': self.member.id,
            'membership_type_id': self.membership_type.id,
        })
        self.assertEqual(response.status_code, 401)


# ─────────────────────────────────────────────────────────────────────────────
# AdminAttendanceViewSet — GET /api/admin/attendance/
# ─────────────────────────────────────────────────────────────────────────────

class AdminAttendanceViewSetTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Gym A", timezone="Europe/Kyiv")
        self.other_gym = Gym.objects.create(name="Gym B", timezone="Europe/Kyiv")

        # staff для gym A
        staff_user = User.objects.create_user(username="admin_a", password="pass", is_staff=True)
        from crm.models import Instructor
        Instructor.objects.create(user=staff_user, gym=self.gym)
        self.staff_token, _ = Token.objects.get_or_create(user=staff_user)

        # superuser
        superuser = User.objects.create_superuser(username="super", password="pass")
        self.super_token, _ = Token.objects.get_or_create(user=superuser)

        # member у gym A
        member_user = User.objects.create_user(username="mem_a", password="pass")
        self.member_a = Member.objects.create(user=member_user, gym=self.gym)

        # member у gym B
        member_user_b = User.objects.create_user(username="mem_b", password="pass")
        self.member_b = Member.objects.create(user=member_user_b, gym=self.other_gym)

        # Логи
        Attendance.objects.create(member=self.member_a, gym=self.gym, is_access_granted=True)
        Attendance.objects.create(member=self.member_b, gym=self.other_gym, is_access_granted=False)

    # ── Тест 15: Staff gym A бачить тільки свій лог (1 запис) ────────────────

    def test_attendance_gym_isolation(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        response = self.client.get('/api/admin/attendance/')
        self.assertEqual(response.status_code, 200)
        # Ізоляція: тільки записи свого gym (1 із 2)
        self.assertEqual(len(response.data), 1)
        self.assertTrue(response.data[0]['is_access_granted'])

    # ── Тест 16: Superuser бачить обидва логи ─────────────────────────────────

    def test_attendance_superuser_sees_all(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.super_token.key}')
        response = self.client.get('/api/admin/attendance/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)


# ════════════════════════════════════════════════════════════════════════════
#  Тести нових ендпоінтів (analytics, payments, gym register, telegram-code)
# ════════════════════════════════════════════════════════════════════════════

class AdminAnalyticsViewTests(TestCase):
    """Перевіряє що /api/admin/analytics/ повертає валідну структуру + gym-ізоляцію."""

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Analytics Gym", timezone="Europe/Kyiv")
        self.staff = User.objects.create_user(username='a_staff', password='p', is_staff=True)
        self.member = Member.objects.create(user=self.staff, gym=self.gym)
        self.token = Token.objects.create(user=self.staff)

    def test_requires_authentication(self):
        r = self.client.get('/api/admin/analytics/')
        self.assertEqual(r.status_code, 401)

    def test_requires_staff(self):
        regular = User.objects.create_user(username='not_staff', password='p')
        tok = Token.objects.create(user=regular)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {tok.key}')
        r = self.client.get('/api/admin/analytics/')
        self.assertEqual(r.status_code, 403)

    def test_returns_expected_structure(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.get('/api/admin/analytics/')
        self.assertEqual(r.status_code, 200)
        for key in ('summary', 'attendance_7days', 'popular_classes',
                    'peak_hours_today', 'revenue_6months', 'recent_activities'):
            self.assertIn(key, r.data)
        for key in ('active_clients', 'trainers_active', 'active_subscriptions',
                    'revenue_month', 'in_gym_today'):
            self.assertIn(key, r.data['summary'])
        self.assertEqual(len(r.data['attendance_7days']), 7)
        self.assertEqual(len(r.data['revenue_6months']), 6)


class LiqPayCheckoutTests(TestCase):
    """Перевіряє init + confirm flow + захист від чужої оплати."""

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Pay Gym", timezone="Europe/Kyiv")
        self.user = User.objects.create_user(username='payer', password='p')
        self.member = Member.objects.create(user=self.user, gym=self.gym)
        self.token = Token.objects.create(user=self.user)
        self.mtype = MembershipType.objects.create(
            gym=self.gym, name='Test Plan', amount=1000, period_months=1,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_init_returns_checkout_url(self):
        r = self.client.post('/api/membership/checkout/init/',
                             {'membership_type_id': self.mtype.pk})
        self.assertEqual(r.status_code, 200)
        for key in ('order_id', 'amount', 'checkout_url', 'data', 'signature'):
            self.assertIn(key, r.data)
        self.assertIn('liqpay.ua', r.data['checkout_url'])
        self.assertEqual(r.data['amount'], 1000)
        self.assertTrue(r.data['order_id'].startswith('FITGYM-'))

    def test_init_404_on_unknown_tariff(self):
        r = self.client.post('/api/membership/checkout/init/',
                             {'membership_type_id': 99999})
        self.assertEqual(r.status_code, 404)

    def test_init_forbidden_for_non_member(self):
        # User без Member-профілю (наприклад, SuperAdmin)
        admin = User.objects.create_user(username='no_member_admin', password='p',
                                         is_superuser=True, is_staff=True)
        tok = Token.objects.create(user=admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {tok.key}')
        r = self.client.post('/api/membership/checkout/init/',
                             {'membership_type_id': self.mtype.pk})
        self.assertEqual(r.status_code, 403)

    def test_confirm_creates_membership_history(self):
        # Спочатку init
        r = self.client.post('/api/membership/checkout/init/',
                             {'membership_type_id': self.mtype.pk})
        order_id = r.data['order_id']
        # Потім confirm
        r2 = self.client.post('/api/membership/checkout/confirm/',
                              {'order_id': order_id})
        self.assertEqual(r2.status_code, 200)
        self.assertTrue(r2.data['success'])
        self.assertEqual(MembershipHistory.objects.filter(
            member=self.member, membership_type=self.mtype, status='active'
        ).count(), 1)

    def test_confirm_rejects_invalid_order_id(self):
        r = self.client.post('/api/membership/checkout/confirm/',
                             {'order_id': 'GARBAGE'})
        self.assertEqual(r.status_code, 400)


class GymRegisterViewTests(TestCase):
    """Self-service реєстрація залу."""

    def setUp(self):
        self.client = APIClient()

    def _payload(self, **overrides):
        base = {
            'gym_name': 'New Gym',
            'owner_full_name': 'Ivan Petrenko',
            'owner_email': 'ivan@new.com',
            'owner_phone': '+380999999999',
            'username': 'new_admin',
            'password': 'pass123',
        }
        base.update(overrides)
        return base

    def test_creates_gym_user_membership_types(self):
        r = self.client.post('/api/gyms/register/', self._payload(), format='json')
        self.assertEqual(r.status_code, 201)
        self.assertIn('token', r.data)
        self.assertIn('gym_id', r.data)
        # Перевірка побічних ефектів
        gym = Gym.objects.get(pk=r.data['gym_id'])
        self.assertTrue(User.objects.filter(username='new_admin', is_staff=True).exists())
        self.assertEqual(MembershipType.objects.filter(gym=gym).count(), 3)

    def test_rejects_duplicate_gym_name(self):
        self.client.post('/api/gyms/register/', self._payload(), format='json')
        r = self.client.post('/api/gyms/register/',
                             self._payload(username='another_admin'), format='json')
        self.assertEqual(r.status_code, 400)

    def test_rejects_duplicate_username(self):
        self.client.post('/api/gyms/register/', self._payload(), format='json')
        r = self.client.post('/api/gyms/register/',
                             self._payload(gym_name='Another Gym'), format='json')
        self.assertEqual(r.status_code, 400)

    def test_rejects_missing_required(self):
        r = self.client.post('/api/gyms/register/',
                             {'gym_name': 'X'}, format='json')
        self.assertEqual(r.status_code, 400)


class TelegramLinkCodeViewTests(TestCase):
    """GET /api/me/telegram-code/ — генерує 6-значний код для прив'язки."""

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="TG Gym", timezone="Europe/Kyiv")
        self.user = User.objects.create_user(username='tg_user', password='p')
        self.member = Member.objects.create(user=self.user, gym=self.gym)
        self.token = Token.objects.create(user=self.user)

    def test_returns_6_digit_code(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.get('/api/me/telegram-code/')
        self.assertEqual(r.status_code, 200)
        self.assertIn('code', r.data)
        self.assertEqual(len(r.data['code']), 6)
        self.assertTrue(r.data['code'].isdigit())
        self.assertGreater(r.data['expires_in_sec'], 0)

    def test_forbidden_for_non_member(self):
        admin = User.objects.create_user(username='tg_admin', password='p', is_staff=True)
        tok = Token.objects.create(user=admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {tok.key}')
        r = self.client.get('/api/me/telegram-code/')
        self.assertEqual(r.status_code, 403)

    def test_returns_same_code_if_still_valid(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r1 = self.client.get('/api/me/telegram-code/')
        r2 = self.client.get('/api/me/telegram-code/')
        self.assertEqual(r1.data['code'], r2.data['code'])


class BookingFlowTests(TestCase):
    """Тести для POST /api/book/ і /api/my-bookings/ — capacity, double-booking,
    valid membership, isolation."""

    def setUp(self):
        from datetime import datetime, timedelta
        from django.utils import timezone as tz
        from .models import Class, ClassSession, Booking

        self.client = APIClient()
        self.gym = Gym.objects.create(name="Book Gym", timezone="Europe/Kyiv")
        self.user = User.objects.create_user(username='booker', password='p')
        self.member = Member.objects.create(user=self.user, gym=self.gym)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.tariff = MembershipType.objects.create(
            gym=self.gym, name='Test', amount=500, period_months=1,
        )
        self.class_type = Class.objects.create(name='Йога', default_capacity=2)

        # Заняття через 2 дні з capacity=2
        future = tz.now() + timedelta(days=2)
        self.session = ClassSession.objects.create(
            gym=self.gym,
            class_type=self.class_type,
            start_at=future,
            end_at=future + timedelta(hours=1),
            capacity=2,
        )

    def _create_membership(self):
        return MembershipHistory.objects.create(
            member=self.member,
            membership_type=self.tariff,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status='active',
        )

    def test_book_requires_authentication(self):
        c = APIClient()  # без токена
        r = c.post('/api/book/', {'session': self.session.pk}, format='json')
        self.assertEqual(r.status_code, 401)

    def test_book_rejects_without_active_membership(self):
        # MembershipHistory НЕ створено
        r = self.client.post('/api/book/', {'session': self.session.pk}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('абонемент', str(r.data).lower())

    def test_book_succeeds_with_active_membership(self):
        self._create_membership()
        r = self.client.post('/api/book/', {'session': self.session.pk}, format='json')
        self.assertEqual(r.status_code, 201)

    def test_book_rejects_double_booking(self):
        self._create_membership()
        self.client.post('/api/book/', {'session': self.session.pk}, format='json')
        r = self.client.post('/api/book/', {'session': self.session.pk}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('вже записані', str(r.data).lower())

    def test_book_rejects_when_capacity_full(self):
        from .models import Booking
        # Заповнюємо capacity=2 двома іншими клієнтами
        for i in range(2):
            u = User.objects.create_user(username=f'other_{i}', password='p')
            m = Member.objects.create(user=u, gym=self.gym)
            Booking.objects.create(member=m, session=self.session, gym=self.gym)

        self._create_membership()
        r = self.client.post('/api/book/', {'session': self.session.pk}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('міс', str(r.data).lower())  # "немає вільних місць"

    def test_my_bookings_returns_only_own(self):
        from .models import Booking
        self._create_membership()
        Booking.objects.create(member=self.member, session=self.session, gym=self.gym)

        # Другий клієнт зі своїм бронюванням
        other_user = User.objects.create_user(username='other_solo', password='p')
        other_member = Member.objects.create(user=other_user, gym=self.gym)
        Booking.objects.create(member=other_member, session=self.session, gym=self.gym)

        r = self.client.get('/api/my-bookings/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 1)  # Не бачимо чужий

    def test_my_booking_can_be_cancelled(self):
        from .models import Booking
        self._create_membership()
        b = Booking.objects.create(member=self.member, session=self.session, gym=self.gym)

        r = self.client.delete(f'/api/my-bookings/{b.pk}/')
        self.assertEqual(r.status_code, 204)
        self.assertFalse(Booking.objects.filter(pk=b.pk).exists())


class CSVExportsTests(TestCase):
    """Швидкі smoke-тести CSV експортів."""

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="CSV Gym", timezone="Europe/Kyiv")
        self.staff = User.objects.create_user(username='csv_staff', password='p', is_staff=True)
        Member.objects.create(user=self.staff, gym=self.gym)
        self.token = Token.objects.create(user=self.staff)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_members_csv_returns_csv(self):
        r = self.client.get('/api/admin/export/members.csv')
        self.assertEqual(r.status_code, 200)
        self.assertIn('text/csv', r['Content-Type'])
        self.assertIn('attachment', r['Content-Disposition'])

    def test_attendance_csv_with_date_range(self):
        r = self.client.get('/api/admin/export/attendance.csv?from=2026-01-01&to=2026-12-31')
        self.assertEqual(r.status_code, 200)

    def test_attendance_csv_invalid_date_returns_400(self):
        r = self.client.get('/api/admin/export/attendance.csv?from=garbage&to=2026-12-31')
        self.assertEqual(r.status_code, 400)

    def test_revenue_csv_returns_csv(self):
        r = self.client.get('/api/admin/export/revenue.csv')
        self.assertEqual(r.status_code, 200)
        self.assertIn('text/csv', r['Content-Type'])

    def test_exports_require_auth(self):
        c = APIClient()
        for url in ('/api/admin/export/members.csv',
                    '/api/admin/export/attendance.csv',
                    '/api/admin/export/revenue.csv'):
            r = c.get(url)
            self.assertEqual(r.status_code, 401, f'{url} should require auth')


class LoginRateLimitTests(TestCase):
    """Перевіряє що /api/login/ блокує brute-force після 5 невдалих спроб."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()  # ізолюємо тест від попередніх станів
        self.client = APIClient()
        self.user = User.objects.create_user(username='rate_test', password='right_password')

    def test_valid_login_succeeds(self):
        r = self.client.post('/api/login/',
                             {'username': 'rate_test', 'password': 'right_password'},
                             format='json')
        self.assertEqual(r.status_code, 200)

    def test_blocks_after_5_failed_attempts(self):
        # 5 невдалих
        for i in range(5):
            r = self.client.post('/api/login/',
                                 {'username': 'rate_test', 'password': 'WRONG'},
                                 format='json')
            self.assertEqual(r.status_code, 400, f'Attempt {i}: expected 400, got {r.status_code}')

        # 6-та (навіть з ПРАВИЛЬНИМ паролем) — заблокована
        r = self.client.post('/api/login/',
                             {'username': 'rate_test', 'password': 'right_password'},
                             format='json')
        self.assertEqual(r.status_code, 429)
        self.assertIn('Забагато', r.data['error'])

    def test_successful_login_clears_counter(self):
        # 3 невдалі
        for _ in range(3):
            self.client.post('/api/login/',
                             {'username': 'rate_test', 'password': 'WRONG'},
                             format='json')
        # Успіх → лічильник скидається
        r = self.client.post('/api/login/',
                             {'username': 'rate_test', 'password': 'right_password'},
                             format='json')
        self.assertEqual(r.status_code, 200)
        # Тепер 5 невдалих знову мають бути дозволені
        for _ in range(5):
            r = self.client.post('/api/login/',
                                 {'username': 'rate_test', 'password': 'WRONG'},
                                 format='json')
            self.assertEqual(r.status_code, 400)


# ════════════════════════════════════════════════════════════════════════════
#  Гаманець клієнта (deposit_balance) — services + ендпоінти
# ════════════════════════════════════════════════════════════════════════════

class WalletTests(TestCase):
    """top_up_wallet / charge_wallet + /api/me/wallet/ + admin adjust (gym isolation)."""

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Wallet Gym", timezone="Europe/Kyiv")
        self.other_gym = Gym.objects.create(name="Other Gym", timezone="Europe/Kyiv")

        self.user = User.objects.create_user(username='wuser', password='p')
        self.member = Member.objects.create(user=self.user, gym=self.gym)
        self.token = Token.objects.create(user=self.user)

        # staff свого залу (для admin adjust). Member.gym робить get_gym_from_request → gym
        self.staff = User.objects.create_user(username='wstaff', password='p', is_staff=True)
        Member.objects.create(user=self.staff, gym=self.gym)
        self.staff_token = Token.objects.create(user=self.staff)

        # member чужого залу
        ou = User.objects.create_user(username='wother', password='p')
        self.other_member = Member.objects.create(user=ou, gym=self.other_gym)

    # ── Сервіси ──────────────────────────────────────────────────────────────

    def test_topup_increases_balance_and_logs(self):
        txn = top_up_wallet(self.member, Decimal('150.00'), description='Тест')
        self.member.refresh_from_db()
        self.assertEqual(self.member.deposit_balance, Decimal('150.00'))
        self.assertEqual(txn.balance_after, Decimal('150.00'))
        self.assertEqual(txn.kind, 'topup')
        self.assertEqual(WalletTransaction.objects.filter(member=self.member).count(), 1)

    def test_charge_decreases_balance(self):
        top_up_wallet(self.member, Decimal('100'))
        charge_wallet(self.member, Decimal('30'), description='Заняття')
        self.member.refresh_from_db()
        self.assertEqual(self.member.deposit_balance, Decimal('70'))

    def test_charge_rejected_when_insufficient(self):
        top_up_wallet(self.member, Decimal('20'))
        with self.assertRaises(DjangoValidationError):
            charge_wallet(self.member, Decimal('50'))
        self.member.refresh_from_db()
        # Баланс не змінився
        self.assertEqual(self.member.deposit_balance, Decimal('20'))

    def test_balance_after_chain_is_correct(self):
        t1 = top_up_wallet(self.member, Decimal('100'))
        t2 = charge_wallet(self.member, Decimal('40'))
        t3 = top_up_wallet(self.member, Decimal('10'))
        self.assertEqual(t1.balance_after, Decimal('100'))
        self.assertEqual(t2.balance_after, Decimal('60'))
        self.assertEqual(t3.balance_after, Decimal('70'))

    # ── Ендпоінти ────────────────────────────────────────────────────────────

    def test_wallet_detail_returns_balance_and_txns(self):
        top_up_wallet(self.member, Decimal('55'))
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.get('/api/me/wallet/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Decimal(str(r.data['balance'])), Decimal('55'))
        self.assertEqual(len(r.data['transactions']), 1)

    def test_wallet_detail_requires_auth(self):
        r = self.client.get('/api/me/wallet/')
        self.assertEqual(r.status_code, 401)

    def test_me_returns_deposit_balance(self):
        top_up_wallet(self.member, Decimal('12.50'))
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.get('/api/me/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Decimal(str(r.data['deposit_balance'])), Decimal('12.50'))

    def test_topup_init_then_confirm_credits_balance(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.post('/api/me/wallet/topup/init/', {'amount': '200.00'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertIn('liqpay.ua', r.data['checkout_url'])
        order_id = r.data['order_id']

        r2 = self.client.post('/api/me/wallet/topup/confirm/',
                              {'order_id': order_id}, format='json')
        self.assertEqual(r2.status_code, 200)
        self.assertTrue(r2.data['success'])
        self.member.refresh_from_db()
        self.assertEqual(self.member.deposit_balance, Decimal('200.00'))

    def test_topup_confirm_is_idempotent(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        order_id = self.client.post('/api/me/wallet/topup/init/',
                                    {'amount': '90'}, format='json').data['order_id']
        self.client.post('/api/me/wallet/topup/confirm/',
                         {'order_id': order_id}, format='json')
        # Друге підтвердження — не нараховує повторно
        r = self.client.post('/api/me/wallet/topup/confirm/',
                             {'order_id': order_id}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data.get('duplicate'))
        self.member.refresh_from_db()
        self.assertEqual(self.member.deposit_balance, Decimal('90'))
        self.assertEqual(WalletTransaction.objects.filter(member=self.member).count(), 1)

    def test_topup_confirm_rejects_garbage_order(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.post('/api/me/wallet/topup/confirm/',
                             {'order_id': 'GARBAGE'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_admin_adjust_credits_member(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        r = self.client.post(
            f'/api/admin/members/{self.member.id}/wallet/adjust/',
            {'amount': '300', 'description': 'Бонус'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.member.refresh_from_db()
        self.assertEqual(self.member.deposit_balance, Decimal('300'))

    def test_admin_adjust_gym_isolation(self):
        # staff залу A не може коригувати клієнта залу B → 404
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        r = self.client.post(
            f'/api/admin/members/{self.other_member.id}/wallet/adjust/',
            {'amount': '100'}, format='json')
        self.assertEqual(r.status_code, 404)
        self.other_member.refresh_from_db()
        self.assertEqual(self.other_member.deposit_balance, Decimal('0'))

    def test_admin_adjust_forbidden_for_regular_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.post(
            f'/api/admin/members/{self.member.id}/wallet/adjust/',
            {'amount': '50'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_admin_adjust_negative_beyond_balance_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        r = self.client.post(
            f'/api/admin/members/{self.member.id}/wallet/adjust/',
            {'amount': '-500', 'description': 'Списання'}, format='json')
        self.assertEqual(r.status_code, 400)
        self.member.refresh_from_db()
        self.assertEqual(self.member.deposit_balance, Decimal('0'))


# ════════════════════════════════════════════════════════════════════════════
#  Push-сповіщення — device-token endpoint + notify_expiring + send_push
# ════════════════════════════════════════════════════════════════════════════

class PushNotificationTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.gym = Gym.objects.create(name="Push Gym", timezone="Europe/Kyiv")
        self.user = User.objects.create_user(username='puser', password='p')
        self.member = Member.objects.create(user=self.user, gym=self.gym)
        self.token = Token.objects.create(user=self.user)
        self.mtype = MembershipType.objects.create(
            gym=self.gym, name='Повний', amount=1000, period_months=1,
        )

    def _expiring_membership(self, days):
        return MembershipHistory.objects.create(
            member=self.member,
            membership_type=self.mtype,
            start_date=date.today() - timedelta(days=30),
            end_date=date.today() + timedelta(days=days),
            status='active',
        )

    # ── device-token endpoint ────────────────────────────────────────────────

    def test_device_token_requires_auth(self):
        r = self.client.post('/api/me/device-token/',
                             {'expo_push_token': 'ExponentPushToken[abc]'},
                             format='json')
        self.assertEqual(r.status_code, 401)

    def test_device_token_register_and_upsert(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        r = self.client.post('/api/me/device-token/',
                             {'expo_push_token': 'ExponentPushToken[abc]',
                              'platform': 'android'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(DeviceToken.objects.count(), 1)
        dt = DeviceToken.objects.get()
        self.assertEqual(dt.user, self.user)
        self.assertEqual(dt.gym, self.gym)
        self.assertEqual(dt.platform, 'android')

        # Повторний POST того ж токена — upsert, не дубль
        r2 = self.client.post('/api/me/device-token/',
                              {'expo_push_token': 'ExponentPushToken[abc]',
                               'platform': 'ios'}, format='json')
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(DeviceToken.objects.count(), 1)
        dt.refresh_from_db()
        self.assertEqual(dt.platform, 'ios')

    # ── notify_expiring_subscriptions ────────────────────────────────────────

    @patch('crm.notifications.send_push')
    def test_notify_expiring_sends_and_logs(self, mock_send):
        self._expiring_membership(days=3)
        DeviceToken.objects.create(
            user=self.user, gym=self.gym,
            expo_push_token='ExponentPushToken[x]', platform='android',
        )
        count = notify_expiring_subscriptions(days_before=3)
        self.assertEqual(count, 1)
        mock_send.assert_called_once()
        call = mock_send.call_args
        tokens_arg = call.args[0]
        title_arg = call.kwargs['title']
        body_arg = call.kwargs['body']
        self.assertEqual(tokens_arg, ['ExponentPushToken[x]'])
        self.assertEqual(title_arg, 'Абонемент закінчується')
        self.assertIn('Повний', body_arg)
        self.assertEqual(
            NotificationLog.objects.filter(kind='expiring_soon').count(), 1
        )

    @patch('crm.notifications.send_push')
    def test_notify_expiring_is_idempotent(self, mock_send):
        self._expiring_membership(days=3)
        DeviceToken.objects.create(
            user=self.user, expo_push_token='ExponentPushToken[y]',
        )
        first = notify_expiring_subscriptions(days_before=3)
        second = notify_expiring_subscriptions(days_before=3)
        self.assertEqual(first, 1)
        self.assertEqual(second, 0)
        mock_send.assert_called_once()  # другий раз не слали

    @patch('crm.notifications.send_push')
    def test_notify_expiring_only_target_day(self, mock_send):
        self._expiring_membership(days=10)  # не сьогодні+3
        count = notify_expiring_subscriptions(days_before=3)
        self.assertEqual(count, 0)
        mock_send.assert_not_called()

    @patch('crm.notifications.send_push')
    def test_notify_expiring_logs_even_without_devices(self, mock_send):
        # Немає DeviceToken → push не шлемо, але лог пишемо (анти-спам cron)
        self._expiring_membership(days=3)
        count = notify_expiring_subscriptions(days_before=3)
        self.assertEqual(count, 1)
        mock_send.assert_not_called()
        self.assertEqual(NotificationLog.objects.count(), 1)

    # ── send_push (Expo-клієнт замоканий) ────────────────────────────────────

    @patch('crm.notifications.PushClient')
    def test_send_push_publishes_message(self, mock_client_cls):
        mock_client = mock_client_cls.return_value
        ticket = MagicMock()
        mock_client.publish.return_value = ticket

        send_push(['ExponentPushToken[z]'], 'Title', 'Body', {'screen': 'Membership'})

        mock_client.publish.assert_called_once()
        sent_msg = mock_client.publish.call_args.args[0]
        self.assertEqual(sent_msg.to, 'ExponentPushToken[z]')
        self.assertEqual(sent_msg.title, 'Title')
        ticket.validate_response.assert_called_once()


# ════════════════════════════════════════════════════════════════════════════
#  GymOwner invite-link — B-16
# ════════════════════════════════════════════════════════════════════════════

class GymInviteTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.gym_a = Gym.objects.create(name="Invite Gym A", timezone="Europe/Kyiv")
        self.gym_b = Gym.objects.create(name="Invite Gym B", timezone="Europe/Kyiv")

        # staff залу A (gym береться з request через Member.gym)
        self.staff = User.objects.create_user(username='inv_staff', password='p', is_staff=True)
        Member.objects.create(user=self.staff, gym=self.gym_a)
        self.staff_token = Token.objects.create(user=self.staff)

        # звичайний клієнт (не staff)
        self.regular = User.objects.create_user(username='inv_reg', password='p')
        Member.objects.create(user=self.regular, gym=self.gym_a)
        self.reg_token = Token.objects.create(user=self.regular)

        # superuser (без залу)
        self.superu = User.objects.create_superuser(username='inv_super', password='p')
        self.super_token = Token.objects.create(user=self.superu)

    def _staff(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')

    # ── create ───────────────────────────────────────────────────────────────

    def test_create_requires_auth(self):
        r = self.client.post('/api/admin/invites/', {'role': 'member'}, format='json')
        self.assertEqual(r.status_code, 401)

    def test_create_forbidden_for_regular_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.reg_token.key}')
        r = self.client.post('/api/admin/invites/', {'role': 'member'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_staff_creates_invite_for_own_gym(self):
        self._staff()
        r = self.client.post('/api/admin/invites/', {'role': 'member'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertIn('code', r.data)
        self.assertEqual(r.data['gym_name'], self.gym_a.name)
        inv = GymInvite.objects.get(code=r.data['code'])
        # gym-isolation: зал береться з request, не з вводу → залу A, не B
        self.assertEqual(inv.gym, self.gym_a)
        self.assertEqual(inv.created_by, self.staff)

    def test_superuser_must_pass_gym_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.super_token.key}')
        r = self.client.post('/api/admin/invites/', {'role': 'staff'}, format='json')
        self.assertEqual(r.status_code, 400)
        r2 = self.client.post('/api/admin/invites/',
                              {'role': 'staff', 'gym_id': self.gym_b.id}, format='json')
        self.assertEqual(r2.status_code, 201)
        self.assertEqual(GymInvite.objects.get(code=r2.data['code']).gym, self.gym_b)

    # ── preview ──────────────────────────────────────────────────────────────

    def test_preview_valid_invite(self):
        self._staff()
        code = self.client.post('/api/admin/invites/',
                                {'role': 'member'}, format='json').data['code']
        self.client.credentials()  # анонім
        r = self.client.get(f'/api/invites/{code}/')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data['valid'])
        self.assertEqual(r.data['gym_name'], self.gym_a.name)
        self.assertEqual(r.data['role'], 'member')

    def test_preview_unknown_code_404(self):
        r = self.client.get('/api/invites/deadbeef/')
        self.assertEqual(r.status_code, 404)

    # ── accept ───────────────────────────────────────────────────────────────

    def _make_invite(self, role='member', hours=72):
        return GymInvite.objects.create(
            gym=self.gym_a, code=__import__('uuid').uuid4().hex, role=role,
            created_by=self.staff,
            expires_at=dj_tz.now() + timedelta(hours=hours),
        )

    def test_accept_member_creates_member_and_token(self):
        inv = self._make_invite(role='member')
        r = self.client.post(f'/api/invites/{inv.code}/accept/', {
            'username': 'newclient', 'password': 'secret123',
            'full_name': 'Іван Новий', 'contact': '+380991112233',
        }, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertIn('token', r.data)
        self.assertEqual(r.data['gym_id'], self.gym_a.id)
        u = User.objects.get(username='newclient')
        self.assertFalse(u.is_staff)
        self.assertTrue(Member.objects.filter(user=u, gym=self.gym_a).exists())
        inv.refresh_from_db()
        self.assertIsNotNone(inv.used_at)
        # токен робочий
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {r.data["token"]}')
        me = self.client.get('/api/me/')
        self.assertEqual(me.data['gym_id'], self.gym_a.id)

    def test_accept_staff_creates_instructor(self):
        inv = self._make_invite(role='staff')
        r = self.client.post(f'/api/invites/{inv.code}/accept/', {
            'username': 'newtrainer', 'password': 'secret123', 'full_name': 'Петро Тренер',
        }, format='json')
        self.assertEqual(r.status_code, 201)
        u = User.objects.get(username='newtrainer')
        self.assertTrue(u.is_staff)
        self.assertTrue(Instructor.objects.filter(user=u, gym=self.gym_a).exists())

    def test_accept_rejects_reused_code(self):
        inv = self._make_invite()
        self.client.post(f'/api/invites/{inv.code}/accept/',
                         {'username': 'u1', 'password': 'secret123'}, format='json')
        r = self.client.post(f'/api/invites/{inv.code}/accept/',
                             {'username': 'u2', 'password': 'secret123'}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertFalse(User.objects.filter(username='u2').exists())

    def test_accept_rejects_expired_invite(self):
        inv = self._make_invite(hours=-1)  # вже протермінований
        r = self.client.post(f'/api/invites/{inv.code}/accept/',
                             {'username': 'u3', 'password': 'secret123'}, format='json')
        self.assertEqual(r.status_code, 410)

    def test_accept_rejects_duplicate_username(self):
        inv = self._make_invite()
        r = self.client.post(f'/api/invites/{inv.code}/accept/',
                             {'username': 'inv_staff', 'password': 'secret123'}, format='json')
        self.assertEqual(r.status_code, 400)
        inv.refresh_from_db()
        self.assertIsNone(inv.used_at)  # код не спалено через помилку валідації

    def test_accept_unknown_code_404(self):
        r = self.client.post('/api/invites/nope/accept/',
                             {'username': 'u4', 'password': 'secret123'}, format='json')
        self.assertEqual(r.status_code, 404)
