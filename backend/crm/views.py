# crm/views.py

from rest_framework import viewsets, permissions, generics, mixins  # <-- 1. Додано 'mixins'
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

from .models import (
    Workout,
    Instructor,
    ClassSession,
    MembershipType,
    Member,
    Booking,
    MembershipHistory
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


# --- ПУБЛІЧНІ VIEWS ---

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/workouts/"""
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.AllowAny]


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


# --- AUTH VIEWS ---

class RegisterView(generics.CreateAPIView):
    """(POST) /api/register/"""
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


class MeViewSet(viewsets.ReadOnlyModelViewSet):
    """(GET) /api/me/"""
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Member.objects.filter(user=self.request.user)


# ---
# ОНОВЛЕНИЙ VIEW ДЛЯ "МОЇХ ЗАПИСІВ" (GET + DELETE)
# ---

class MyBookingsViewSet(mixins.ListModelMixin,  # Дозволяє GET (список)
                        mixins.RetrieveModelMixin,  # Дозволяє GET (конкретний запис)
                        mixins.DestroyModelMixin,  # Дозволяє DELETE <-- НОВЕ
                        viewsets.GenericViewSet):  # Базовий клас
    """
    (GET) /api/my-bookings/      - список моїх записів
    (GET) /api/my-bookings/{id}/ - деталі одного запису
    (DELETE) /api/my-bookings/{id}/ - скасувати запис
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ця функція критична для безпеки DELETE.
        Вона повертає ТІЛЬКИ записи поточного користувача.
        Якщо спробувати видалити чужий ID, Django його тут не знайде
        і поверне 404.
        """
        return Booking.objects.filter(member__user=self.request.user).order_by('-booked_at')


class BookingCreateView(generics.CreateAPIView):
    """(POST) /api/book/"""
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

        current_bookings_count = Booking.objects.filter(session=session).count()
        if current_bookings_count >= session.capacity:
            raise serializers.ValidationError("На жаль, на це заняття вже немає вільних місць.")

        session_date = session.start_at.date()

        has_active_membership = MembershipHistory.objects.filter(
            member=member,
            status='active',
            start_date__lte=session_date,
            end_date__gte=session_date
        ).exists()

        if not has_active_membership:
            raise serializers.ValidationError(
                "У вас немає активного абонемента на дату проведення цього заняття. Будь ласка, придбайте абонемент."
            )

        serializer.save(member=member)