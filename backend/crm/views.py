# crm/views.py

from rest_framework import viewsets, permissions, generics, mixins
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone

from .permissions import IsAdminUser

from rest_framework import status as drf_status

from .models import (
    Workout, Instructor, ClassSession, MembershipType,
    Member, Booking, MembershipHistory, Class, MembershipApplication
)
from .serializers import (
    WorkoutSerializer, InstructorSerializer, ClassSessionSerializer,
    MembershipTypeSerializer, RegisterSerializer, MemberSerializer,
    BookingSerializer, BookingCreateSerializer, AdminClassSessionSerializer,
    ClassSerializer, AdminInstructorSerializer, AdminMemberSerializer,
    MembershipApplicationSerializer, AdminMembershipApplicationSerializer,
    AccessCheckSerializer, AccessResultSerializer,
)
from .services import check_client_access


# --- ПУБЛІЧНІ VIEWS ---

class WorkoutViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.AllowAny]


class ClassViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.AllowAny]


class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [permissions.AllowAny]


class MembershipTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer
    permission_classes = [permissions.AllowAny]


class ClassSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassSession.objects.all().order_by('start_at')
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.AllowAny]


class MembershipApplicationCreateView(generics.CreateAPIView):
    """(POST) /api/apply/ - Відправка заявки на абонемент з лендінгу"""
    queryset = MembershipApplication.objects.all()
    serializer_class = MembershipApplicationSerializer
    permission_classes = [permissions.AllowAny]


# --- AUTH VIEWS ---

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(username=request.data['username'])
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'name': user.first_name
        }, status=201)


class MeView(APIView):
    """(GET) /api/me/ - Універсальний профіль для ВСІХ типів користувачів"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name() or user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'active_membership': None,
        }

        if hasattr(user, 'member'):
            member = user.member
            data.update({
                'contact': member.contact,
                'gender': member.gender,
                'birth_date': member.birth_date,
                'status': member.status,
            })

            today = timezone.now().date()
            active = member.membershiphistory_set.filter(
                status='active',
                start_date__lte=today,
                end_date__gte=today
            ).order_by('-end_date').first()

            if active:
                data['active_membership'] = {
                    "name": active.membership_type.name,
                    "end_date": active.end_date.strftime("%d.%m.%Y")
                }

        elif hasattr(user, 'instructor'):
            instructor = user.instructor
            data.update({
                'contact': instructor.contact,
                'specialties': instructor.specialties,
            })

        return Response(data)


class MyBookingsViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(member__user=self.request.user).order_by('-booked_at')


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        session = serializer.validated_data.get('session')
        try:
            member = Member.objects.get(user=self.request.user)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Профіль Member не знайдено.")

        if Booking.objects.filter(member=member, session=session).exists():
            raise serializers.ValidationError("Ви вже записані на це заняття.")

        if Booking.objects.filter(session=session).count() >= session.capacity:
            raise serializers.ValidationError("На жаль, на це заняття вже немає вільних місць.")

        session_date = session.start_at.date()
        if not MembershipHistory.objects.filter(member=member, status='active', start_date__lte=session_date,
                                                end_date__gte=session_date).exists():
            raise serializers.ValidationError("У вас немає активного абонемента на дату проведення цього заняття.")

        serializer.save(member=member)


# --- АДМІНСЬКІ VIEWS ---

class AdminClassSessionViewSet(viewsets.ModelViewSet):
    queryset = ClassSession.objects.all().order_by('-start_at')
    serializer_class = AdminClassSessionSerializer
    permission_classes = [IsAdminUser]


class AdminMemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by('-id')
    serializer_class = AdminMemberSerializer
    permission_classes = [IsAdminUser]


class AdminInstructorViewSet(viewsets.ModelViewSet):
    queryset = Instructor.objects.all().order_by('id')
    serializer_class = AdminInstructorSerializer
    permission_classes = [IsAdminUser]


class AdminMembershipApplicationViewSet(viewsets.ModelViewSet):
    queryset = MembershipApplication.objects.all().order_by('-created_at')
    serializer_class = AdminMembershipApplicationSerializer
    permission_classes = [IsAdminUser]


# --- CHECK-IN ---

class CheckAccessView(APIView):
    """
    POST /api/access/check/
    Перевіряє чи може клієнт зайти в зал прямо зараз.
    Записує кожну спробу в Attendance незалежно від результату.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request) -> Response:
        serializer = AccessCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = check_client_access(
            member_id=serializer.validated_data['member_id'],
            gym_id=serializer.validated_data['gym_id'],
        )

        http_status = drf_status.HTTP_200_OK if result.granted else drf_status.HTTP_403_FORBIDDEN
        return Response(AccessResultSerializer(result).data, status=http_status)