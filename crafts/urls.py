
from django.urls import path
from .views import CraftListView, CraftDetailView

urlpatterns = [
    path('<int:pk>/', CraftDetailView.as_view(), name='craft-detail'),
    path('', CraftListView.as_view(), name='craft-list'),
]
