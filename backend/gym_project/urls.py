# gym_project/urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from crm.views import RateLimitedObtainAuthToken

urlpatterns = [
    path('admin/', admin.site.urls),

    # Всі маршрути з crm/urls.py будуть починатися з 'api/'
    path('api/', include('crm.urls')),

    # АДРЕСА ДЛЯ ЛОГІНУ — rate-limited (5 невдалих спроб → 5 хв блок)
    path('api/login/', RateLimitedObtainAuthToken.as_view()),

    # ── Swagger / OpenAPI ─────────────────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]