"""
Заповнює БД насиченими демо-даними для показової демонстрації.

Створює:
  - 2 зали (multi-tenancy demo): FITGYM Бердичів, FITGYM Київ
  - 5-10 тренерів кожному залу
  - 50 клієнтів (Member) розподілених між залами
  - Стандартні + часові тарифи (Ранковий)
  - 30 днів Attendance з реалістичним розподілом по годинах
  - 100+ Booking записів на ClassSession
  - 40+ MembershipHistory для revenue chart

Використання:
    python manage.py seed_demo            # додає до існуючих даних
    python manage.py seed_demo --fresh    # видаляє все та створює заново
    python manage.py seed_demo --members 100 --days 60
"""
from __future__ import annotations

import random
from datetime import date, datetime, time, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from crm.models import (
    Attendance, Booking, Class, ClassSession, Gym, Instructor,
    Member, MembershipApplication, MembershipHistory, MembershipType,
    Workout,
)


UA_FIRST_NAMES = [
    "Олександр", "Іван", "Сергій", "Андрій", "Дмитро", "Михайло", "Володимир",
    "Артем", "Євген", "Ярослав", "Назар", "Максим", "Богдан", "Тарас", "Олег",
    "Олена", "Анна", "Марія", "Катерина", "Софія", "Юлія", "Наталія", "Тетяна",
    "Ірина", "Ольга", "Світлана", "Вікторія", "Дарина", "Аліна", "Поліна",
]
UA_LAST_NAMES = [
    "Шевченко", "Бондаренко", "Ткаченко", "Коваленко", "Кравченко", "Олійник",
    "Литвиненко", "Мельник", "Поліщук", "Лисенко", "Гнатюк", "Карпенко",
    "Ковальчук", "Гаврилюк", "Сидоренко", "Іваненко", "Петренко", "Маринюк",
    "Левченко", "Юрченко", "Безпалько", "Денисенко", "Кучер", "Бойко",
]
CLASS_NAMES = [
    ("Йога", "yoga"),
    ("Кросфіт", "crossfit"),
    ("Бокс", "boxing"),
    ("Пілатес", "pilates"),
    ("TRX", "trx"),
    ("Силова", "strength"),
    ("Зумба", "zumba"),
    ("Стретчинг", "stretching"),
]
CITIES = [
    ("FITGYM Бердичів", "Europe/Kyiv"),
    ("FITGYM Київ", "Europe/Kyiv"),
]


class Command(BaseCommand):
    help = "Заповнює БД насиченими демо-даними"

    def add_arguments(self, parser):
        parser.add_argument('--fresh', action='store_true',
                            help='Видалити існуючі дані перед заповненням')
        parser.add_argument('--members', type=int, default=50)
        parser.add_argument('--trainers-per-gym', type=int, default=6)
        parser.add_argument('--days', type=int, default=30,
                            help='За скільки днів назад генерувати attendance')

    def handle(self, *args, **opts):
        random.seed(42)  # детермінований seed щоб дашборд був однаковий

        if opts['fresh']:
            self.stdout.write("Очистка існуючих демо-даних...")
            Attendance.objects.all().delete()
            Booking.objects.all().delete()
            MembershipHistory.objects.all().delete()
            ClassSession.objects.all().delete()
            MembershipApplication.objects.all().delete()
            Instructor.objects.all().delete()
            Member.objects.exclude(user__is_superuser=True).delete()
            User.objects.filter(is_superuser=False).delete()
            MembershipType.objects.all().delete()
            Gym.objects.all().delete()
            Class.objects.all().delete()
            Workout.objects.all().delete()

        # ─── Workouts (категорії) ───
        for name in ["Кардіо", "Силові", "Гнучкість", "Бойові мистецтва"]:
            Workout.objects.get_or_create(name=name)

        # ─── Classes (типи занять) ───
        classes = []
        for cname, _ in CLASS_NAMES:
            c, _ = Class.objects.get_or_create(name=cname, defaults={'default_capacity': 20})
            classes.append(c)

        # ─── Gyms ───
        gyms = []
        for gname, tz in CITIES:
            g, _ = Gym.objects.get_or_create(name=gname, defaults={'timezone': tz, 'is_active': True})
            gyms.append(g)

        # ─── Тарифи для кожного залу ───
        for g in gyms:
            MembershipType.objects.get_or_create(
                gym=g, name='Місячний',
                defaults={'amount': 1500, 'period_months': 1,
                          'description': 'Стандартний доступ на 1 місяць'},
            )
            MembershipType.objects.get_or_create(
                gym=g, name='Піврічний',
                defaults={'amount': 7500, 'period_months': 6,
                          'description': 'Стандартний доступ на 6 місяців'},
            )
            MembershipType.objects.get_or_create(
                gym=g, name='Річний',
                defaults={'amount': 13000, 'period_months': 12,
                          'description': 'Стандартний доступ на 12 місяців'},
            )
            MembershipType.objects.get_or_create(
                gym=g, name='Ранковий',
                defaults={'amount': 800, 'period_months': 1,
                          'description': 'Доступ з 06:00 до 13:00',
                          'time_limit_start': time(6, 0),
                          'time_limit_end': time(13, 0)},
            )

        # ─── Інструктори ───
        instructors_per_gym = {}
        for gi, g in enumerate(gyms):
            ilist = []
            for i in range(opts['trainers_per_gym']):
                fn = random.choice(UA_FIRST_NAMES)
                ln = random.choice(UA_LAST_NAMES)
                username = f"trainer{gi + 1}_{i}"  # стабільний: trainer1_0, trainer2_5
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={'first_name': fn, 'last_name': ln, 'is_staff': False},
                )
                if created:
                    user.set_password('demo')
                    user.save()
                inst, _ = Instructor.objects.get_or_create(
                    user=user, gym=g,
                    defaults={'specialties': ', '.join(random.sample(
                        [n for n, _ in CLASS_NAMES], k=random.randint(2, 4)))},
                )
                ilist.append(inst)
            instructors_per_gym[g.pk] = ilist
        self.stdout.write(f"[ok] Створено {sum(len(v) for v in instructors_per_gym.values())} тренерів")

        # ─── Members ───
        members_per_gym = {g.pk: [] for g in gyms}
        # Round-robin розподіл по залах: гарантує що client1_0..N і client2_0..N існують
        for i in range(opts['members']):
            fn = random.choice(UA_FIRST_NAMES)
            ln = random.choice(UA_LAST_NAMES)
            gi = i % len(gyms)              # 0, 1, 0, 1, ...
            local_i = i // len(gyms)        # 0, 0, 1, 1, 2, 2, ...
            gym = gyms[gi]
            username = f"client{gi + 1}_{local_i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'first_name': fn, 'last_name': ln},
            )
            if created:
                user.set_password('demo')
                user.save()
            m, _ = Member.objects.get_or_create(
                user=user, gym=gym,
                defaults={
                    'contact': f"+38096{random.randint(1000000, 9999999)}",
                    'status': 'active',
                },
            )
            members_per_gym[gym.pk].append(m)
        self.stdout.write(f"[ok] Створено {opts['members']} клієнтів")

        # ─── MembershipHistory ───
        # Створюємо ~70% клієнтів з активними підписками, розподілено на 6 місяців
        history_count = 0
        for g in gyms:
            tariffs = list(MembershipType.objects.filter(gym=g))
            for member in members_per_gym[g.pk]:
                if random.random() < 0.7:  # 70% мають підписку
                    tariff = random.choice(tariffs)
                    # Розподіл купівлі: випадковий день за останні 180 днів
                    purchase_day = date.today() - timedelta(days=random.randint(0, 180))
                    end = date(purchase_day.year + (purchase_day.month + tariff.period_months - 1) // 12,
                               (purchase_day.month + tariff.period_months - 1) % 12 + 1,
                               min(purchase_day.day, 28))
                    MembershipHistory.objects.create(
                        member=member,
                        membership_type=tariff,
                        start_date=purchase_day,
                        end_date=end,
                        status='active' if end >= date.today() else 'expired',
                    )
                    # Симулюємо created_at = purchase_day (для revenue chart)
                    MembershipHistory.objects.filter(
                        member=member, start_date=purchase_day
                    ).update(created_at=datetime.combine(purchase_day, time(12, 0)))
                    history_count += 1
        self.stdout.write(f"[ok] Створено {history_count} MembershipHistory записів")

        # ─── ClassSessions ───
        # На сьогодні + 14 днів вперед, по 4-6 сесій на день для кожного залу
        for g in gyms:
            for day_offset in range(-7, 14):
                target = date.today() + timedelta(days=day_offset)
                hours = sorted(random.sample([8, 10, 12, 14, 16, 18, 19, 20], k=random.randint(3, 5)))
                for h in hours:
                    ct = random.choice(classes)
                    inst = random.choice(instructors_per_gym[g.pk]) if instructors_per_gym[g.pk] else None
                    start = timezone.make_aware(datetime.combine(target, time(h, 0)))
                    ClassSession.objects.get_or_create(
                        gym=g, class_type=ct, start_at=start,
                        defaults={
                            'instructor': inst,
                            'end_at': start + timedelta(hours=1),
                            'capacity': random.choice([10, 15, 20, 25]),
                        },
                    )

        sessions_count = ClassSession.objects.count()
        self.stdout.write(f"[ok] Створено {sessions_count} занять")

        # ─── Bookings ───
        booking_count = 0
        for g in gyms:
            future_sessions = ClassSession.objects.filter(
                gym=g, start_at__gte=timezone.now()
            )[:30]
            for session in future_sessions:
                # Випадкові 30-80% capacity заповнено
                fill = random.randint(int(session.capacity * 0.3), int(session.capacity * 0.8))
                bookers = random.sample(members_per_gym[g.pk],
                                        k=min(fill, len(members_per_gym[g.pk])))
                for m in bookers:
                    Booking.objects.get_or_create(
                        gym=g, session=session, member=m,
                        defaults={'status': random.choice(['booked', 'booked', 'booked', 'attended'])},
                    )
                    booking_count += 1
        self.stdout.write(f"[ok] Створено {booking_count} bookings")

        # ─── Attendance (30 днів назад) ───
        # Розподіл по годинах: ранок (8-11) — peak, обід (12-15) — низько, вечір (17-21) — peak2
        hour_weights = {
            6: 5, 7: 12, 8: 25, 9: 30, 10: 20, 11: 18,
            12: 12, 13: 10, 14: 8, 15: 10, 16: 18,
            17: 28, 18: 40, 19: 45, 20: 35, 21: 20, 22: 8,
        }
        att_count = 0
        for day_offset in range(opts['days']):
            target_date = date.today() - timedelta(days=day_offset)
            # ~30-50 attempts на день розподілено по залах
            attempts = random.randint(30, 60)
            for _ in range(attempts):
                g = random.choice(gyms)
                if not members_per_gym[g.pk]:
                    continue
                m = random.choice(members_per_gym[g.pk])
                hour = random.choices(list(hour_weights.keys()),
                                      weights=list(hour_weights.values()))[0]
                minute = random.randint(0, 59)
                ts = timezone.make_aware(datetime.combine(target_date, time(hour, minute)))
                granted = random.random() < 0.85  # 85% успіху
                reason = "Доступ дозволено" if granted else random.choice([
                    "Підписка відсутня або закінчилась",
                    "Ваш тариф діє з 06:00 до 13:00",
                    "Клієнт не знайдений у цьому залі",
                ])
                Attendance.objects.create(
                    member=m, gym=g, is_access_granted=granted, denial_reason=reason,
                )
                # Симулюємо timestamp (auto_now_add не дає вказати)
                Attendance.objects.filter(pk=Attendance.objects.last().pk).update(timestamp=ts)
                att_count += 1
        self.stdout.write(f"[ok] Створено {att_count} attendance записів")

        # ─── Applications (ліди з лендінгу) ───
        app_count = 0
        for g in gyms:
            tariffs = list(MembershipType.objects.filter(gym=g))
            for _ in range(random.randint(5, 15)):
                MembershipApplication.objects.create(
                    gym=g,
                    name=f"{random.choice(UA_FIRST_NAMES)} {random.choice(UA_LAST_NAMES)}",
                    phone=f"+38067{random.randint(1000000, 9999999)}",
                    membership_type=random.choice(tariffs),
                    status=random.choice(['new', 'new', 'in_progress', 'completed', 'cancelled']),
                )
                app_count += 1
        self.stdout.write(f"[ok] Створено {app_count} заявок")

        # ─── SUMMARY ───
        self.stdout.write(self.style.SUCCESS(
            f"\n==========================================\n"
            f"[ok] Готово!\n"
            f"  Зали:        {Gym.objects.count()}\n"
            f"  Тренери:     {Instructor.objects.count()}\n"
            f"  Клієнти:     {Member.objects.count()}\n"
            f"  Тарифи:      {MembershipType.objects.count()}\n"
            f"  Підписки:    {MembershipHistory.objects.count()}\n"
            f"  Заняття:     {ClassSession.objects.count()}\n"
            f"  Бронювання:  {Booking.objects.count()}\n"
            f"  Attendance:  {Attendance.objects.count()}\n"
            f"  Заявки:      {MembershipApplication.objects.count()}\n"
            f"\n"
            f"  Demo logins (пароль 'demo' для всіх):\n"
            f"    Клієнти:  client1_0..client1_{(opts['members']-1)//2}  (FITGYM Бердичів)\n"
            f"              client2_0..client2_{(opts['members']-1)//2}  (FITGYM Київ)\n"
            f"    Тренери:  trainer1_0..trainer1_{opts['trainers_per_gym']-1}\n"
            f"              trainer2_0..trainer2_{opts['trainers_per_gym']-1}\n"
            f"==========================================\n"
        ))
