"""
Гаманець клієнта (deposit balance).

Ендпоінти:
- GET  /api/me/wallet/                      — баланс + останні 20 транзакцій
- POST /api/me/wallet/topup/init/           — старт LiqPay-поповнення на довільну суму
- POST /api/me/wallet/topup/confirm/        — підтвердження → top_up_wallet + Payment
- POST /api/admin/members/<id>/wallet/adjust/ — ручне коригування адміном (gym-isolated)

LiqPay-частина переуживає утиліти з crm/payments.py — без дублювання логіки підпису.
order_id поповнення: FITGYM-{uuid}-wm{member_id}-a{amount_kop}
"""
from __future__ import annotations

import uuid
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import permissions, serializers
from rest_framework import status as drf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Member, Payment, WalletTransaction
from .payments import (
    DEFAULT_CURRENCY,
    LIQPAY_CHECKOUT_URL,
    LIQPAY_PUBLIC_KEY,
    LIQPAY_VERSION,
    _build_liqpay_payload,
)
from .serializers import WalletTransactionSerializer
from .services import charge_wallet, top_up_wallet
from .utils import get_gym_from_request


# ─────────────────── SERIALIZERS ───────────────────

class WalletTopUpInitSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('1'))


class WalletTopUpConfirmSerializer(serializers.Serializer):
    order_id = serializers.CharField()


class WalletAdjustSerializer(serializers.Serializer):
    # Підписана сума: > 0 — поповнення, < 0 — списання
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)


# ─────────────────── HELPERS ───────────────────

def _build_wallet_order_id(member_id: int, amount: Decimal) -> str:
    amount_kop = int((amount * 100).to_integral_value())
    return f'FITGYM-{uuid.uuid4().hex[:12]}-wm{member_id}-a{amount_kop}'


def _parse_wallet_order_id(order_id: str) -> tuple[int, Decimal]:
    """Повертає (member_id, amount). Кидає ValueError якщо формат невалідний."""
    parts = order_id.split('-')
    member_part = next(p for p in parts if p.startswith('wm'))
    amount_part = next(p for p in parts if p.startswith('a') and p[1:].isdigit())
    member_id = int(member_part[2:])
    amount = Decimal(int(amount_part[1:])) / Decimal('100')
    return member_id, amount


# ─────────────────── VIEWS ───────────────────

class WalletDetailView(APIView):
    """GET /api/me/wallet/ → {balance, transactions: [...останні 20]}"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request) -> Response:
        member = Member.objects.filter(user=request.user).first()
        if member is None:
            return Response(
                {'error': 'Гаманець доступний лише клієнтам клубу.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )
        txns = member.wallet_transactions.all()[:20]
        return Response({
            'balance': member.deposit_balance,
            'transactions': WalletTransactionSerializer(txns, many=True).data,
        })


class WalletTopUpInitView(APIView):
    """
    POST /api/me/wallet/topup/init/  { "amount": 150.00 }
    → { order_id, amount, checkout_url, data, signature }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        s = WalletTopUpInitSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        amount: Decimal = s.validated_data['amount']

        member = Member.objects.filter(user=request.user).first()
        if member is None:
            return Response(
                {'error': 'Поповнювати гаманець можуть лише клієнти клубу.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        order_id = _build_wallet_order_id(member.pk, amount)
        result_url = request.build_absolute_uri(
            f'/api/membership/checkout/result/?order_id={order_id}'
        )
        params = {
            'public_key': LIQPAY_PUBLIC_KEY,
            'version': LIQPAY_VERSION,
            'action': 'pay',
            'amount': float(amount),
            'currency': DEFAULT_CURRENCY,
            'description': f'FITGYM · Поповнення гаманця на {amount} {DEFAULT_CURRENCY}',
            'order_id': order_id,
            'language': 'uk',
            'sandbox': '1',
            'result_url': result_url,
        }
        payload = _build_liqpay_payload(params)
        checkout_url = (
            f'{LIQPAY_CHECKOUT_URL}?data={payload["data"]}'
            f'&signature={payload["signature"]}'
        )
        return Response({
            'order_id': order_id,
            'amount': float(amount),
            'currency': DEFAULT_CURRENCY,
            'description': params['description'],
            'checkout_url': checkout_url,
            'data': payload['data'],
            'signature': payload['signature'],
        })


class WalletTopUpConfirmView(APIView):
    """
    POST /api/me/wallet/topup/confirm/  { "order_id": "FITGYM-...-wm5-a15000" }
    → { success, balance, amount }

    Sandbox: довіряємо що клієнт повернувся з LiqPay (як у LiqPayCheckoutConfirmView).
    Anti-double-spend через gateway_transaction_id=order_id.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        s = WalletTopUpConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        order_id = s.validated_data['order_id']

        try:
            member_id, amount = _parse_wallet_order_id(order_id)
        except (StopIteration, ValueError, InvalidOperation):
            return Response(
                {'error': 'Невалідний order_id.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(pk=member_id)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Клієнта не знайдено.'},
                status=drf_status.HTTP_404_NOT_FOUND,
            )

        if member.user_id != request.user.id and not request.user.is_superuser:
            return Response(
                {'error': 'Ви не можете підтверджувати чуже поповнення.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        if WalletTransaction.objects.filter(gateway_transaction_id=order_id).exists():
            return Response({
                'success': True,
                'duplicate': True,
                'balance': member.deposit_balance,
            })

        txn = top_up_wallet(
            member, amount, kind='topup',
            description='Поповнення через LiqPay',
            gateway_id=order_id,
        )
        Payment.objects.create(
            gym=member.gym,
            member=member,
            amount=amount,
            payment_method='online',
            status='completed',
            gateway_transaction_id=order_id,
        )
        return Response({
            'success': True,
            'amount': float(amount),
            'balance': txn.balance_after,
        })


class AdminWalletAdjustView(APIView):
    """
    POST /api/admin/members/<member_id>/wallet/adjust/
    { "amount": 200.00, "description": "Компенсація" }   # від'ємна — списання

    IsGymStaff + gym-isolation: адмін коригує лише клієнтів свого залу.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, member_id: int) -> Response:
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Доступ лише для персоналу залу.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        s = WalletAdjustSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        amount: Decimal = s.validated_data['amount']
        description = s.validated_data.get('description', '') or 'Коригування адміном'

        gym = get_gym_from_request(request)
        qs = Member.objects.all()
        if gym is not None:
            qs = qs.filter(gym=gym)
        try:
            member = qs.get(pk=member_id)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Клієнта не знайдено у вашому залі.'},
                status=drf_status.HTTP_404_NOT_FOUND,
            )

        if amount == 0:
            return Response(
                {'error': 'Сума коригування не може бути нульовою.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        try:
            if amount > 0:
                txn = top_up_wallet(member, amount, kind='adjust', description=description)
            else:
                txn = charge_wallet(member, -amount, kind='adjust', description=description)
        except DjangoValidationError as exc:
            return Response(
                {'error': exc.messages[0] if exc.messages else 'Помилка коригування.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            'success': True,
            'balance': txn.balance_after,
        }, status=drf_status.HTTP_200_OK)
