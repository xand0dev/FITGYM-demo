# crm/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    InstructorViewSet,
    MembershipTypeViewSet,
    ClassSessionViewSet,
    RegisterView,
    MeViewSet,
    MyBookingsViewSet,
    BookingCreateView,
    AdminClassSessionViewSet  # <-- НОВЕ
)

router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')
router.register(r'me', MeViewSet, basename='me')
router.register(r'my-bookings', MyBookingsViewSet, basename='mybooking')

# Реєструємо адмінський роут
router.register(r'admin/schedule', AdminClassSessionViewSet, basename='admin-schedule') # <-- НОВЕ

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('book/', BookingCreateView.as_view(), name='book-create'),
]