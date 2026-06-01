"""
Запускає seed_demo --fresh лише якщо у БД ще немає жодного залу.

Використання у Dockerfile / CI:
    python manage.py seed_if_empty

Ідемпотентно: на вже заповненій БД миттєво виходить без побічних ефектів,
тому безпечно у CMD контейнера що рестартується.

Додатково робить **легкі бекфіли** для існуючих БД:
- створює стандартні Room об'єкти якщо відсутні
- проставляє Room на ClassSession де room=None
- прив'язує Member.gym для legacy-Member-ів без залу (дефолт = перший Gym)
Це коригує дані що були засіяні старою версією seed_demo (до додавання Room
і до RegisterSerializer-фіксу).
"""
from __future__ import annotations

import random

from django.core.management import call_command
from django.core.management.base import BaseCommand

from crm.models import ClassSession, Gym, Member, Room


DEFAULT_ROOMS = [
    ('Основний зал', 30),
    ('Зал Йоги', 20),
    ('Кардіо-зона', 25),
    ('Силова зона', 20),
    ('Басейн', 15),
]


class Command(BaseCommand):
    help = 'Seed demo if DB empty + idempotent backfills (rooms, gym FKs).'

    def handle(self, *args, **options) -> None:
        if not Gym.objects.exists():
            self.stdout.write('seed_if_empty: БД порожня — запускаю seed_demo --fresh...')
            call_command('seed_demo', fresh=True)
            self.stdout.write(self.style.SUCCESS('seed_if_empty: готово.'))
            return

        self.stdout.write(self.style.SUCCESS(
            f"seed_if_empty: вже є {Gym.objects.count()} зал(ів) — основний seed пропущено."
        ))

        # ── Бекфіл Room ──────────────────────────────────────────────────────
        for name, capacity in DEFAULT_ROOMS:
            Room.objects.get_or_create(name=name, defaults={'capacity': capacity})
        rooms = list(Room.objects.all())

        # ── Бекфіл ClassSession.room ─────────────────────────────────────────
        no_room = ClassSession.objects.filter(room__isnull=True)
        no_room_count = no_room.count()
        if no_room_count and rooms:
            for cs in no_room:
                cs.room = random.choice(rooms)
                cs.save(update_fields=['room'])
            self.stdout.write(self.style.SUCCESS(
                f"backfill: проставлено Room у {no_room_count} ClassSession."
            ))

        # ── Бекфіл Member.gym (для legacy self-register-ів без gym) ──────────
        default_gym = Gym.objects.filter(is_active=True).order_by('pk').first()
        if default_gym:
            updated = Member.objects.filter(gym__isnull=True).update(gym=default_gym)
            if updated:
                self.stdout.write(self.style.SUCCESS(
                    f"backfill: прив'язано {updated} Member-ів до '{default_gym.name}'."
                ))
