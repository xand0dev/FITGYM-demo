"""
Надсилає push-нагадування клієнтам, чий абонемент закінчується скоро.

Використання:
    python manage.py notify_expiring             # за 3 дні до кінця (дефолт)
    python manage.py notify_expiring --days 7    # за 7 днів

Планувальник (Celery свідомо НЕ вводимо):
  Windows Task Scheduler — щоденно:
    Program:   D:\\+FITGYM\\gym_project\\venv\\Scripts\\python.exe
    Arguments: manage.py notify_expiring
    Start in:  D:\\+FITGYM\\gym_project
  Linux cron — `0 10 * * * cd /app && python manage.py notify_expiring`
"""
from __future__ import annotations

from django.core.management.base import BaseCommand

from crm.notifications import notify_expiring_subscriptions


class Command(BaseCommand):
    help = 'Push-нагадування про абонементи, що закінчуються через N днів'

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            '--days', type=int, default=3,
            help='За скільки днів до закінчення слати нагадування (дефолт 3)',
        )

    def handle(self, *args, **options) -> None:
        days = options['days']
        sent = notify_expiring_subscriptions(days_before=days)
        self.stdout.write(self.style.SUCCESS(
            f'notify_expiring: опрацьовано {sent} абонемент(и/ів), '
            f'що закінчуються через {days} дн.'
        ))
