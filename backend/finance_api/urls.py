"""
URL configuration for finance_api project.
"""
from django.contrib import admin
from django.urls import path, include
from finances.views import landing_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('finances.urls')),
    path('', landing_page, name='landing_page'),
]
