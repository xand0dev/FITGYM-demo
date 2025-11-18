# crm/views.py

from rest_framework import viewsets, permissions, generics
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

# 👇 Додаємо MembershipHistory в імпорти
from .models import (
    Workout,
    Instructor,
    ClassSession,
    MembershipType,
    Member,
    Booking,
    MembershipHistory  # <-- НОВЕ
)
from .serializers import (
    WorkoutSerializer,
    InstructorSerializer,
    ClassSessionSerializer,
    MembershipTypeSerializer,
    RegisterSerializer,
    MemberSerializer,
    BookingSerializer,
    BookingCreateSerializer
)


# "ViewSet" - це набір логіки, який автоматично
# обробляє запити GET (отримати список) та POST (створити)

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/workouts/"""
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.AllowAny]


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
    queryset = ClassSession.objects.all().order_by('start_at')
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.AllowAny]


# ---
# ЕТАП 2: VIEW ДЛЯ РЕЄСТРАЦІЇ
# ---

class RegisterView(generics.CreateAPIView):
    """
    (POST) /api/register/
    """
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


# ---
# ЕТАП 2: VIEW ДЛЯ ОСОБИСТОГО КАБІНЕТУ (/api/me/)
# ---

class MeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    (GET) /api/me/
    """
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Member.objects.filter(user=self.request.user)


# ---
# ЕТАП 2: VIEW ДЛЯ "МОЇХ ЗАПИСІВ" (/api/my-bookings/)
# ---

class MyBookingsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    (GET) /api/my-bookings/
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(member__user=self.request.user).order_by('-booked_at')


# ---
# ЕТАП 3: VIEW ДЛЯ СТВОРЕННЯ ЗАПИСУ (/api/book/) з БІЗНЕС-ЛОГІКОЮ
# ---

class BookingCreateView(generics.CreateAPIView):
    """
    (POST) /api/book/
    """
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Тут відбувається вся магія валідації.
        """

        # 1. Отримуємо об'єкт сесії (заняття)
        session = serializer.validated_data.get('session')

        # 2. Отримуємо профіль Member
        try:
            member = Member.objects.get(user=self.request.user)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Профіль Member не знайдено.")

        # --- ЛОГІКА 1: ПЕРЕВІРКА НА ДУБЛІКАТ ---
        if Booking.objects.filter(member=member, session=session).exists():
            raise serializers.ValidationError("Ви вже записані на це заняття.")

        # --- ЛОГІКА 2: ПЕРЕВІРКА МІСТКОСТІ (CAPACITY) ---
        current_bookings_count = Booking.objects.filter(session=session).count()
        if current_bookings_count >= session.capacity:
            raise serializers.ValidationError("На жаль, на це заняття вже немає вільних місць.")

        # --- ЛОГІКА 3: ПЕРЕВІРКА АБОНЕМЕНТА (НОВЕ) ---
        # Ми шукаємо хоча б один абонемент, який:
        # а) Належить цьому клієнту
        # б) Має статус 'active'
        # в) Дата заняття потрапляє в діапазон [start_date ... end_date]

        session_date = session.start_at.date()  # Беремо дату заняття

        has_active_membership = MembershipHistory.objects.filter(
            member=member,
            status='active',
            start_date__lte=session_date,  # Абонемент почався ДО або В день заняття
            end_date__gte=session_date  # Абонемент закінчується В день або ПІСЛЯ заняття
        ).exists()

        if not has_active_membership:
            raise serializers.ValidationError(
                "У вас немає активного абонемента на дату проведення цього заняття. Будь ласка, придбайте абонемент."
            )

        # 4. Якщо всі перевірки пройшли успішно — зберігаємо
        serializer.save(member=member)