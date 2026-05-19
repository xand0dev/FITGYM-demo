# crm/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet, ClassViewSet, InstructorViewSet, MembershipTypeViewSet,
    ClassSessionViewSet, RegisterView, MeView, MyBookingsViewSet, BookingCreateView,
    AdminClassSessionViewSet, AdminMemberViewSet, AdminInstructorViewSet,
    MembershipApplicationCreateView, AdminMembershipApplicationViewSet,
    CheckAccessView, MembershipAssignView, AdminAttendanceViewSet,
    TelegramLinkCodeView, GymRegisterView, DeviceTokenView,
    GymInviteCreateView, GymInvitePreviewView, GymInviteAcceptView,
)
from .analytics import AdminAnalyticsView
from .payments import (
    LiqPayCheckoutInitView, LiqPayCheckoutConfirmView, LiqPayCheckoutResultView,
)
from .wallet import (
    WalletDetailView, WalletTopUpInitView, WalletTopUpConfirmView,
    AdminWalletAdjustView,
)
from .exports import ExportMembersCSV, ExportAttendanceCSV, ExportRevenueCSV

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
router.register(r'admin/attendance', AdminAttendanceViewSet, basename='admin-attendance')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('book/', BookingCreateView.as_view(), name='book-create'),
    path('apply/', MembershipApplicationCreateView.as_view(), name='apply'),
    path('me/', MeView.as_view(), name='me'),
    path('me/telegram-code/', TelegramLinkCodeView.as_view(), name='telegram-code'),
    path('me/device-token/', DeviceTokenView.as_view(), name='device-token'),
    path('gyms/register/', GymRegisterView.as_view(), name='gym-register'),
    # GymOwner invite-link
    path('admin/invites/', GymInviteCreateView.as_view(), name='gym-invite-create'),
    path('invites/<str:code>/accept/', GymInviteAcceptView.as_view(), name='gym-invite-accept'),
    path('invites/<str:code>/', GymInvitePreviewView.as_view(), name='gym-invite-preview'),
    path('access/check/', CheckAccessView.as_view(), name='access-check'),
    path('admin/memberships/assign/', MembershipAssignView.as_view(), name='membership-assign'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    # LiqPay sandbox payment flow
    path('membership/checkout/init/', LiqPayCheckoutInitView.as_view(), name='liqpay-init'),
    path('membership/checkout/confirm/', LiqPayCheckoutConfirmView.as_view(), name='liqpay-confirm'),
    path('membership/checkout/result/', LiqPayCheckoutResultView.as_view(), name='liqpay-result'),
    # Гаманець клієнта
    path('me/wallet/', WalletDetailView.as_view(), name='wallet-detail'),
    path('me/wallet/topup/init/', WalletTopUpInitView.as_view(), name='wallet-topup-init'),
    path('me/wallet/topup/confirm/', WalletTopUpConfirmView.as_view(), name='wallet-topup-confirm'),
    path('admin/members/<int:member_id>/wallet/adjust/', AdminWalletAdjustView.as_view(),
         name='admin-wallet-adjust'),
    # CSV exports for admin
    path('admin/export/members.csv', ExportMembersCSV.as_view(), name='export-members'),
    path('admin/export/attendance.csv', ExportAttendanceCSV.as_view(), name='export-attendance'),
    path('admin/export/revenue.csv', ExportRevenueCSV.as_view(), name='export-revenue'),
]