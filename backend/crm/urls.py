# crm/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet, ClassViewSet, InstructorViewSet, MembershipTypeViewSet,
    ClassSessionViewSet, RegisterView, MeView, MyBookingsViewSet, BookingCreateView,
    AdminClassSessionViewSet, AdminMemberViewSet, AdminInstructorViewSet,
    MembershipApplicationCreateView, AdminMembershipApplicationViewSet
)

router = DefaultRouter()

# --- ПУБЛІЧНІ API ---
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')
router.register(r'my-bookings', MyBookingsViewSet, basename='mybooking')

# --- АДМІНСЬКІ API ---
router.register(r'admin/schedule', AdminClassSessionViewSet, basename='admin-schedule')
router.register(r'admin/members', AdminMemberViewSet, basename='admin-member')
router.register(r'admin/instructors', AdminInstructorViewSet, basename='admin-instructor')
router.register(r'admin/applications', AdminMembershipApplicationViewSet, basename='admin-application')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('book/', BookingCreateView.as_view(), name='book-create'),
    path('apply/', MembershipApplicationCreateView.as_view(), name='apply'),
    path('me/', MeView.as_view(), name='me'), # <-- НАШ УНІВЕРСАЛЬНИЙ ПРОФІЛЬ
]