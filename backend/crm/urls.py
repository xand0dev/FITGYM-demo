# crm/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    ClassViewSet,
    InstructorViewSet,
    MembershipTypeViewSet,
    ClassSessionViewSet,
    RegisterView,
    MeViewSet,
    MyBookingsViewSet,
    BookingCreateView,
    AdminClassSessionViewSet,
    AdminMemberViewSet,      # <-- НОВЕ
    AdminInstructorViewSet   # <-- НОВЕ
)

router = DefaultRouter()

# --- ПУБЛІЧНІ API (доступні всім або авторизованим юзерам) ---
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'instructors', InstructorViewSet, basename='instructor') # Тільки читання
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')
router.register(r'me', MeViewSet, basename='me')
router.register(r'my-bookings', MyBookingsViewSet, basename='mybooking')

# --- АДМІНСЬКІ API (захищені IsAdminUser) ---
router.register(r'admin/schedule', AdminClassSessionViewSet, basename='admin-schedule')
router.register(r'admin/members', AdminMemberViewSet, basename='admin-member')        # <-- Список клієнтів
router.register(r'admin/instructors', AdminInstructorViewSet, basename='admin-instructor') # <-- Редагування тренерів

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('book/', BookingCreateView.as_view(), name='book-create'),
]