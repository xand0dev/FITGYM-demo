# crm/admin.py
from django.contrib import admin
from .models import (
    Workout,
    Instructor,
    Member,
    MembershipType,
    MembershipHistory,
    Class,
    ClassSession,
    Booking
)

# Реєструємо кожну модель
admin.site.register(Workout)
admin.site.register(Instructor)
admin.site.register(Member)
admin.site.register(MembershipType)
admin.site.register(MembershipHistory)
admin.site.register(Class)
admin.site.register(ClassSession)
admin.site.register(Booking)