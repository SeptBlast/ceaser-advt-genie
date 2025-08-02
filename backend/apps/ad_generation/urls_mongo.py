"""
URL configuration for the Ad Generation API using MongoDB.

Maps URL patterns to view classes and functions for the ad generation endpoints.
"""

from django.urls import path
from apps.ad_generation import views

app_name = 'ad_generation'

urlpatterns = [
    # Campaign endpoints
    path('campaigns/', views.CampaignListCreateView.as_view(), name='campaign-list-create'),
    path('campaigns/<str:pk>/', views.CampaignDetailView.as_view(), name='campaign-detail'),
    
    # Creative endpoints
    path('creatives/', views.CreativeListCreateView.as_view(), name='creative-list-create'),
    path('creatives/<str:pk>/', views.CreativeDetailView.as_view(), name='creative-detail'),
    
    # Creative Template endpoints
    path('templates/', views.CreativeTemplateListCreateView.as_view(), name='template-list-create'),
    path('templates/<str:pk>/', views.CreativeTemplateDetailView.as_view(), name='template-detail'),
    
    # Generation Job endpoints
    path('jobs/', views.GenerationJobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<str:pk>/', views.GenerationJobDetailView.as_view(), name='job-detail'),
    
    # Metrics endpoints
    path('creatives/<str:creative_id>/metrics/', views.CreativeMetricsView.as_view(), name='creative-metrics'),
    
    # Analytics endpoints
    path('analytics/dashboard/', views.analytics_dashboard, name='analytics-dashboard'),
    
    # AI Generation endpoints
    path('generate/', views.generate_creative, name='generate-creative'),
]
