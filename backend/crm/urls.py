# crm/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet, 
    InstructorViewSet, 
    MembershipTypeViewSet, 
    ClassSessionViewSet
)

# "Router" автоматично створює всі URL для ViewSet
router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename='workout')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'membership-types', MembershipTypeViewSet, basename='membershiptype')
router.register(r'schedule', ClassSessionViewSet, basename='classsession')

urlpatterns = [
    path('', include(router.urls)),
]