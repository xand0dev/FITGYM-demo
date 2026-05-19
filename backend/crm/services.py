from __future__ import annotations
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional

import pytz

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import (
    Attendance, Gym, GymInvite, Instructor, Member, MembershipHistory,
    WalletTransaction,
)


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


# ── гаманець клієнта (deposit balance) ────────────────────────────────────────

def _record_wallet_txn(
    member: Member, amount: Decimal, kind: str, description: str,
    gateway_id: str, new_balance: Decimal,
) -> WalletTransaction:
    return WalletTransaction.objects.create(
        gym=member.gym,
        member=member,
        amount=amount,
        kind=kind,
        balance_after=new_balance,
        description=description,
        gateway_transaction_id=gateway_id,
    )


def top_up_wallet(
    member: Member, amount: Decimal, kind: str = 'topup',
    description: str = '', gateway_id: str = '',
) -> WalletTransaction:
    """
    Поповнює депозит клієнта на `amount` (атомарно). Пише append-only запис
    у WalletTransaction з коректним balance_after.
    """
    amount = Decimal(amount)
    if amount <= 0:
        raise ValidationError('Сума поповнення має бути додатною.')

    with transaction.atomic():
        m = Member.objects.select_for_update().get(pk=member.pk)
        m.deposit_balance = (m.deposit_balance or Decimal('0')) + amount
        m.save(update_fields=['deposit_balance'])
        return _record_wallet_txn(m, amount, kind, description, gateway_id, m.deposit_balance)


def charge_wallet(
    member: Member, amount: Decimal, description: str = '', kind: str = 'charge',
) -> WalletTransaction:
    """
    Списує `amount` з депозиту клієнта (атомарно). Кидає ValidationError якщо
    коштів недостатньо — баланс ніколи не йде у мінус.
    """
    amount = Decimal(amount)
    if amount <= 0:
        raise ValidationError('Сума списання має бути додатною.')

    with transaction.atomic():
        m = Member.objects.select_for_update().get(pk=member.pk)
        current = m.deposit_balance or Decimal('0')
        if current < amount:
            raise ValidationError('Недостатньо коштів на балансі.')
        m.deposit_balance = current - amount
        m.save(update_fields=['deposit_balance'])
        return _record_wallet_txn(m, amount, kind, description, '', m.deposit_balance)


# ── запрошення до залу (GymOwner invite-link) ─────────────────────────────────

def create_gym_invite(
    gym: Gym, role: str = 'member', created_by: Optional[User] = None,
    ttl_hours: int = 72,
) -> GymInvite:
    """Створює одноразове запрошення до залу з не-вгадуваним кодом."""
    if role not in dict(GymInvite.ROLE_CHOICES):
        raise ValidationError('Невідома роль запрошення.')
    if ttl_hours <= 0 or ttl_hours > 24 * 30:
        raise ValidationError('Невалідний термін дії запрошення.')

    return GymInvite.objects.create(
        gym=gym,
        code=uuid.uuid4().hex,
        role=role,
        created_by=created_by,
        expires_at=timezone.now() + timedelta(hours=ttl_hours),
    )


def get_valid_invite(code: str) -> GymInvite:
    """
    Повертає активне запрошення або кидає ValidationError з кодом стану:
    'not_found' / 'used' / 'expired' (для мапінгу на 404 / 400 / 410).
    """
    try:
        invite = GymInvite.objects.select_related('gym').get(code=code)
    except GymInvite.DoesNotExist:
        raise ValidationError('Запрошення не знайдено.', code='not_found')

    if invite.used_at is not None:
        raise ValidationError('Запрошення вже використано.', code='used')
    if invite.expires_at <= timezone.now():
        raise ValidationError('Термін дії запрошення вичерпано.', code='expired')
    return invite


def accept_gym_invite(
    code: str, username: str, password: str, full_name: str = '',
    email: str = '', contact: str = '',
) -> tuple[User, GymInvite]:
    """
    Реєструє нового користувача за кодом запрошення і прив'язує його до залу
    запрошення. role='staff' → User.is_staff + Instructor; 'member' → Member.
    Атомарно; одноразовість гарантується `select_for_update` + `used_at`.
    """
    username = (username or '').strip()
    if not username or not password:
        raise ValidationError('Логін і пароль обов\'язкові.', code='invalid')
    if User.objects.filter(username=username).exists():
        raise ValidationError('Користувач з таким логіном вже існує.', code='invalid')

    first_name, _, last_name = (full_name or '').strip().partition(' ')

    with transaction.atomic():
        try:
            invite = (
                GymInvite.objects.select_for_update()
                .select_related('gym')
                .get(code=code)
            )
        except GymInvite.DoesNotExist:
            raise ValidationError('Запрошення не знайдено.', code='not_found')

        if invite.used_at is not None:
            raise ValidationError('Запрошення вже використано.', code='used')
        if invite.expires_at <= timezone.now():
            raise ValidationError('Термін дії запрошення вичерпано.', code='expired')

        is_staff = invite.role == 'staff'
        user = User.objects.create_user(
            username=username,
            email=email.strip(),
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff,
        )

        if invite.role == 'staff':
            Instructor.objects.create(
                user=user, gym=invite.gym, specialties='', contact=contact,
            )
        else:
            Member.objects.create(
                user=user, gym=invite.gym, contact=contact, status='active',
            )

        invite.used_at = timezone.now()
        invite.save(update_fields=['used_at'])

    return user, invite
