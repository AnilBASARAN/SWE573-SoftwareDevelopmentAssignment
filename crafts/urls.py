
from django.urls import path
from .views import CraftListView

urlpatterns = [
    path('', CraftListView.as_view(), name='craft-list'),
]
