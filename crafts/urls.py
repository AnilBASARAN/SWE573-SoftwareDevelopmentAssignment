
from django.urls import path
from .views import CraftListView, CraftDetailView, CategoryListView, CategorySuggestionView

urlpatterns = [
    path('categories/', CategoryListView.as_view()),
    path('categories/suggest/', CategorySuggestionView.as_view()),
    path('<int:pk>/', CraftDetailView.as_view(), name='craft-detail'),
    path('', CraftListView.as_view(), name='craft-list'),
]
