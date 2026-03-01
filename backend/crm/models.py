# crm/models.py
from django.db import models
from django.contrib.auth.models import User


# === КАТЕГОРІЯ ЗАНЯТТЯ ===
class Workout(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# === ПРОФІЛЬ ТРЕНЕРА ===
class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialties = models.TextField()
    contact = models.CharField(max_length=20, blank=True, null=True, help_text="Номер телефону")

    def __str__(self):
        return self.user.get_full_name()


# === ПРОФІЛЬ КЛІЄНТА ===
class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    contact = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


# === ТИПИ АБОНЕМЕНТІВ ===
class MembershipType(models.Model):
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # DecimalField для грошей
    period_months = models.IntegerField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# === ІСТОРІЯ АБОНЕМЕНТІВ (ЯКИЙ КЛІЄНТ ЯКИЙ КУПИВ) ===
class MembershipHistory(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    membership_type = models.ForeignKey(MembershipType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member} - {self.membership_type.name}"


# === ПРИМІЩЕННЯ / ЗАЛИ (НОВЕ) ===
class Room(models.Model):
    name = models.CharField(max_length=100, help_text="Наприклад: Зал Йоги, Басейн")
    capacity = models.IntegerField(default=20, help_text="Максимальна місткість залу")
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} (до {self.capacity} осіб)"


# === КОНКРЕТНЕ ЗАНЯТТЯ ===
class Class(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    default_capacity = models.IntegerField(default=15)

    class Meta:
        verbose_name_plural = "Classes"

    def __str__(self):
        return self.name


# === СЕСІЯ В РОЗКЛАДІ ===
class ClassSession(models.Model):
    class_type = models.ForeignKey(Class, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)  # 👇 НОВЕ ПОЛЕ
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    capacity = models.IntegerField()

    class Meta:
        ordering = ['start_at']

    def __str__(self):
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

    session = models.ForeignKey(ClassSession, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')  # 👇 ОНОВЛЕНО

    def __str__(self):
        return f"{self.member} booked for {self.session} ({self.get_status_display()})"


# === ТРАНЗАКЦІЇ ТА ОПЛАТИ (НОВЕ) ===
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

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    # Прив'язуємо оплату до конкретного купленого абонемента (необов'язково, якщо це оплата за щось інше)
    membership_history = models.ForeignKey(MembershipHistory, on_delete=models.SET_NULL, null=True, blank=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')

    # Токен від платіжної системи (безпечно зберігати)
    gateway_transaction_id = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.member} - {self.amount} ({self.get_status_display()})"


# === ЗАЯВКИ НА АБОНЕМЕНТ (ЛІДИ) ===
class MembershipApplication(models.Model):
    STATUS_CHOICES = [
        ('new', 'Нова'),
        ('in_progress', 'В роботі'),
        ('completed', 'Успішно продано'),
        ('cancelled', 'Відмова'),
    ]

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

    def __str__(self):
        plan_name = self.membership_type.name if self.membership_type else "Не вказано"
        return f"Заявка від {self.name} ({self.phone}) - {plan_name}"