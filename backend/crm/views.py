# crm/views.py

from rest_framework import viewsets, permissions, generics, mixins
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone

from .permissions import IsAdminUser, IsGymStaff
from .utils import get_gym_from_request

from rest_framework import status as drf_status

from .models import (
    Workout, Instructor, ClassSession, MembershipType,
    Member, Booking, MembershipHistory, Class, MembershipApplication, Attendance,
    TelegramLink, DeviceToken,
)
from .serializers import (
    WorkoutSerializer, InstructorSerializer, ClassSessionSerializer,
    MembershipTypeSerializer, RegisterSerializer, MemberSerializer,
    BookingSerializer, BookingCreateSerializer, AdminClassSessionSerializer,
    ClassSerializer, AdminInstructorSerializer, AdminMemberSerializer,
    MembershipApplicationSerializer, AdminMembershipApplicationSerializer,
    AccessCheckSerializer, AccessResultSerializer, MembershipAssignSerializer,
    AttendanceSerializer, DeviceTokenSerializer,
)
from .serializers import GymInviteCreateSerializer, GymInviteAcceptSerializer
from .services import (
    check_client_access, create_gym_invite, get_valid_invite, accept_gym_invite,
)
from django.core.exceptions import ValidationError as DjangoValidationError

from django.core.cache import cache
from rest_framework.authtoken.views import ObtainAuthToken


# ─── RATE-LIMITED LOGIN ───────────────────────────────────────────────────────

class RateLimitedObtainAuthToken(ObtainAuthToken):
    """
    Cache-based rate limit на /api/login/ для захисту від brute-force.

    Логіка:
    - 5 невдалих спроб з одного IP за 5 хвилин → блокування на 5 хвилин
    - Успішний логін очищує лічильник для IP
    """
    MAX_ATTEMPTS = 5
    WINDOW_SEC = 300  # 5 хвилин

    def _client_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR', 'unknown')

    def post(self, request, *args, **kwargs):
        from rest_framework.exceptions import ValidationError

        ip = self._client_ip(request)
        cache_key = f'login_fail:{ip}'
        attempts = cache.get(cache_key, 0)

        if attempts >= self.MAX_ATTEMPTS:
            return Response(
                {'error': 'Забагато невдалих спроб входу. Спробуйте через 5 хвилин.'},
                status=drf_status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            response = super().post(request, *args, **kwargs)
            success = (response.status_code == 200)
        except ValidationError:
            success = False
            raise  # повторно — DRF сам сформує 400
        finally:
            if success:
                cache.delete(cache_key)
            else:
                cache.set(cache_key, attempts + 1, timeout=self.WINDOW_SEC)

        return response


# --- ПУБЛІЧНІ VIEWS ---

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.AllowAny]


class ClassViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.AllowAny]


class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InstructorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        gym_id = self.request.query_params.get('gym_id')
        if gym_id:
            return Instructor.objects.filter(gym_id=gym_id)
        return Instructor.objects.all()


class MembershipTypeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        gym_id = self.request.query_params.get('gym_id')
        if gym_id:
            return MembershipType.objects.filter(gym_id=gym_id)
        return MembershipType.objects.all()


class ClassSessionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        gym_id = self.request.query_params.get('gym_id')
        qs = ClassSession.objects.all().order_by('start_at')
        if gym_id:
            qs = qs.filter(gym_id=gym_id)
        return qs


class MembershipApplicationCreateView(generics.CreateAPIView):
    """(POST) /api/apply/ - Відправка заявки на абонемент з лендінгу"""
    queryset = MembershipApplication.objects.all()
    serializer_class = MembershipApplicationSerializer
    permission_classes = [permissions.AllowAny]


# --- AUTH VIEWS ---

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=request.data['username'])
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'name': user.first_name
        }, status=201)


class MeView(APIView):
    """(GET) /api/me/ - Універсальний профіль для ВСІХ типів користувачів"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name() or user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'active_membership': None,
            'member_id': None,
            'gym_id': None,
            'gym_name': None,
            'deposit_balance': None,
        }

        if hasattr(user, 'member'):
            member = user.member
            data.update({
                'contact': member.contact,
                'gender': member.gender,
                'birth_date': member.birth_date,
                'status': member.status,
                'member_id': member.id,
                'gym_id': member.gym_id,
                'gym_name': member.gym.name if member.gym else None,
                'deposit_balance': member.deposit_balance,
            })

            today = timezone.now().date()
            active = member.membershiphistory_set.filter(
                status='active',
                start_date__lte=today,
                end_date__gte=today
            ).order_by('-end_date').first()

            if active:
                data['active_membership'] = {
                    "name": active.membership_type.name,
                    "end_date": active.end_date.strftime("%d.%m.%Y")
                }

        elif hasattr(user, 'instructor'):
            instructor = user.instructor
            data.update({
                'contact': instructor.contact,
                'specialties': instructor.specialties,
                'gym_id': instructor.gym_id,
                'gym_name': instructor.gym.name if instructor.gym else None,
            })

        return Response(data)


class MyBookingsViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(member__user=self.request.user).order_by('-booked_at')


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        session = serializer.validated_data.get('session')
        try:
            member = Member.objects.get(user=self.request.user)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Профіль Member не знайдено.")

        if Booking.objects.filter(member=member, session=session).exists():
            raise serializers.ValidationError("Ви вже записані на це заняття.")

        if Booking.objects.filter(session=session).count() >= session.capacity:
            raise serializers.ValidationError("На жаль, на це заняття вже немає вільних місць.")

        session_date = session.start_at.date()
        if not MembershipHistory.objects.filter(member=member, status='active', start_date__lte=session_date,
                                                end_date__gte=session_date).exists():
            raise serializers.ValidationError("У вас немає активного абонемента на дату проведення цього заняття.")

        serializer.save(member=member)


# --- АДМІНСЬКІ VIEWS ---

class AdminClassSessionViewSet(viewsets.ModelViewSet):
    serializer_class = AdminClassSessionSerializer
    permission_classes = [IsGymStaff]

    def get_queryset(self):
        gym = get_gym_from_request(self.request)
        if gym:
            return ClassSession.objects.filter(gym=gym).order_by('-start_at')
        # superuser бачить всі
        return ClassSession.objects.all().order_by('-start_at')


class AdminMemberViewSet(viewsets.ModelViewSet):
    serializer_class = AdminMemberSerializer
    permission_classes = [IsGymStaff]

    def get_queryset(self):
        gym = get_gym_from_request(self.request)
        if gym:
            return Member.objects.filter(gym=gym).order_by('-id')
        return Member.objects.all().order_by('-id')


class AdminInstructorViewSet(viewsets.ModelViewSet):
    serializer_class = AdminInstructorSerializer
    permission_classes = [IsGymStaff]

    def get_queryset(self):
        gym = get_gym_from_request(self.request)
        if gym:
            return Instructor.objects.filter(gym=gym).order_by('id')
        return Instructor.objects.all().order_by('id')


class AdminMembershipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = AdminMembershipApplicationSerializer
    permission_classes = [IsGymStaff]

    def get_queryset(self):
        gym = get_gym_from_request(self.request)
        if gym:
            return MembershipApplication.objects.filter(gym=gym).order_by('-created_at')
        return MembershipApplication.objects.all().order_by('-created_at')


# --- ATTENDANCE LOG ---

class AdminAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/admin/attendance/ — журнал усіх check-in спроб по gym.
    Read-only: аудит-лог не редагується.
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsGymStaff]

    def get_queryset(self):
        gym = get_gym_from_request(self.request)
        qs = Attendance.objects.select_related('member__user')
        if gym:
            qs = qs.filter(gym=gym)
        return qs.order_by('-timestamp')


# --- ASSIGN MEMBERSHIP ---

class MembershipAssignView(APIView):
    """
    POST /api/admin/memberships/assign/
    Продає абонемент клієнту: створює MembershipHistory з today → today + period_months.
    Доступно тільки staff/superuser (IsGymStaff).
    """
    permission_classes = [IsGymStaff]

    def post(self, request) -> Response:
        from datetime import date
        import calendar

        serializer = MembershipAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        member_id = serializer.validated_data['member_id']
        membership_type_id = serializer.validated_data['membership_type_id']

        try:
            member = Member.objects.get(pk=member_id)
        except Member.DoesNotExist:
            return Response({'error': 'Клієнта не знайдено.'}, status=drf_status.HTTP_404_NOT_FOUND)

        try:
            membership_type = MembershipType.objects.get(pk=membership_type_id)
        except MembershipType.DoesNotExist:
            return Response({'error': 'Тарифний план не знайдено.'}, status=drf_status.HTTP_404_NOT_FOUND)

        start = date.today()
        months = membership_type.period_months
        month = start.month - 1 + months
        year = start.year + month // 12
        month = month % 12 + 1
        day = min(start.day, calendar.monthrange(year, month)[1])
        end = date(year, month, day)

        MembershipHistory.objects.create(
            member=member,
            membership_type=membership_type,
            start_date=start,
            end_date=end,
            status='active',
        )
        return Response(
            {'success': True, 'end_date': end.strftime('%d.%m.%Y')},
            status=drf_status.HTTP_201_CREATED,
        )


# --- SELF-SERVICE GYM REGISTRATION ---

class GymRegisterView(APIView):
    """
    POST /api/gyms/register/
    Self-service реєстрація нового залу.

    Запит:
      {
        "gym_name": "Pulse Fitness",
        "city": "Київ",
        "timezone": "Europe/Kyiv",  // optional, default Europe/Kyiv
        "owner_full_name": "Іван Петренко",
        "owner_email": "ivan@pulse.ua",
        "owner_phone": "+380...",
        "username": "ivan_admin",
        "password": "..."
      }

    Створює транзакційно:
      - Gym (новий тенант)
      - User (is_staff=True) — власник/адмін цього залу
      - DRF Token
      - 3 дефолтні MembershipType (Місячний, Піврічний, Річний)

    Повертає: {token, gym_id, gym_name, user_id}
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.db import transaction
        from .models import Gym, MembershipType, Member  # local import щоб уникнути циклів

        data = request.data
        required = ['gym_name', 'owner_full_name', 'owner_email', 'username', 'password']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response(
                {'error': f'Відсутні обов\'язкові поля: {", ".join(missing)}'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        username = data['username'].strip()
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Користувач з таким логіном вже існує. Оберіть інший.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        if Gym.objects.filter(name__iexact=data['gym_name'].strip()).exists():
            return Response(
                {'error': 'Зал з такою назвою вже зареєстровано.'},
                status=drf_status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # 1. Створити Gym
            gym = Gym.objects.create(
                name=data['gym_name'].strip(),
                owner_contact=data.get('owner_phone', ''),
                timezone=data.get('timezone', 'Europe/Kyiv'),
                is_active=True,
            )

            # 2. Створити User-власника як staff
            full_name = data['owner_full_name'].strip()
            first_name, _, last_name = full_name.partition(' ')
            user = User.objects.create_user(
                username=username,
                email=data['owner_email'].strip(),
                password=data['password'],
                first_name=first_name,
                last_name=last_name,
                is_staff=True,
            )

            # 3. Привʼязати власника як Member залу (щоб MeView коректно повертав gym_id)
            Member.objects.create(
                user=user,
                gym=gym,
                contact=data.get('owner_phone', ''),
                status='active',
            )

            # 4. Дефолтні тарифи
            defaults = [
                {'name': 'Місячний', 'amount': 1500, 'period_months': 1,
                 'description': 'Стандартний доступ на 1 місяць'},
                {'name': 'Піврічний', 'amount': 7500, 'period_months': 6,
                 'description': 'Стандартний доступ на 6 місяців'},
                {'name': 'Річний', 'amount': 13000, 'period_months': 12,
                 'description': 'Стандартний доступ на 12 місяців'},
            ]
            for d in defaults:
                MembershipType.objects.create(gym=gym, **d)

            # 5. Token
            token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.pk,
            'gym_id': gym.pk,
            'gym_name': gym.name,
            'username': user.username,
        }, status=drf_status.HTTP_201_CREATED)


# --- GYMOWNER INVITE-LINK ---

# Мапінг коду ValidationError у HTTP-статус для invite-флоу
_INVITE_ERR_STATUS = {
    'not_found': drf_status.HTTP_404_NOT_FOUND,
    'used': drf_status.HTTP_400_BAD_REQUEST,
    'expired': drf_status.HTTP_410_GONE,
    'invalid': drf_status.HTTP_400_BAD_REQUEST,
}


def _invite_error_response(exc: DjangoValidationError) -> Response:
    code = getattr(exc, 'code', None) or 'invalid'
    msg = exc.messages[0] if exc.messages else 'Помилка запрошення.'
    return Response({'error': msg}, status=_INVITE_ERR_STATUS.get(code,
                    drf_status.HTTP_400_BAD_REQUEST))


class GymInviteCreateView(APIView):
    """
    POST /api/admin/invites/  { "role": "member"|"staff", "ttl_hours": 72 }
    Створює одноразове запрошення до залу поточного staff-користувача.
    SuperAdmin (без залу) має передати "gym_id".
    """
    permission_classes = [IsGymStaff]

    def post(self, request) -> Response:
        from .models import Gym

        s = GymInviteCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        gym = get_gym_from_request(request)
        if gym is None:
            gym_id = s.validated_data.get('gym_id')
            if not gym_id:
                return Response(
                    {'error': 'SuperAdmin має вказати gym_id.'},
                    status=drf_status.HTTP_400_BAD_REQUEST,
                )
            try:
                gym = Gym.objects.get(pk=gym_id)
            except Gym.DoesNotExist:
                return Response(
                    {'error': 'Зал не знайдено.'},
                    status=drf_status.HTTP_404_NOT_FOUND,
                )

        try:
            invite = create_gym_invite(
                gym=gym,
                role=s.validated_data['role'],
                created_by=request.user,
                ttl_hours=s.validated_data['ttl_hours'],
            )
        except DjangoValidationError as exc:
            return _invite_error_response(exc)

        return Response({
            'code': invite.code,
            'invite_url': request.build_absolute_uri(f'/invite/{invite.code}'),
            'role': invite.role,
            'gym_name': gym.name,
            'expires_at': invite.expires_at,
        }, status=drf_status.HTTP_201_CREATED)


class GymInvitePreviewView(APIView):
    """GET /api/invites/<code>/ — прев'ю запрошення для екрану реєстрації."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, code: str) -> Response:
        try:
            invite = get_valid_invite(code)
        except DjangoValidationError as exc:
            return _invite_error_response(exc)
        return Response({
            'valid': True,
            'gym_name': invite.gym.name,
            'role': invite.role,
        })


class GymInviteAcceptView(APIView):
    """
    POST /api/invites/<code>/accept/
    { "username", "password", "full_name"?, "email"?, "contact"? }
    Реєструє користувача за запрошенням і повертає токен.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, code: str) -> Response:
        s = GymInviteAcceptSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        try:
            user, invite = accept_gym_invite(
                code=code,
                username=s.validated_data['username'],
                password=s.validated_data['password'],
                full_name=s.validated_data.get('full_name', ''),
                email=s.validated_data.get('email', ''),
                contact=s.validated_data.get('contact', ''),
            )
        except DjangoValidationError as exc:
            return _invite_error_response(exc)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'gym_id': invite.gym_id,
            'gym_name': invite.gym.name,
            'role': invite.role,
        }, status=drf_status.HTTP_201_CREATED)


# --- TELEGRAM LINK CODE ---

class TelegramLinkCodeView(APIView):
    """
    GET /api/me/telegram-code/
    Генерує/повертає 6-значний код прив'язки Telegram-чату до Member.
    Код діє 10 хвилин. Якщо вже є активний — повертає його.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        import random

        member = Member.objects.filter(user=request.user).first()
        if member is None:
            return Response(
                {'error': 'Прив\'язка Telegram доступна лише клієнтам клубу.'},
                status=drf_status.HTTP_403_FORBIDDEN,
            )

        link, _ = TelegramLink.objects.get_or_create(member=member)

        # Якщо вже є валідний код — повертаємо
        now = timezone.now()
        if (link.link_code and link.link_code_expires_at
                and link.link_code_expires_at > now and link.chat_id == 0):
            return Response({
                'code': link.link_code,
                'expires_in_sec': int((link.link_code_expires_at - now).total_seconds()),
                'bot_username': '@FitgymBot',  # TODO: env var
            })

        # Якщо вже привʼязано — повідомляємо
        if link.chat_id != 0:
            return Response({
                'linked': True,
                'telegram_username': link.telegram_username,
                'linked_at': link.linked_at,
            })

        # Генеруємо новий код
        code = f'{random.randint(0, 999999):06d}'
        link.link_code = code
        link.link_code_expires_at = now + timedelta(minutes=10)
        link.chat_id = 0
        link.save()

        return Response({
            'code': code,
            'expires_in_sec': 600,
            'bot_username': '@FitgymBot',
        })


# --- EXPO PUSH-ТОКЕН ---

class DeviceTokenView(APIView):
    """
    POST /api/me/device-token/  { "expo_push_token": "ExponentPushToken[...]",
                                  "platform": "android" }

    Upsert Expo push-токена поточного користувача. Один токен — один пристрій;
    повторний POST оновлює власника/платформу/активність.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        serializer = DeviceTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_value = serializer.validated_data['expo_push_token']
        platform = serializer.validated_data.get('platform', '') or ''

        member = Member.objects.filter(user=request.user).first()
        gym = member.gym if member else None

        DeviceToken.objects.update_or_create(
            expo_push_token=token_value,
            defaults={
                'user': request.user,
                'gym': gym,
                'platform': platform,
                'is_active': True,
            },
        )
        return Response({'success': True}, status=drf_status.HTTP_200_OK)


# --- CHECK-IN ---

class CheckAccessView(APIView):
    """
    POST /api/access/check/
    Перевіряє чи може клієнт зайти в зал прямо зараз.
    Записує кожну спробу в Attendance незалежно від результату.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        serializer = AccessCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = check_client_access(
            member_id=serializer.validated_data['member_id'],
            gym_id=serializer.validated_data['gym_id'],
        )

        http_status = drf_status.HTTP_200_OK if result.granted else drf_status.HTTP_403_FORBIDDEN
        return Response(AccessResultSerializer(result).data, status=http_status)