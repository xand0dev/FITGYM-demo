# crm/views.py
from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
# 👇 Додано 'Booking' в кінець імпорту
from .models import Workout, Instructor, ClassSession, MembershipType, Member, Booking
from .serializers import (
    WorkoutSerializer,
    InstructorSerializer,
    ClassSessionSerializer,
    MembershipTypeSerializer,
    RegisterSerializer,
    MemberSerializer,
    BookingSerializer  # <--- 👇 Додав BookingSerializer
)


# "ViewSet" - це набір логіки, який автоматично
# обробляє запити GET (отримати список) та POST (створити)

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/workouts/"""
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.AllowAny]  # Дозволяємо будь-кому (навіть неавторизованому) дивитися


# ---
# "КУХАРІ" ДЛЯ ФРОНТЕНДУ (ПУБЛІЧНІ)
# ---

class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/instructors/"""
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [permissions.AllowAny]


class MembershipTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/membership-types/"""
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.AllowAny]


class ClassSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/schedule/"""
    queryset = ClassSession.objects.all().order_by('start_at')  # Сортуємо за часом
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.AllowAny]


# ---
# ЕТАП 2: VIEW ДЛЯ РЕЄСТРАЦІЇ
# ---

class RegisterView(generics.CreateAPIView):
    """
    (POST) /api/register/
    Ендпоінт для реєстрації. 'generics.CreateAPIView' ідеально підходить.
    """
    queryset = User.objects.all()
    # Дозволити будь-кому (AllowAny) стукатись на цей ендпоінт.
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Перевизначаємо 'create', щоб не просто повернути 201, а одразу видати токен.

        # 'super().create' викликає serializer.create() і створює юзера + member.
        response = super().create(request, *args, **kwargs)

        # Знаходимо щойно створеного юзера
        # (ми беремо 'username' з даних, які нам надіслали)
        user = User.objects.get(username=request.data['username'])

        # Генеруємо (або отримуємо) токен.
        token, created = Token.objects.get_or_create(user=user)

        # Повертаємо токен фронту. Це дозволяє зробити авто-логін.
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'name': user.first_name
        }, status=201)


# ---
# ЕТАП 2: VIEW ДЛЯ ОСОБИСТОГО КАБІНЕТУ (/api/me/)
# ---

class MeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    (GET) /api/me/
    Ендпоінт, який повертає профіль (Member)
    ТІЛЬКИ поточного залогіненого користувача.
    """
    serializer_class = MemberSerializer
    # "ФЕЙС-КОНТРОЛЬ": Доступ тільки для тих, хто має "пропуск" (Токен).
    # 'IsAuthenticated' автоматично перевіряє 'TokenAuthentication'.
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ця функція гарантує, що юзер бачить ТІЛЬКИ свій профіль.
        """
        # 'self.request.user' - це юзер, якого Django "впізнав" за токеном
        return Member.objects.filter(user=self.request.user)


# ---
# ЕТАП 2: VIEW ДЛЯ "МОЇХ ЗАПИСІВ" (/api/my-bookings/)
# ---

class MyBookingsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    (GET) /api/my-bookings/
    Ендпоінт, який повертає список записів (Bookings)
    ТІЛЬКИ поточного залогіненого користувача.
    """
    serializer_class = BookingSerializer
    # "ФЕЙС-КОНТРОЛЬ": (такий самий, як у /api/me/)
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ця функція гарантує, що юзер бачить ТІЛЬКИ свої записи.
        """
        # 1. Знаходимо профіль 'Member' поточного юзера
        # 2. Фільтруємо 'Booking' по 'member=...'
        return Booking.objects.filter(member__user=self.request.user).order_by('-booked_at')