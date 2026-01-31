from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('user/', views.get_current_user, name='current-user'),
    path('users/', views.get_all_users, name='all-users'),
]
