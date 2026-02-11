"""
Cloudinary upload utilities for handling book cover images and PDF files.
"""
import cloudinary
import cloudinary.uploader
from django.conf import settings
from decouple import config


# Initialize Cloudinary
cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME', default=''),
    api_key=config('CLOUDINARY_API_KEY', default=''),
    api_secret=config('CLOUDINARY_API_SECRET', default='')
)


def upload_image_to_cloudinary(file, folder='books/covers'):
    """
    Upload an image file to Cloudinary.
    
    Args:
        file: File object from request.FILES
        folder: Cloudinary folder path
        
    Returns:
        dict: Upload result with 'url' and 'public_id'
        
    Raises:
        Exception: If upload fails
    """
    try:
        # Upload to Cloudinary as public resource
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='image',
            allowed_formats=['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation=[
                {'width': 800, 'height': 1200, 'crop': 'limit'},  # Limit max dimensions
                {'quality': 'auto'},  # Auto quality optimization
            ],
            access_mode='public'  # Make image publicly accessible
        )
        
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id')
        }
    except Exception as e:
        raise Exception(f"Image upload failed: {str(e)}")


def upload_pdf_to_cloudinary(file, folder='books/pdfs'):
    """
    Upload a PDF file to Cloudinary with authenticated access.
    
    Args:
        file: File object from request.FILES
        folder: Cloudinary folder path
        
    Returns:
        dict: Upload result with 'url' and 'public_id'
        
    Raises:
        Exception: If upload fails
    """
    try:
        # Upload to Cloudinary with type='upload' (not authenticated)
        # This makes it publicly accessible
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='raw',  # PDF is a raw file type
            allowed_formats=['pdf'],
            type='upload'  # Use 'upload' type instead of default 'authenticated'
        )
        
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id')
        }
    except Exception as e:
        raise Exception(f"PDF upload failed: {str(e)}")


def delete_file_from_cloudinary(public_id, resource_type='image'):
    """
    Delete a file from Cloudinary.
    
    Args:
        public_id: The public ID of the file to delete
        resource_type: 'image' or 'raw' (for PDFs)
        
    Returns:
        dict: Deletion result
    """
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type
        )
        return result
    except Exception as e:
        raise Exception(f"File deletion failed: {str(e)}")
