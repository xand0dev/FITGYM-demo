# crm/serializers.py

from rest_framework import serializers
# 👇 'Booking' та 'ClassSession' вже імпортовані, чудово
from .models import Workout, Instructor, ClassSession, MembershipType, Class, Member, Booking
from django.contrib.auth.models import User


# Серіалізатор для моделі Workout
class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'name', 'description']  # Які поля показувати


# ---
# СЕРІАЛІЗАТОРИ ДЛЯ ФРОНТЕНДУ (ПУБЛІЧНІ)
# ---

# Серіалізатор для Тренерів
class InstructorSerializer(serializers.ModelSerializer):
    # 'source' дозволяє взяти дані з іншої моделі (user.get_full_name)
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
    # 'source' дозволяє взяти дані з іншої моделі (user.get_full_name)
    class_name = serializers.CharField(source='class_type.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', allow_null=True, read_only=True)

    class Meta:
        model = ClassSession
        fields = ['id', 'class_name', 'instructor_name', 'start_at', 'end_at', 'capacity']


# ---
# ЕТАП 2: СЕРІАЛІЗАТОР ДЛЯ РЕЄСТРАЦІЇ
# ---

class RegisterSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для реєстрації. Створює User + Member.
    """
    # Додаткові поля, яких нема в User, але потрібні для форми.
    # 'write_only' = поле можна тільки надіслати, але не отримати у відповіді.
    name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        # Поля, які очікуємо з фронту
        fields = ('email', 'username', 'password', 'name')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        # 'create' - це тут головне. Перевизначаємо, щоб створити 2 об'єкти.

        # 'pop' name, бо його нема в 'create_user' напряму.
        name = validated_data.pop('name')

        # Використовуємо 'create_user', він сам хешує пароль.
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=name  # Запишемо 'name' у 'first_name'
        )

        # ВАЖЛИВО: одразу створюємо пустий профіль Member і прив'язуємо його.
        Member.objects.create(user=user)

        return user


# ---
# ЕТАП 2: СЕРІАЛІЗАТОР ДЛЯ ОСОБИСТОГО КАБІНЕТУ (/api/me/)
# ---

class MemberSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для профілю Клієнта (Member).
    Використовується для /api/me/
    """
    # Беремо дані з прив'язаної моделі User
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    # 👇 НОВЕ ПОЛЕ: беремо is_staff з моделі User
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model = Member
        # Вказуємо всі поля, які хочемо повернути фронтенду
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'is_staff',  
            'contact',
            'gender',
            'birth_date',
            'status'
        ]


# ---
# ЕТАП 2: СЕРІАЛІЗАТОР ДЛЯ "МОЇХ ЗАПИСІВ" (/api/my-bookings/)
# ---

class BookingSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для записів (Bookings) користувача.
    """
    # "Вкладаємо" серіалізатор сесії, щоб бачити повну інфу про заняття
    # 'read_only=True' означає, що ми не можемо *створювати* сесію через цей API,
    # а можемо тільки *читати* її.
    session = ClassSessionSerializer(read_only=True)

    class Meta:
        model = Booking
        # Повертаємо ID самого запису, статус, час запису,
        # і "вкладений" об'єкт 'session'
        fields = ['id', 'session', 'booked_at', 'status']


# ---
# ЕТАП 3: СЕРІАЛІЗАТОР ДЛЯ СТВОРЕННЯ ЗАПИСУ (/api/book/)
# ---

class BookingCreateSerializer(serializers.ModelSerializer):  # <-- НОВИЙ КЛАС
    """
    Серіалізатор для POST /api/book/
    Приймає 'session' (ID сесії) і автоматично додає 'member'.
    """

    # PrimaryKeyRelatedField - це найкращий спосіб прийняти ID
    # і автоматично перевірити, що об'єкт (ClassSession) з таким ID існує.
    session = serializers.PrimaryKeyRelatedField(
        queryset=ClassSession.objects.all(),
        label="ID Заняття"
    )

    class Meta:
        model = Booking
        # 'member' буде додано автоматично у view
        # 'booked_at' (якщо auto_now_add=True) і 'status' (якщо default='active')
        # додадуться автоматично при збереженні.
        fields = ['id', 'session', 'booked_at', 'status']

        # 'id', 'booked_at', 'status' ми не очікуємо від юзера,
        # вони встановлюються сервером.
        read_only_fields = ['id', 'booked_at', 'status']


# ---
# ЕТАП 4: АДМІНСЬКІ СЕРІАЛІЗАТОРИ
# ---

class AdminClassSessionSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для CRUD операцій із розкладом (лише для адмінів).
    На відміну від публічного, тут ми працюємо з ID (class_type, instructor),
    а не з іменами, щоб мати змогу створювати та редагувати об'єкти.
    """
    class Meta:
        model = ClassSession
        fields = ['id', 'class_type', 'instructor', 'start_at', 'end_at', 'capacity']