# gym_project/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as authtoken_views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Всі маршрути з crm/urls.py будуть починатися з 'api/'
    path('api/', include('crm.urls')),

    # АДРЕСА ДЛЯ ЛОГІНУ
    path('api/login/', authtoken_views.obtain_auth_token),

    # ── Swagger / OpenAPI ─────────────────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]