"""
Запускає seed_demo --fresh лише якщо у БД ще немає жодного залу.

Використання у Dockerfile / CI:
    python manage.py seed_if_empty

Ідемпотентно: на вже заповненій БД миттєво виходить без побічних ефектів,
тому безпечно у CMD контейнера що рестартується.
"""
from __future__ import annotations

from django.core.management import call_command
from django.core.management.base import BaseCommand

from crm.models import Gym


class Command(BaseCommand):
    help = 'Запускає seed_demo --fresh лише якщо БД порожня (idempotent).'

    def handle(self, *args, **options) -> None:
        if Gym.objects.exists():
            self.stdout.write(self.style.SUCCESS(
                f"seed_if_empty: вже є {Gym.objects.count()} зал(ів) — пропускаю."
            ))
            return
        self.stdout.write('seed_if_empty: БД порожня — запускаю seed_demo --fresh...')
        call_command('seed_demo', fresh=True)
        self.stdout.write(self.style.SUCCESS('seed_if_empty: готово.'))
