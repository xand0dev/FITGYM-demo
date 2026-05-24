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
