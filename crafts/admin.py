
from django.contrib import admin
from .models import Craft, Category, Tag

admin.site.register(Craft)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'approved')
    list_editable = ('approved',)
    search_fields = ('name',)

admin.site.register(Tag)
