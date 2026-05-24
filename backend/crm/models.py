from django.db import models
from django.contrib.auth.models import User


# === ТЕНАНТ — ФІТНЕС-ЗАЛ ===
class Gym(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='gym_logos/', blank=True, null=True)
    owner_contact = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=50, default='Europe/Kyiv')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


# === КАТЕГОРІЯ ЗАНЯТТЯ ===
class Workout(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return self.name


# === ПРОФІЛЬ ТРЕНЕРА ===
class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='instructors')
    specialties = models.TextField()
    contact = models.CharField(max_length=20, blank=True, null=True, help_text="Номер телефону")

    def __str__(self) -> str:
        return self.user.get_full_name()


# === ПРОФІЛЬ КЛІЄНТА ===
class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='members')
    contact = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.user.get_full_name() or self.user.username


# === ТИПИ АБОНЕМЕНТІВ ===
class MembershipType(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='membership_types')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period_months = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    # Часові обмеження — None означає "без обмежень" (напр. "Ранковий" діє лише до 13:00)
    time_limit_start = models.TimeField(null=True, blank=True)
    time_limit_end = models.TimeField(null=True, blank=True)

    def __str__(self) -> str:
        return self.name


# === ІСТОРІЯ АБОНЕМЕНТІВ ===
class MembershipHistory(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    membership_type = models.ForeignKey(MembershipType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.member} - {self.membership_type.name}"


# === ПРИМІЩЕННЯ / ЗАЛИ ===
class Room(models.Model):
    name = models.CharField(max_length=100, help_text="Наприклад: Зал Йоги, Басейн")
    capacity = models.IntegerField(default=20, help_text="Максимальна місткість залу")
    description = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.name} (до {self.capacity} осіб)"


# === ТИП ЗАНЯТТЯ ===
class Class(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    default_capacity = models.IntegerField(default=15)

    class Meta:
        verbose_name_plural = "Classes"

    def __str__(self) -> str:
        return self.name


# === СЕСІЯ В РОЗКЛАДІ ===
class ClassSession(models.Model):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='sessions')
    class_type = models.ForeignKey(Class, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    capacity = models.IntegerField()

    class Meta:
        ordering = ['start_at']

    def __str__(self) -> str:
        room_name = self.room.name if self.room else "Без залу"
        return f"{self.class_type.name} at {self.start_at.strftime('%Y-%m-%d %H:%M')} ({room_name})"


# === ЗАПИС КЛІЄНТА НА ЗАНЯТТЯ ===
class Booking(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Записано'),
        ('attended', 'Відвідав'),
        ('missed', 'Пропустив'),
        ('cancelled', 'Скасовано'),
    ]

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='bookings')
    session = models.ForeignKey(ClassSession, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')

    def __str__(self) -> str:
        return f"{self.member} booked for {self.session} ({self.get_status_display()})"


# === ТРАНЗАКЦІЇ ТА ОПЛАТИ ===
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Готівка'),
        ('card', 'Картка (Термінал)'),
        ('online', 'Онлайн оплата'),
    ]
    STATUS_CHOICES = [
        ('pending', 'В обробці'),
        ('completed', 'Успішно'),
        ('failed', 'Помилка'),
    ]

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    membership_history = models.ForeignKey(MembershipHistory, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    gateway_transaction_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.member} - {self.amount} ({self.get_status_display()})"


# === ЗАЯВКИ НА АБОНЕМЕНТ (ЛІДИ) ===
class MembershipApplication(models.Model):
    STATUS_CHOICES = [
        ('new', 'Нова'),
        ('in_progress', 'В роботі'),
        ('completed', 'Успішно продано'),
        ('cancelled', 'Відмова'),
    ]

    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, null=True, blank=True, related_name='applications')
    name = models.CharField(max_length=100, help_text="Ім'я клієнта")
    phone = models.CharField(max_length=20, help_text="Контактний телефон")
    membership_type = models.ForeignKey(MembershipType, on_delete=models.SET_NULL, null=True, blank=True,
                                        help_text="Бажаний тариф")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Заявка на абонемент"
        verbose_name_plural = "Заявки на абонементи"
        ordering = ['-created_at']

    def __str__(self) -> str:
        plan_name = self.membership_type.name if self.membership_type else "Не вказано"
        return f"Заявка від {self.name} ({self.phone}) - {plan_name}"


# === ЛОГ ВІДВІДУВАНЬ (CHECK-IN АУДИТ) ===
class Attendance(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendances')
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name='attendances')
    timestamp = models.DateTimeField(auto_now_add=True)
    is_access_granted = models.BooleanField()
    denial_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self) -> str:
        status = "✓" if self.is_access_granted else "✗"
        return f"{status} {self.member} @ {self.gym} — {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
