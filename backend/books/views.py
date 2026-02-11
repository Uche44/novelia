from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.http import FileResponse, Http404, StreamingHttpResponse
from django.conf import settings
from .models import Book
from .serializers import BookSerializer, BookCreateSerializer
from .cloudinary_utils import (
    upload_image_to_cloudinary,
    upload_pdf_to_cloudinary,
    delete_file_from_cloudinary
)
import os
import requests
import cloudinary
import cloudinary.utils
import tempfile


@api_view(['GET'])
@permission_classes([AllowAny])
def get_books(request):
    """Get all books or search/filter"""
    books = Book.objects.all()
    
    # Search by title, author, or genre
    search = request.GET.get('search', None)
    if search:
        books = books.filter(
            title__icontains=search
        ) | books.filter(
            author__icontains=search
        ) | books.filter(
            genre__icontains=search
        )
    
    # Filter by genre
    genre = request.GET.get('genre', None)
    if genre:
        books = books.filter(genre__iexact=genre)
    
    serializer = BookSerializer(books, many=True)
    return Response({
        'count': books.count(),
        'books': serializer.data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_book(request, book_id):
    """Get single book details"""
    try:
        book = Book.objects.get(id=book_id)
        serializer = BookSerializer(book)
        return Response(serializer.data)
    except Book.DoesNotExist:
        return Response({
            'error': 'Book not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_book(request):
    """Create a new book (admin only) with explicit Cloudinary upload"""
    try:
        # Extract file fields
        cover_image_file = request.FILES.get('cover_image')
        pdf_file = request.FILES.get('pdf_file')
        
        # Create book instance without files first
        book_data = {
            'title': request.data.get('title'),
            'author': request.data.get('author'),
            'genre': request.data.get('genre'),
            'description': request.data.get('description')
        }
        
        # Upload cover image to Cloudinary if provided
        if cover_image_file:
            try:
                upload_result = upload_image_to_cloudinary(cover_image_file)
                book_data['cover_image'] = upload_result['url']
                book_data['cover_image_public_id'] = upload_result['public_id']
            except Exception as e:
                return Response({
                    'error': f'Cover image upload failed: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Upload PDF to Cloudinary if provided
        if pdf_file:
            try:
                upload_result = upload_pdf_to_cloudinary(pdf_file)
                book_data['pdf_file'] = upload_result['url']
                book_data['pdf_file_public_id'] = upload_result['public_id']
            except Exception as e:
                # Clean up cover image if it was uploaded
                if book_data.get('cover_image_public_id'):
                    delete_file_from_cloudinary(book_data['cover_image_public_id'], 'image')
                return Response({
                    'error': f'PDF upload failed: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create book in database
        book = Book.objects.create(**book_data)
        
        return Response({
            'message': 'Book created successfully',
            'book': BookSerializer(book).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Book creation failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_book(request, book_id):
    """Delete a book (admin only)"""
    try:
        book = Book.objects.get(id=book_id)
        book_title = book.title
        book.delete()
        return Response({
            'message': f'Book "{book_title}" deleted successfully'
        }, status=status.HTTP_200_OK)
    except Book.DoesNotExist:
        return Response({
            'error': 'Book not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_book(request, book_id):
    """Update a book (admin only) with explicit Cloudinary upload"""
    try:
        book = Book.objects.get(id=book_id)
        
        # Extract file fields
        cover_image_file = request.FILES.get('cover_image')
        pdf_file = request.FILES.get('pdf_file')
        
        # Update text fields
        if 'title' in request.data:
            book.title = request.data['title']
        if 'author' in request.data:
            book.author = request.data['author']
        if 'genre' in request.data:
            book.genre = request.data['genre']
        if 'description' in request.data:
            book.description = request.data['description']
        
        # Handle cover image update
        if cover_image_file:
            # Delete old image from Cloudinary if exists
            if book.cover_image_public_id:
                try:
                    delete_file_from_cloudinary(book.cover_image_public_id, 'image')
                except:
                    pass  # Continue even if deletion fails
            
            # Upload new image
            try:
                upload_result = upload_image_to_cloudinary(cover_image_file)
                book.cover_image = upload_result['url']
                book.cover_image_public_id = upload_result['public_id']
            except Exception as e:
                return Response({
                    'error': f'Cover image upload failed: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle PDF update
        if pdf_file:
            # Delete old PDF from Cloudinary if exists
            if book.pdf_file_public_id:
                try:
                    delete_file_from_cloudinary(book.pdf_file_public_id, 'raw')
                except:
                    pass  # Continue even if deletion fails
            
            # Upload new PDF
            try:
                upload_result = upload_pdf_to_cloudinary(pdf_file)
                book.pdf_file = upload_result['url']
                book.pdf_file_public_id = upload_result['public_id']
            except Exception as e:
                return Response({
                    'error': f'PDF upload failed: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save book
        book.save()
        
        return Response({
            'message': 'Book updated successfully',
            'book': BookSerializer(book).data
        }, status=status.HTTP_200_OK)
        
    except Book.DoesNotExist:
        return Response({
            'error': 'Book not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Book update failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def download_book(request, book_id):
#     """Download book PDF from Cloudinary (authenticated users only)"""
#     try:
#         book = Book.objects.get(id=book_id)
#         if not book.pdf_file:
#             return Response({
#                 'error': 'PDF file not available for this book'
#             }, status=status.HTTP_404_NOT_FOUND)
#         
#         # Fetch PDF from Cloudinary URL with retry logic
#         try:
#             import traceback
#             from requests.adapters import HTTPAdapter
#             from urllib3.util.retry import Retry
#             
#             print(f"Downloading PDF from: {book.pdf_file}")
#             
#             # Create a session with retry logic
#             session = requests.Session()
#             retry_strategy = Retry(
#                 total=3,
#                 backoff_factor=1,
#                 status_forcelist=[429, 500, 502, 503, 504],
#             )
#             adapter = HTTPAdapter(max_retries=retry_strategy)
#             session.mount("http://", adapter)
#             session.mount("https://", adapter)
#             
#             # Try with SSL verification first
#             try:
#                 response = session.get(book.pdf_file, stream=True, timeout=30)
#                 response.raise_for_status()
#             except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as ssl_error:
#                 print(f"SSL/Connection error, retrying without verification: {ssl_error}")
#                 # Fallback: disable SSL verification (only for Cloudinary CDN)
#                 response = session.get(book.pdf_file, stream=True, timeout=30, verify=False)
#                 response.raise_for_status()
#             
#             # Create streaming response
#             file_response = StreamingHttpResponse(
#                 response.iter_content(chunk_size=8192),
#                 content_type='application/pdf'
#             )
#             file_response['Content-Disposition'] = f'attachment; filename="{book.title}.pdf"'
#             
#             return file_response
#             
#         except requests.RequestException as e:
#             print(f"Download error: {str(e)}")
#             traceback.print_exc()
#             return Response({
#                 'error': f'Failed to download PDF: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#         except Exception as e:
#             print(f"Unexpected error: {str(e)}")
#             traceback.print_exc()
#             return Response({
#                 'error': f'Unexpected error: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#             
#     except Book.DoesNotExist:
#         return Response({
#             'error': 'Book not found'
#         }, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         import traceback
#         print(f"Outer exception: {str(e)}")
#         traceback.print_exc()
#         return Response({
#             'error': f'Server error: {str(e)}'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_book(request, book_id):
    """Return Cloudinary PDF URL for authenticated users"""
    try:
        book = Book.objects.get(id=book_id)
        
        if not book.pdf_file:
            return Response({
                'error': 'PDF file not available for this book'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate a signed URL that expires in 1 hour (3600 seconds)
        signed_url = cloudinary.utils.cloudinary_url(
            book.pdf_file_public_id,
            resource_type='raw',
            type='upload',        # Change to 'authenticated' if files are private
            sign_url=True,
            expires_at=int(__import__('time').time()) + 3600
        )[0]
        
        # Return the signed URL to the frontend
        return Response({
            'download_url': signed_url,
            'filename': f'{book.title}.pdf'
        })
        
    except Book.DoesNotExist:
        return Response({
            'error': 'Book not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)