# crm/views.py
from rest_framework import viewsets, permissions
from .models import Workout, Instructor, ClassSession, MembershipType
from .serializers import (
    WorkoutSerializer,
    InstructorSerializer,
    ClassSessionSerializer,
    MembershipTypeSerializer
)


# "ViewSet" - це набір логіки, який автоматично
# обробляє запити GET (отримати список) та POST (створити)

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    """API-ендпоінт для перегляду Категорій тренувань"""
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.AllowAny]  # Дозволяємо будь-кому (навіть неавторизованому) дивитися


# ---
# "КУХАРІ" ДЛЯ ФРОНТЕНДУ
# ---

class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    """API-ендпоінт для перегляду Тренерів"""
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [permissions.AllowAny]


class MembershipTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """API-ендпоінт для перегляду Абонементів"""
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.AllowAny]


class ClassSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """API-ендпоінт для перегляду Розкладу"""
    queryset = ClassSession.objects.all().order_by('start_at')  # Сортуємо за часом
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.AllowAny]