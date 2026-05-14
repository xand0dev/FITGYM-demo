"""
Запуск FITGYM Telegram-бота через long polling.

Використання:
    python manage.py runbot

Потрібно встановити TELEGRAM_BOT_TOKEN у .env або у середовищі.
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Запускає FITGYM Telegram-бота (long polling).'

    def handle(self, *args, **options):
        from crm.telegram_bot import run_polling
        run_polling()
