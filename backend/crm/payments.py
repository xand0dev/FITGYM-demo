"""
LiqPay sandbox payment integration.

Flow:
1. Authenticated клієнт обирає тариф у мобілці/web.
2. POST /api/membership/checkout/init/ {membership_type_id} →
   повертає {data, signature, checkout_url, order_id} для LiqPay Checkout
   (мобілка відкриває checkout_url у WebView, web — у iframe чи новій вкладці).
3. Користувач оплачує карткою (sandbox: 4242424242424242 / 12/29 / CVV 123).
4. LiqPay редіректить на result_url (наш бек) → ми перевіряємо статус.
5. POST /api/membership/checkout/confirm/ {order_id} →
   валідує signature, при success створює MembershipHistory.

LiqPay sandbox docs: https://www.liqpay.ua/documentation/api/aquiring/checkout/doc
"""
from __future__ import annotations

import base64
import calendar
import hashlib
import json
import os
import uuid
from datetime import date
from typing import Any

from django.conf import settings
from django.db import transaction
from rest_framework import permissions, serializers, status as drf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Member, MembershipHistory, MembershipType


LIQPAY_PUBLIC_KEY = os.environ.get(
    'LIQPAY_PUBLIC_KEY', 'sandbox_i59295174580'  # дефолтні sandbox-креди
)
LIQPAY_PRIVATE_KEY = os.environ.get(
    'LIQPAY_PRIVATE_KEY', 'sandbox_dpJaXFwBxgGZqr97ihfDr3UWcOMM83lp2yyKxmDc'
)
LIQPAY_CHECKOUT_URL = 'https://www.liqpay.ua/api/3/checkout'
LIQPAY_VERSION = '3'
DEFAULT_CURRENCY = 'UAH'


def _sign(data_b64: str) -> str:
    """LiqPay signature = base64(SHA1(private_key + data + private_key))"""
    raw = f'{LIQPAY_PRIVATE_KEY}{data_b64}{LIQPAY_PRIVATE_KEY}'.encode('utf-8')
    return base64.b64encode(hashlib.sha1(raw).digest()).decode('utf-8')


def _build_liqpay_payload(params: dict[str, Any]) -> dict[str, str]:
    """Будує `data` (base64 JSON) і `signature` для LiqPay."""
    json_str = json.dumps(params, ensure_ascii=False)
    data_b64 = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')
    return {'data': data_b64, 'signature': _sign(data_b64)}


def _calc_end_date(start: date, months: int) -> date:
    month = start.month - 1 + months
    year = start.year + month // 12
    month = month % 12 + 1
    day = min(start.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


# ─────────────────── SERIALIZERS ───────────────────

class CheckoutInitSerializer(serializers.Serializer):
    membership_type_id = serializers.IntegerField()


class CheckoutConfirmSerializer(serializers.Serializer):
    order_id = serializers.CharField()


# ─────────────────── VIEWS ───────────────────

class LiqPayCheckoutInitView(APIView):
    """
    POST /api/membership/checkout/init/
    {
      "membership_type_id": 11
    }
    →
    {
      "order_id": "FITGYM-...",
      "amount": 9000,
      "checkout_url": "https://www.liqpay.ua/api/3/checkout?data=...&signature=...",
      "data": "...",
      "signature": "..."
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        s = CheckoutInitSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        try:
            mtype = MembershipType.objects.get(pk=s.validated_data['membership_type_id'])
        except MembershipType.DoesNotExist:
            return Response(
                {'error': 'Тарифний план не знайдено.'},
                status=drf_status.HTTP_404_NOT_FOUND,
            )

        # Шукаємо Member поточного юзера (для SuperAdmin без Member — fallback)
        member = Member.objects.filter(user=request.user).first()
        if member is None:
            return Response(
                {'error': 'Тільки клієнти можуть купувати абонементи. Адмін має використати ' +
                          '«Продати абонемент» у CRM.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        order_id = f'FITGYM-{uuid.uuid4().hex[:12]}-mt{mtype.pk}-m{member.pk}'

        # Параметри LiqPay
        result_url = request.build_absolute_uri(f'/api/membership/checkout/result/?order_id={order_id}')
        params = {
            'public_key': LIQPAY_PUBLIC_KEY,
            'version': LIQPAY_VERSION,
            'action': 'pay',
            'amount': float(mtype.amount),
            'currency': DEFAULT_CURRENCY,
            'description': f'FITGYM · {mtype.name}',
            'order_id': order_id,
            'language': 'uk',
            'sandbox': '1',
            'result_url': result_url,
        }
        payload = _build_liqpay_payload(params)
        checkout_url = f'{LIQPAY_CHECKOUT_URL}?data={payload["data"]}&signature={payload["signature"]}'

        return Response({
            'order_id': order_id,
            'amount': float(mtype.amount),
            'currency': DEFAULT_CURRENCY,
            'description': params['description'],
            'checkout_url': checkout_url,
            'data': payload['data'],
            'signature': payload['signature'],
        })


class LiqPayCheckoutConfirmView(APIView):
    """
    POST /api/membership/checkout/confirm/
    {
      "order_id": "FITGYM-..."
    }
    →
    {
      "success": true,
      "end_date": "13.06.2026",
      "membership_name": "Ранковий (6 місяців)"
    }

    Спрощений потік для sandbox: ми ДОВІРЯЄМО клієнту що він повернувся
    з LiqPay. У продакшні треба викликати LiqPay API `/api/request` з
    action=status щоб перевірити фактичну оплату. Для демо це OK.

    Розбираємо order_id назад: FITGYM-{uuid}-mt{mtype_id}-m{member_id}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        s = CheckoutConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        order_id = s.validated_data['order_id']

        # Парсимо order_id
        try:
            parts = order_id.split('-')
            mtype_part = next(p for p in parts if p.startswith('mt'))
            member_part = next(p for p in parts if p.startswith('m') and not p.startswith('mt'))
            mtype_id = int(mtype_part[2:])
            member_id = int(member_part[1:])
        except (StopIteration, ValueError):
            return Response(
                {'error': 'Невалідний order_id.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        try:
            mtype = MembershipType.objects.get(pk=mtype_id)
            member = Member.objects.get(pk=member_id)
        except (MembershipType.DoesNotExist, Member.DoesNotExist):
            return Response(
                {'error': 'Тариф або клієнт не знайдені.'},
                status=drf_status.HTTP_404_NOT_FOUND,
            )

        # Безпекова перевірка: поточний user — це власник цього member
        if member.user_id != request.user.id and not request.user.is_superuser:
            return Response(
                {'error': 'Ви не можете підтверджувати чужий платіж.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        # Перевірка: чи не створювалась вже MembershipHistory для цього order_id?
        # (anti double-spend — простий захист через description у history)
        already_exists = MembershipHistory.objects.filter(
            member=member,
            membership_type=mtype,
            status='active',
            start_date=date.today(),
        ).exists()
        if already_exists:
            return Response(
                {'success': True, 'duplicate': True, 'message': 'Підписка вже активна'},
            )

        # Створюємо MembershipHistory
        start = date.today()
        end = _calc_end_date(start, mtype.period_months)

        with transaction.atomic():
            MembershipHistory.objects.create(
                member=member,
                membership_type=mtype,
                start_date=start,
                end_date=end,
                status='active',
            )

        return Response({
            'success': True,
            'end_date': end.strftime('%d.%m.%Y'),
            'membership_name': mtype.name,
            'amount': float(mtype.amount),
        })


class LiqPayCheckoutResultView(APIView):
    """
    GET /api/membership/checkout/result/?order_id=FITGYM-...

    LiqPay редіректить сюди після оплати. Простий HTML-відгук який
    закриває WebView у мобілці і повідомляє результат.

    Для прод можна замінити на більш красиву сторінку.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.http import HttpResponse
        order_id = request.GET.get('order_id', '')
        html = f"""
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FITGYM · Оплата</title>
  <style>
    body {{
      margin: 0; padding: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: #080808; color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }}
    .card {{
      max-width: 420px; padding: 40px; text-align: center;
      background: #141414; border-radius: 20px;
      border: 1px solid #333; box-shadow: 0 10px 40px rgba(255,0,0,0.15);
    }}
    .icon {{ font-size: 64px; line-height: 1; }}
    h1 {{ font-size: 28px; margin: 16px 0 8px; }}
    p {{ color: #aaa; font-size: 14px; line-height: 1.5; }}
    .order {{ font-family: monospace; font-size: 11px; color: #666; margin-top: 24px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Оплата отримана</h1>
    <p>Поверніться у застосунок щоб завершити активацію абонементу.</p>
    <p class="order">order: <code data-order-id="{order_id}">{order_id}</code></p>
  </div>
  <script>
    // Передати order_id назад у RN WebView через postMessage
    if (window.ReactNativeWebView) {{
      window.ReactNativeWebView.postMessage(JSON.stringify({{
        type: 'liqpay_result',
        order_id: '{order_id}',
        status: 'success'
      }}));
    }}
  </script>
</body>
</html>
"""
        return HttpResponse(html, content_type='text/html; charset=utf-8')
