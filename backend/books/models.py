from django.db import models


class Book(models.Model):
    """Model for Nigerian books in the catalog"""
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    genre = models.CharField(max_length=100)
    description = models.TextField()
    
    # Store Cloudinary URLs instead of files
    cover_image = models.URLField(max_length=500, blank=True, null=True)
    cover_image_public_id = models.CharField(max_length=255, blank=True, null=True)
    
    pdf_file = models.URLField(max_length=500, blank=True, null=True)
    pdf_file_public_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
    class Meta:
        ordering = ['title']
