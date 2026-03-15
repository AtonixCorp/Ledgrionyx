"""
URL configuration for finance_api project.
"""
from django.contrib import admin
from django.urls import path, include
from finances.views import landing_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('finances.cli_auth_urls')),
    path('developer/', include('finances.developer_portal_urls')),
    path('v1/', include('finances.v1_urls')),
    path('api/', include('finances.urls')),
    path('api/auth/', include('finances.auth_urls')),
    path('', landing_page, name='landing_page'),
]
