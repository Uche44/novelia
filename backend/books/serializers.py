from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    """Serializer for Book model"""
    class Meta:
        model = Book
        fields = '__all__'


class BookCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating books with Cloudinary URLs"""
    cover_image = serializers.URLField(max_length=500, required=False, allow_blank=True, allow_null=True)
    pdf_file = serializers.URLField(max_length=500, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Book
        fields = ('title', 'author', 'genre', 'description', 'cover_image', 'pdf_file')
