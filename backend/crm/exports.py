"""
CSV exports для адмін-панелі.

Доступні з gym-isolation:
  GET /api/admin/export/members.csv     — список клієнтів + статус підписки
  GET /api/admin/export/attendance.csv  — журнал check-in
  GET /api/admin/export/revenue.csv     — продажі абонементів за період
"""
from __future__ import annotations

import csv
from datetime import datetime, date, timedelta

from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import Attendance, Member, MembershipHistory
from .permissions import IsGymStaff
from .utils import get_gym_from_request


def _csv_response(filename: str) -> HttpResponse:
    """Готує HttpResponse з UTF-8 BOM (щоб Excel правильно відкривав кирилицю)."""
    resp = HttpResponse(content_type='text/csv; charset=utf-8')
    resp['Content-Disposition'] = f'attachment; filename="{filename}"'
    resp.write('﻿')  # BOM для Excel
    return resp


def _gym_filter(qs, gym_id):
    return qs.filter(gym=gym_id) if gym_id else qs


class ExportMembersCSV(APIView):
    """GET /api/admin/export/members.csv"""
    permission_classes = [IsAuthenticated, IsGymStaff]

    def get(self, request):
        gym_id = get_gym_from_request(request)
        members = (_gym_filter(Member.objects, gym_id)
                   .select_related('user', 'gym')
                   .order_by('user__last_name', 'user__first_name'))

        resp = _csv_response(f'members_{date.today().isoformat()}.csv')
        writer = csv.writer(resp, delimiter=';')
        writer.writerow([
            'ID', 'Прізвище', 'Ім\'я', 'Username', 'Контакт',
            'Стать', 'Дата народження', 'Зал', 'Статус', 'Створено',
            'Активний абонемент', 'До дати',
        ])

        for m in members:
            active = MembershipHistory.objects.filter(
                member=m, status='active', end_date__gte=date.today(),
            ).select_related('membership_type').order_by('-end_date').first()
            writer.writerow([
                m.pk,
                m.user.last_name,
                m.user.first_name,
                m.user.username,
                m.contact or '',
                m.gender or '',
                m.birth_date.isoformat() if m.birth_date else '',
                m.gym.name if m.gym else '',
                m.status,
                m.created_at.strftime('%Y-%m-%d %H:%M'),
                active.membership_type.name if active else '',
                active.end_date.strftime('%d.%m.%Y') if active else '',
            ])
        return resp


class ExportAttendanceCSV(APIView):
    """
    GET /api/admin/export/attendance.csv?from=YYYY-MM-DD&to=YYYY-MM-DD

    Без параметрів — за останні 30 днів.
    """
    permission_classes = [IsAuthenticated, IsGymStaff]

    def get(self, request):
        gym_id = get_gym_from_request(request)
        d_from = request.GET.get('from')
        d_to = request.GET.get('to')

        try:
            date_from = datetime.fromisoformat(d_from).date() if d_from \
                else date.today() - timedelta(days=30)
            date_to = datetime.fromisoformat(d_to).date() if d_to else date.today()
        except ValueError:
            return HttpResponse('Невалідні параметри from/to (потрібен формат YYYY-MM-DD)',
                                status=400, content_type='text/plain; charset=utf-8')

        qs = (_gym_filter(Attendance.objects, gym_id)
              .filter(timestamp__date__gte=date_from, timestamp__date__lte=date_to)
              .select_related('member__user', 'gym')
              .order_by('-timestamp'))

        resp = _csv_response(f'attendance_{date_from}_{date_to}.csv')
        writer = csv.writer(resp, delimiter=';')
        writer.writerow([
            'Дата', 'Час', 'Клієнт', 'Username', 'Зал',
            'Доступ', 'Причина відмови',
        ])
        for a in qs:
            user = a.member.user if a.member_id else None
            writer.writerow([
                a.timestamp.strftime('%Y-%m-%d'),
                a.timestamp.strftime('%H:%M:%S'),
                user.get_full_name() if user else '',
                user.username if user else '',
                a.gym.name if a.gym else '',
                'Так' if a.is_access_granted else 'Ні',
                a.denial_reason,
            ])
        return resp


class ExportRevenueCSV(APIView):
    """
    GET /api/admin/export/revenue.csv?from=YYYY-MM-DD&to=YYYY-MM-DD

    Без параметрів — за останні 6 місяців.
    """
    permission_classes = [IsAuthenticated, IsGymStaff]

    def get(self, request):
        gym_id = get_gym_from_request(request)
        d_from = request.GET.get('from')
        d_to = request.GET.get('to')

        try:
            date_from = (datetime.fromisoformat(d_from).date() if d_from
                         else date.today() - timedelta(days=180))
            date_to = datetime.fromisoformat(d_to).date() if d_to else date.today()
        except ValueError:
            return HttpResponse('Невалідні параметри from/to (формат YYYY-MM-DD)',
                                status=400, content_type='text/plain; charset=utf-8')

        member_ids = list(_gym_filter(Member.objects, gym_id).values_list('id', flat=True))
        qs = (MembershipHistory.objects
              .filter(member_id__in=member_ids,
                      created_at__date__gte=date_from,
                      created_at__date__lte=date_to)
              .select_related('member__user', 'membership_type')
              .order_by('-created_at'))

        resp = _csv_response(f'revenue_{date_from}_{date_to}.csv')
        writer = csv.writer(resp, delimiter=';')
        writer.writerow([
            'Дата', 'Клієнт', 'Username', 'Тариф', 'Сума (₴)',
            'Період', 'З дати', 'До дати',
        ])
        total = 0
        for h in qs:
            writer.writerow([
                h.created_at.strftime('%Y-%m-%d'),
                h.member.user.get_full_name() or h.member.user.username,
                h.member.user.username,
                h.membership_type.name,
                f'{int(h.membership_type.amount)}',
                f'{h.membership_type.period_months} міс.',
                h.start_date.isoformat(),
                h.end_date.isoformat(),
            ])
            total += int(h.membership_type.amount)
        writer.writerow([])
        writer.writerow(['', '', '', 'РАЗОМ:', f'{total} ₴', '', '', ''])
        return resp
