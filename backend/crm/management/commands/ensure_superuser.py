"""
Створює SuperAdmin якщо його ще нема. Безпечно запускати кожен старт.

Креди беруться з env-змінних:
    SUPERUSER_USERNAME (default: legion)
    SUPERUSER_PASSWORD (default: 2341)

Використання:
    python manage.py ensure_superuser
"""
from __future__ import annotations

import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Створює SuperAdmin якщо такого user ще нема (idempotent).'

    def handle(self, *args, **options) -> None:
        username = os.environ.get('SUPERUSER_USERNAME', 'legion')
        password = os.environ.get('SUPERUSER_PASSWORD', '2341')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(
                f"ensure_superuser: '{username}' уже існує — пропускаю."
            ))
            return

        User.objects.create_superuser(username=username, password=password)
        self.stdout.write(self.style.SUCCESS(
            f"ensure_superuser: створено SuperAdmin '{username}'."
        ))
