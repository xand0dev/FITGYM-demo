# crm/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    InstructorViewSet,
    MembershipTypeViewSet,
    ClassSessionViewSet,
    RegisterView
)

# "Router" автоматично створює всі URL для ViewSet
router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')

urlpatterns = [
    # Всі URL з роутера (workouts, instructors...)
    path('', include(router.urls)),

    # НОВИЙ КОД: Окрема адреса для реєстрації
    path('register/', RegisterView.as_view(), name='register'),
]