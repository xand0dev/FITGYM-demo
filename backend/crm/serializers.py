# crm/serializers.py
from rest_framework import serializers
from .models import Workout, Instructor, ClassSession, MembershipType, Class, Member
from django.contrib.auth.models import User


# Серіалізатор для моделі Workout
class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'name', 'description']  # Які поля показувати


# ---
# СЕРІАЛІЗАТОРИ ДЛЯ ФРОНТЕНДУ
# ---

# Серіалізатор для Тренерів
class InstructorSerializer(serializers.ModelSerializer):
    # Хочемо показувати не 'user_id', а нормальне ім'я
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Instructor
        fields = ['id', 'full_name', 'specialties']


# Серіалізатор для Абонементів
class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ['id', 'name', 'amount', 'period_months', 'description']


# Серіалізатор для Розкладу
class ClassSessionSerializer(serializers.ModelSerializer):
    # Хочемо показувати імена, а не ID
    class_name = serializers.CharField(source='class_type.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', allow_null=True, read_only=True)

    class Meta:
        model = ClassSession
        fields = ['id', 'class_name', 'instructor_name', 'start_at', 'end_at', 'capacity']


# --- НОВИЙ КОД ДЛЯ РЕЄСТРАЦІЇ ---

class RegisterSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для реєстрації нового користувача (і створення профілю Member).
    """
    # Ми додаємо поля, яких немає в моделі User, але які нам потрібні
    name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        # Вказуємо поля, які очікуємо від фронтенду
        fields = ('email', 'username', 'password', 'name')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        # Використовуємо .pop(), щоб витягнути наше кастомне поле 'name'
        name = validated_data.pop('name')

        # Створюємо User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=name  # Запишемо ім'я в first_name
        )

        # Створюємо прив'язаний профіль Member
        Member.objects.create(user=user)

        return user