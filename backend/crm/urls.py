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
    MyBookingsViewSet # <--- 1. Додав цей імпорт
)

# "Router" автоматично створює всі URL для ViewSet
router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')
router.register(r'me', MeViewSet, basename='me')
# 2. Додаю новий роут для /api/my-bookings/
router.register(r'my-bookings', MyBookingsViewSet, basename='mybooking')

urlpatterns = [
    # Всі URL з роутера (workouts, instructors... 'me', 'my-bookings')
    path('', include(router.urls)),

    # Окрема адреса для реєстрації
    path('register/', RegisterView.as_view(), name='register'),
]