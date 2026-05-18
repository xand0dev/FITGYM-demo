"""
Expo push-сповіщення.

- send_push(tokens, title, body, data)        — низькорівнева відправка через Expo
- notify_expiring_subscriptions(days_before)  — нагадування «абонемент закінчується»

Періодичний запуск: `python manage.py notify_expiring`
(планувальник ОС: Windows Task Scheduler / cron — Celery свідомо НЕ вводимо,
узгоджено з наявним патерном management-команд runbot/seed_demo).
"""
from __future__ import annotations

from datetime import date, timedelta

from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)
from requests.exceptions import ConnectionError as RequestsConnectionError
from requests.exceptions import HTTPError

from .models import DeviceToken, MembershipHistory, NotificationLog

EXPIRING_SOON_KIND = 'expiring_soon'


def send_push(
    tokens: list[str], title: str, body: str, data: dict | None = None,
) -> None:
    """
    Надсилає push на список Expo-токенів. Невалідні токени (DeviceNotRegistered)
    деактивуються. Мережеві помилки ковтаються — нагадування best-effort.
    """
    client = PushClient()
    for token in tokens:
        message = PushMessage(to=token, title=title, body=body, data=data or {})
        try:
            ticket = client.publish(message)
            ticket.validate_response()
        except DeviceNotRegisteredError:
            DeviceToken.objects.filter(expo_push_token=token).update(is_active=False)
        except (PushServerError, PushTicketError, RequestsConnectionError, HTTPError):
            # Best-effort: не валимо весь батч через один збій
            continue


def notify_expiring_subscriptions(days_before: int = 3) -> int:
    """
    Шле нагадування клієнтам, чий активний абонемент закінчується рівно
    через `days_before` днів. Ідемпотентно: повторний запуск не дублює
    (захищено NotificationLog). Повертає кількість опрацьованих membership.
    """
    target = date.today() + timedelta(days=days_before)
    memberships = (
        MembershipHistory.objects
        .filter(status='active', end_date=target)
        .select_related('member__user', 'membership_type')
    )

    sent = 0
    for mh in memberships:
        already = NotificationLog.objects.filter(
            member=mh.member,
            membership_history=mh,
            kind=EXPIRING_SOON_KIND,
        ).exists()
        if already:
            continue

        tokens = list(
            DeviceToken.objects
            .filter(user=mh.member.user, is_active=True)
            .values_list('expo_push_token', flat=True)
        )
        if tokens:
            send_push(
                tokens,
                title='Абонемент закінчується',
                body=(
                    f'Ваш абонемент «{mh.membership_type.name}» діє до '
                    f'{mh.end_date:%d.%m.%Y}. Продовжіть, щоб не втратити доступ.'
                ),
                data={'screen': 'Membership', 'membership_history_id': mh.pk},
            )

        # Лог пишемо завжди (навіть без токенів) — щоб cron не спамив повторно
        NotificationLog.objects.create(
            member=mh.member,
            membership_history=mh,
            kind=EXPIRING_SOON_KIND,
        )
        sent += 1

    return sent
