# crm/models.py
from django.db import models
from django.contrib.auth.models import User  # Вбудована модель User


# === КАТЕГОРІЯ ЗАНЯТТЯ ===
class Workout(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# === ПРОФІЛЬ ТРЕНЕРА ===
# Розширює вбудованого User
class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialties = models.TextField()
    # 👇 НОВЕ ПОЛЕ
    contact = models.CharField(max_length=20, blank=True, null=True, help_text="Номер телефону")

    def __str__(self):
        return self.user.get_full_name()


# === ПРОФІЛЬ КЛІЄНТА ===
# Розширює вбудованого User
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


# === КОНКРЕТНЕ ЗАНЯТТЯ (напр. "Йога для початківців") ===
class Class(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    default_capacity = models.IntegerField(default=15)

    class Meta:
        verbose_name_plural = "Classes"  # Щоб в адмінці було "Classes", а не "Classs"

    def __str__(self):
        return self.name


# === СЕСІЯ В РОЗКЛАДІ (напр. "Йога для початківців" о 18:00) ===
class ClassSession(models.Model):
    class_type = models.ForeignKey(Class, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    capacity = models.IntegerField()

    class Meta:
        ordering = ['start_at']  # Сортувати за часом початку

    def __str__(self):
        return f"{self.class_type.name} at {self.start_at.strftime('%Y-%m-%d %H:%M')}"


# === ЗАПИС КЛІЄНТА НА ЗАНЯТТЯ ===
class Booking(models.Model):
    session = models.ForeignKey(ClassSession, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='booked')

    def __str__(self):
        return f"{self.member} booked for {self.session}"