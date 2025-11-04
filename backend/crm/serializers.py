# crm/serializers.py
from rest_framework import serializers
from .models import Workout, Instructor, ClassSession, MembershipType, Class
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