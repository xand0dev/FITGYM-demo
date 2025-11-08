# crm/views.py
from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import Workout, Instructor, ClassSession, MembershipType
from .serializers import (
    WorkoutSerializer,
    InstructorSerializer,
    ClassSessionSerializer,
    MembershipTypeSerializer,
    RegisterSerializer
)


# "ViewSet" - це набір логіки, який автоматично
# обробляє запити GET (отримати список) та POST (створити)

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    """API-ендпоіінт для перегляду Категорій тренувань"""
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


# --- НОВИЙ КОД ДЛЯ РЕЄСТРАЦІЇ ---

class RegisterView(generics.CreateAPIView):
    """
    API-ендпоінт для реєстрації нових користувачів.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)  # Дозволити будь-кому реєструватися
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Використовуємо наш серіалізатор, щоб створити User + Member
        response = super().create(request, *args, **kwargs)

        # Як тільки юзер створений, знаходимо його
        # (ми беремо 'username' з даних, які нам надіслали)
        user = User.objects.get(username=request.data['username'])

        # І створюємо/отримуємо для нього токен
        token, created = Token.objects.get_or_create(user=user)

        # Повертаємо токен у відповіді (щоб фронтенд міг одразу залогінити юзера)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'name': user.first_name
        }, status=201)