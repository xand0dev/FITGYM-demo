# crm/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    Workout, Instructor, ClassSession, MembershipType, Class,
    Member, Booking, Room, Payment, MembershipApplication, Attendance,
    WalletTransaction,
)


# === ПУБЛІЧНІ СЕРІАЛІЗАТОРИ ===

class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'name', 'description']


class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = ['id', 'name', 'description']


class InstructorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Instructor
        fields = ['id', 'full_name', 'specialties']


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ['id', 'name', 'amount', 'period_months', 'description',
                  'time_limit_start', 'time_limit_end']


# Серіалізатор для Залів
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'capacity', 'description']


class ClassSessionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_type.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', allow_null=True, read_only=True)
    room_name = serializers.CharField(source='room.name', allow_null=True, read_only=True)

    class Meta:
        model = ClassSession
        fields = ['id', 'class_name', 'instructor_name', 'room_name', 'start_at', 'end_at', 'capacity']


# === АВТОРИЗАЦІЯ ТА ПРОФІЛЬ ===

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'name')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        name = validated_data.pop('name')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=name
        )
        Member.objects.create(user=user)
        return user


class MemberSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для профілю Клієнта (Member).
    Використовується для /api/me/
    """
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    # RBAC Прапорці
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)

    # 👇 НОВЕ ПОЛЕ: Динамічно обчислюємо активний абонемент
    active_membership = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id', 'username', 'email', 'full_name', 'is_staff', 'is_superuser',
            'contact', 'gender', 'birth_date', 'status', 'active_membership'  # 👈 Додали сюди
        ]

    def get_active_membership(self, obj):
        today = timezone.now().date()
        # Шукаємо активний абонемент клієнта, який діє на сьогоднішню дату
        active = obj.membershiphistory_set.filter(
            status='active',
            start_date__lte=today,
            end_date__gte=today
        ).order_by('-end_date').first()

        if active:
            return {
                "name": active.membership_type.name,
                "end_date": active.end_date.strftime("%d.%m.%Y")
            }
        return None


# === КЛІЄНТСЬКІ ДІЇ ===

class BookingSerializer(serializers.ModelSerializer):
    session = ClassSessionSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'session', 'booked_at', 'status']


class BookingCreateSerializer(serializers.ModelSerializer):
    session = serializers.PrimaryKeyRelatedField(
        queryset=ClassSession.objects.all(),
        label="ID Заняття"
    )

    class Meta:
        model = Booking
        fields = ['id', 'session', 'booked_at', 'status']
        read_only_fields = ['id', 'booked_at', 'status']


# Серіалізатор для Оплат клієнта
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'member', 'membership_history', 'amount',
            'payment_date', 'payment_method', 'status', 'gateway_transaction_id'
        ]
        read_only_fields = ['payment_date', 'member']

# === ЗАЯВКИ НА АБОНЕМЕНТ ===
class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipApplication
        fields = ['id', 'name', 'phone', 'membership_type', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']  # Ці поля юзер не може передати сам


# === АДМІНСЬКІ СЕРІАЛІЗАТОРИ ===

class AdminClassSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSession
        fields = ['id', 'class_type', 'instructor', 'room', 'start_at', 'end_at', 'capacity']


class AdminInstructorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Instructor
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'full_name', 'specialties', 'contact']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        # 👇 ЯВНЕ ХЕШУВАННЯ ТА ПРАВА ПЕРСОНАЛУ
        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            is_staff=True
        )
        user.set_password(password)
        user.save()

        instructor = Instructor.objects.create(user=user, **validated_data)
        return instructor


class AdminMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    active_membership = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id', 'username', 'password', 'first_name', 'last_name', 'email',
            'full_name', 'user_email', 'contact', 'status', 'birth_date', 'gender',
            'active_membership',
        ]

    def get_active_membership(self, obj) -> dict | None:
        today = timezone.now().date()
        active = obj.membershiphistory_set.filter(
            status='active',
            start_date__lte=today,
            end_date__gte=today,
        ).select_related('membership_type').order_by('-end_date').first()
        if active:
            return {
                'name': active.membership_type.name,
                'end_date': active.end_date.strftime('%d.%m.%Y'),
            }
        return None

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        email = validated_data.pop('email', '')

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        member = Member.objects.create(user=user, **validated_data)
        return member

    def update(self, instance, validated_data):
        instance.contact = validated_data.get('contact', instance.contact)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance

class AdminMembershipApplicationSerializer(serializers.ModelSerializer):
    membership_type_name = serializers.CharField(source='membership_type.name', read_only=True, allow_null=True)

    class Meta:
        model = MembershipApplication
        fields = ['id', 'name', 'phone', 'membership_type', 'membership_type_name', 'status', 'created_at']


# === ATTENDANCE LOG ===

class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'member_name', 'timestamp', 'is_access_granted', 'denial_reason']


# === ГАМАНЕЦЬ КЛІЄНТА ===

class WalletTransactionSerializer(serializers.ModelSerializer):
    kind_display = serializers.CharField(source='get_kind_display', read_only=True)

    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'kind', 'kind_display', 'balance_after',
                  'description', 'gateway_transaction_id', 'created_at']


# === ЗАПРОШЕННЯ ДО ЗАЛУ ===

class GymInviteCreateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['staff', 'member'], default='member')
    ttl_hours = serializers.IntegerField(required=False, default=72, min_value=1)
    gym_id = serializers.IntegerField(required=False)  # лише для superuser


class GymInviteAcceptSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, style={'input_type': 'password'})
    full_name = serializers.CharField(required=False, allow_blank=True, default='')
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    contact = serializers.CharField(required=False, allow_blank=True, default='')


# === EXPO PUSH-ТОКЕН ===

class DeviceTokenSerializer(serializers.Serializer):
    expo_push_token = serializers.CharField(max_length=255)
    platform = serializers.ChoiceField(
        choices=['ios', 'android', 'web'], required=False, allow_blank=True,
    )


# === ASSIGN MEMBERSHIP ===

class MembershipAssignSerializer(serializers.Serializer):
    member_id = serializers.IntegerField()
    membership_type_id = serializers.IntegerField()


# === CHECK-IN ===

class AccessCheckSerializer(serializers.Serializer):
    member_id = serializers.IntegerField()
    gym_id    = serializers.IntegerField()


class AccessResultSerializer(serializers.Serializer):
    granted = serializers.BooleanField()
    reason  = serializers.CharField()

