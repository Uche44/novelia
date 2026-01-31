from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    """Serializer for Book model"""
    class Meta:
        model = Book
        fields = '__all__'


class BookCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating books"""
    class Meta:
        model = Book
        fields = ('title', 'author', 'genre', 'description', 'cover_image', 'pdf_file')
