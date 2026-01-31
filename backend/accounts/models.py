from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    state = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Make email the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return self.email
    
    class Meta:
        ordering = ['-created_at']
