
from django.urls import path
from .views import CraftDetailView, CraftListView

urlpatterns = [
    path('', CraftListView.as_view(), name='craft-list'),
    path("<int:pk>/", CraftDetailView.as_view(), name="craft-detail"),
]
