from django.contrib import admin
from accounts.models import User
from books.models import Book


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'state', 'city', 'date_joined')
    list_filter = ('state', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'genre', 'created_at')
    list_filter = ('genre', 'author')
    search_fields = ('title', 'author', 'description')
    ordering = ('title',)
