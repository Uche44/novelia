from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_books, name='books-list'),
    path('create/', views.create_book, name='book-create'),
    path('download/<int:book_id>/', views.download_book, name='book-download'),
    path('<int:book_id>/', views.get_book, name='book-detail'),
    path('<int:book_id>/update/', views.update_book, name='book-update'),
    path('<int:book_id>/delete/', views.delete_book, name='book-delete'),
]
