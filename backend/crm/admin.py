from django.contrib import admin
from .models import (
    Gym,
    Workout,
    Instructor,
    Member,
    MembershipType,
    MembershipHistory,
    Room,
    Class,
    ClassSession,
    Booking,
    Payment,
    MembershipApplication,
    Attendance,
    WalletTransaction,
    DeviceToken,
    NotificationLog,
    GymInvite,
)


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_contact', 'timezone', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('member', 'gym', 'timestamp', 'is_access_granted', 'denial_reason')
    list_filter = ('is_access_granted', 'gym')
    search_fields = ('member__user__username', 'denial_reason')
    readonly_fields = ('member', 'gym', 'timestamp', 'is_access_granted', 'denial_reason')

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('member', 'kind', 'amount', 'balance_after', 'created_at')
    list_filter = ('kind', 'gym')
    search_fields = ('member__user__username', 'description', 'gateway_transaction_id')
    readonly_fields = ('gym', 'member', 'amount', 'kind', 'balance_after',
                       'description', 'gateway_transaction_id', 'created_at')

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'platform', 'is_active', 'created_at', 'last_seen')
    list_filter = ('platform', 'is_active', 'gym')
    search_fields = ('user__username', 'expo_push_token')


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('member', 'kind', 'membership_history', 'sent_at')
    list_filter = ('kind',)
    search_fields = ('member__user__username',)
    readonly_fields = ('member', 'membership_history', 'kind', 'sent_at')

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(GymInvite)
class GymInviteAdmin(admin.ModelAdmin):
    list_display = ('code', 'gym', 'role', 'created_by', 'expires_at', 'used_at', 'created_at')
    list_filter = ('role', 'gym')
    search_fields = ('code', 'gym__name', 'created_by__username')
    readonly_fields = ('code', 'created_at', 'used_at')


admin.site.register(Workout)
admin.site.register(Instructor)
admin.site.register(Member)
admin.site.register(MembershipType)
admin.site.register(MembershipHistory)
admin.site.register(Room)
admin.site.register(Class)
admin.site.register(ClassSession)
admin.site.register(Booking)
admin.site.register(Payment)
admin.site.register(MembershipApplication)
