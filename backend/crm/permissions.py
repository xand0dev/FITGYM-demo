from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Кастомний дозвіл: надає доступ лише адміністраторам (is_staff=True).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsGymStaff(permissions.BasePermission):
    """
    Дозвіл для staff-користувача залу.
    SuperUser (is_superuser=True) бачить усі зали.
    Звичайний staff (is_staff=True) — тільки свій gym.
    """

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.is_staff