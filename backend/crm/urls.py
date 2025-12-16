# crm/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    ClassViewSet,  # <-- НОВЕ: Імпорт ViewSet
    InstructorViewSet,
    MembershipTypeViewSet,
    ClassSessionViewSet,
    RegisterView,
    MeViewSet,
    MyBookingsViewSet,
    BookingCreateView,
    AdminClassSessionViewSet
)

router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'classes', ClassViewSet, basename='class')  # <-- НОВЕ: URL classes
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')
router.register(r'me', MeViewSet, basename='me')
router.register(r'my-bookings', MyBookingsViewSet, basename='mybooking')

router.register(r'admin/schedule', AdminClassSessionViewSet, basename='admin-schedule')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('book/', BookingCreateView.as_view(), name='book-create'),
]