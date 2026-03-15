from django.urls import path

from .auth_views import RegisterView, MeView
from .developer_portal_common import StandardizedTokenObtainPairView, StandardizedTokenRefreshView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth_register"),
    path("token/", StandardizedTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", StandardizedTokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="auth_me"),
]
