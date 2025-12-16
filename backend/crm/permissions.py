from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Кастомний дозвіл: надає доступ лише адміністраторам (is_staff=True).
    """

    def has_permission(self, request, view):
        # 1. Перевіряємо, чи користувач взагалі існує (request.user)
        # 2. Перевіряємо, чи він залогінений (is_authenticated - неявно перевіряється в request.user, але краще бути певним)
        # 3. Перевіряємо, чи є у нього статус персоналу (is_staff)

        return bool(request.user and request.user.is_staff)