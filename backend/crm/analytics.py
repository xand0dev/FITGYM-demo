"""
Admin analytics endpoint — aggregated metrics for Dashboard.
GET /api/admin/analytics/

Returns all chart data + summary metrics in a single response, filtered by
the current user's gym (multi-tenancy safe).
"""
from __future__ import annotations

from collections import OrderedDict
from datetime import datetime, timedelta
from typing import Any

from django.db.models import Count, Sum, Q, F, DecimalField, Value
from django.db.models.functions import Coalesce, TruncDate, TruncMonth, TruncHour
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Attendance,
    Booking,
    Member,
    Instructor,
    MembershipHistory,
)
from .permissions import IsGymStaff
from .utils import get_gym_from_request


UA_WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
UA_MONTHS = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер",
             "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"]


class AdminAnalyticsView(APIView):
    """GET /api/admin/analytics/ — all Dashboard metrics in one call."""
    permission_classes = [IsAuthenticated, IsGymStaff]

    def get(self, request) -> Response:
        gym_id = get_gym_from_request(request)
        now = timezone.now()
        today = now.date()
        seven_days_ago = today - timedelta(days=6)
        six_months_ago_start = (now.replace(day=1) - timedelta(days=180)).replace(day=1)

        # Базовий фільтр для всіх QuerySets — ізоляція по залу.
        # gym_id може бути None для SuperAdmin → бачить усе.
        def _gym_filter(model_qs):
            if gym_id is None:
                return model_qs
            return model_qs.filter(gym=gym_id)

        # ── 1. SUMMARY ────────────────────────────────────────────────────────
        active_clients = _gym_filter(Member.objects).filter(status='active').count()
        trainers_active = _gym_filter(Instructor.objects).count()

        # Активні підписки = MembershipHistory де end_date >= today
        active_member_ids = _gym_filter(Member.objects).values_list('id', flat=True)
        active_subscriptions = (
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids,
                    end_date__gte=today,
                    status='active')
            .count()
        )

        # Виручка за поточний місяць (за created_at MembershipHistory * amount)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        revenue_month = (
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids,
                    created_at__gte=month_start)
            .aggregate(total=Coalesce(
                Sum(F('membership_type__amount'), output_field=DecimalField()),
                Value(0, output_field=DecimalField()),
            ))
        )['total']

        # Виручка за минулий місяць — для розрахунку зміни %
        prev_month_end = month_start
        prev_month_start = (prev_month_end - timedelta(days=1)).replace(day=1)
        revenue_prev_month = (
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids,
                    created_at__gte=prev_month_start,
                    created_at__lt=prev_month_end)
            .aggregate(total=Coalesce(
                Sum(F('membership_type__amount'), output_field=DecimalField()),
                Value(0, output_field=DecimalField()),
            ))
        )['total']

        revenue_change_pct = 0
        if revenue_prev_month and float(revenue_prev_month) > 0:
            revenue_change_pct = round(
                (float(revenue_month) - float(revenue_prev_month))
                / float(revenue_prev_month) * 100
            )

        # Нові підписки за останній тиждень
        week_ago = now - timedelta(days=7)
        new_subscriptions_week = (
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids, created_at__gte=week_ago)
            .count()
        )
        new_subscriptions_prev_week = (
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids,
                    created_at__gte=week_ago - timedelta(days=7),
                    created_at__lt=week_ago)
            .count()
        )
        new_subs_change_pct = 0
        if new_subscriptions_prev_week > 0:
            new_subs_change_pct = round(
                (new_subscriptions_week - new_subscriptions_prev_week)
                / new_subscriptions_prev_week * 100
            )

        # "Зараз у залі" — успішних check-ins сьогодні
        in_gym_today = (
            _gym_filter(Attendance.objects)
            .filter(timestamp__date=today, is_access_granted=True)
            .values('member_id').distinct().count()
        )

        # ── 2. ATTENDANCE 7 ДНІВ ──────────────────────────────────────────────
        attendance_by_day = (
            _gym_filter(Attendance.objects)
            .filter(timestamp__date__gte=seven_days_ago,
                    is_access_granted=True)
            .annotate(day=TruncDate('timestamp'))
            .values('day')
            .annotate(visits=Count('id'))
            .order_by('day')
        )
        attendance_map = {item['day']: item['visits'] for item in attendance_by_day}
        attendance_7days = []
        for i in range(7):
            d = seven_days_ago + timedelta(days=i)
            attendance_7days.append({
                "day": UA_WEEKDAYS[d.weekday()],
                "visits": attendance_map.get(d, 0),
            })

        # ── 3. ПОПУЛЯРНІ ЗАНЯТТЯ (Top 4 by bookings) ─────────────────────────
        popular_classes_qs = (
            _gym_filter(Booking.objects)
            .filter(status__in=['booked', 'attended'])
            .values('session__class_type__name')
            .annotate(value=Count('id'))
            .order_by('-value')[:4]
        )
        popular_classes = [
            {"name": row['session__class_type__name'] or "Невідомо",
             "value": row['value']}
            for row in popular_classes_qs
        ] or [
            # Fallback якщо немає bookings — порожній стан
            {"name": "Немає бронювань", "value": 1},
        ]

        # ── 4. ПІКОВІ ГОДИНИ СЬОГОДНІ ─────────────────────────────────────────
        peak_today = (
            _gym_filter(Attendance.objects)
            .filter(timestamp__date=today, is_access_granted=True)
            .annotate(hour=TruncHour('timestamp'))
            .values('hour')
            .annotate(users=Count('id'))
            .order_by('hour')
        )
        peak_map = {item['hour'].hour: item['users'] for item in peak_today}
        # Показуємо стандартний робочий діапазон з 2-годинним кроком
        peak_hours_today = [
            {"hour": f"{h:02d}:00", "users": peak_map.get(h, 0)}
            for h in (8, 10, 12, 14, 16, 18, 20, 22)
        ]

        # ── 5. ВИРУЧКА 6 МІСЯЦІВ ──────────────────────────────────────────────
        revenue_by_month = (
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids,
                    created_at__gte=six_months_ago_start)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(rev=Coalesce(
                Sum(F('membership_type__amount'), output_field=DecimalField()),
                Value(0, output_field=DecimalField()),
            ))
            .order_by('month')
        )
        revenue_map = {
            (item['month'].year, item['month'].month): float(item['rev'] or 0) / 1000.0
            for item in revenue_by_month
        }
        revenue_6months = []
        cursor = now.replace(day=1)
        # Йдемо 6 місяців назад
        months_back = []
        for _ in range(6):
            months_back.append(cursor)
            # Перший день попереднього місяця
            prev = (cursor - timedelta(days=1)).replace(day=1)
            cursor = prev
        for m in reversed(months_back):
            revenue_6months.append({
                "month": UA_MONTHS[m.month - 1],
                "rev": round(revenue_map.get((m.year, m.month), 0), 1),
            })

        # ── 6. ОСТАННІ ПОДІЇ ─────────────────────────────────────────────────
        # Беремо мікс: нові підписки + check-ins + апплікації (5 шт усього)
        recent_subs = list(
            MembershipHistory.objects
            .filter(member_id__in=active_member_ids)
            .select_related('member__user', 'membership_type')
            .order_by('-created_at')[:3]
            .values('id', 'created_at',
                    'member__user__first_name', 'member__user__last_name',
                    'member__user__username',
                    'membership_type__name', 'membership_type__amount')
        )
        recent_apps = list(
            _gym_filter(Booking.objects)
            .filter(status='cancelled')
            .select_related('session__class_type', 'member__user')
            .order_by('-booked_at')[:2]
            .values('id', 'booked_at', 'session__class_type__name',
                    'member__user__first_name', 'member__user__last_name')
        )

        def fmt_time(dt) -> str:
            delta = now - dt
            seconds = int(delta.total_seconds())
            if seconds < 60:
                return "щойно"
            if seconds < 3600:
                return f"{seconds // 60} хв тому"
            if seconds < 86400:
                return f"{seconds // 3600} год тому"
            return f"{seconds // 86400} дн тому"

        recent_activities: list[dict[str, Any]] = []
        for s in recent_subs:
            name = (f"{s['member__user__first_name']} {s['member__user__last_name']}").strip() \
                   or s['member__user__username']
            recent_activities.append({
                "id": f"sub-{s['id']}",
                "text": f"Нова підписка: {name}",
                "subtext": f"{s['membership_type__name']} · {int(s['membership_type__amount'])} ₴",
                "time": fmt_time(s['created_at']),
                "type": "subscription",
            })
        for b in recent_apps:
            name = (f"{b['member__user__first_name']} {b['member__user__last_name']}").strip() or "Клієнт"
            recent_activities.append({
                "id": f"cancel-{b['id']}",
                "text": f"Скасування броні: {b['session__class_type__name']}",
                "subtext": name,
                "time": fmt_time(b['booked_at']),
                "type": "cancellation",
            })
        # Сортуємо по часу (хв тому → менше число) — heuristic: subs частіше йдуть першими
        recent_activities = recent_activities[:5]

        return Response({
            "summary": {
                "active_clients": active_clients,
                "trainers_active": trainers_active,
                "active_subscriptions": active_subscriptions,
                "revenue_month": float(revenue_month or 0),
                "revenue_change_pct": revenue_change_pct,
                "new_subscriptions_week": new_subscriptions_week,
                "new_subs_change_pct": new_subs_change_pct,
                "in_gym_today": in_gym_today,
            },
            "attendance_7days": attendance_7days,
            "popular_classes": popular_classes,
            "peak_hours_today": peak_hours_today,
            "revenue_6months": revenue_6months,
            "recent_activities": recent_activities,
        })
