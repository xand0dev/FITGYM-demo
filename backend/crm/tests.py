from datetime import date, datetime, timedelta
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from .models import Gym, Member, MembershipType, MembershipHistory, Attendance
from .services import check_client_access


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
