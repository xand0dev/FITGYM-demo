from datetime import date, datetime, timedelta
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth.models import User

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
