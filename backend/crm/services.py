from __future__ import annotations
from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

import pytz

from .models import Attendance, Gym, Member, MembershipHistory


@dataclass
class AccessResult:
    granted: bool
    reason: str


def check_client_access(member_id: int, gym_id: int) -> AccessResult:
    """
    Перевіряє чи може клієнт зайти в зал прямо зараз.
    Завжди записує результат в Attendance — незалежно від відповіді.
    """
    try:
        member = Member.objects.select_related('gym').get(id=member_id, gym_id=gym_id)
    except Member.DoesNotExist:
        # Не логуємо — не можемо прив'язати запис до gym без валідного member
        return AccessResult(granted=False, reason='Клієнт не знайдений у цьому залі')

    active_membership = _get_active_membership(member)

    if active_membership is None:
        _log_attendance(member, gym_id, granted=False, reason='Підписка відсутня або закінчилась')
        return AccessResult(granted=False, reason='Підписка відсутня або закінчилась')

    time_denial = _check_time_window(active_membership, gym_id)
    if time_denial:
        _log_attendance(member, gym_id, granted=False, reason=time_denial)
        return AccessResult(granted=False, reason=time_denial)

    _log_attendance(member, gym_id, granted=True, reason='')
    return AccessResult(granted=True, reason='Доступ дозволено')


# ── private helpers ──────────────────────────────────────────────────────────

def _get_active_membership(member: Member) -> Optional[MembershipHistory]:
    return (
        MembershipHistory.objects
        .filter(member=member, status='active', end_date__gte=date.today())
        .select_related('membership_type')
        .first()
    )


def _check_time_window(membership: MembershipHistory, gym_id: int) -> Optional[str]:
    """Повертає рядок-причину відмови або None якщо часових обмежень немає / вони пройдені."""
    mt = membership.membership_type
    if not (mt.time_limit_start and mt.time_limit_end):
        return None

    try:
        gym = Gym.objects.get(id=gym_id)
        tz = pytz.timezone(gym.timezone)
    except (Gym.DoesNotExist, pytz.UnknownTimeZoneError):
        return None

    now_local = datetime.now(tz).time()
    if mt.time_limit_start <= now_local <= mt.time_limit_end:
        return None

    return (
        f'Ваш тариф "{mt.name}" діє з {mt.time_limit_start.strftime("%H:%M")} '
        f'до {mt.time_limit_end.strftime("%H:%M")}'
    )


def _log_attendance(member: Member, gym_id: int, granted: bool, reason: str) -> None:
    Attendance.objects.create(
        member=member,
        gym_id=gym_id,
        is_access_granted=granted,
        denial_reason=reason,
    )
