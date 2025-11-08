# gym_project/urls.py
from django.contrib import admin
from django.urls import path, include  # Переконайся, що 'include' тут є

urlpatterns = [
    path('admin/', admin.site.urls),

    # Всі маршрути з crm/urls.py будуть починатися з 'api/'
    path('api/', include('crm.urls')),

    # АДРЕСА ДЛЯ ЛОГІНУ
    path('api/login/', authtoken_views.obtain_auth_token),
]