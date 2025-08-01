"""
URL configuration for the Tenants app.
"""

from django.urls import path
from . import views

app_name = 'tenants'

urlpatterns = [
    path('', views.tenant_list, name='tenant_list'),
    path('create/', views.create_tenant, name='create_tenant'),
]
