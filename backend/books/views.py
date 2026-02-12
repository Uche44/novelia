from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .models import Book
from .serializers import BookSerializer, BookCreateSerializer


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
    """Create a new book (admin only)"""
    serializer = BookCreateSerializer(data=request.data)
    if serializer.is_valid():
        book = serializer.save()
        return Response({
            'message': 'Book created successfully',
            'book': BookSerializer(book).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    """Update a book (admin only)"""
    try:
        book = Book.objects.get(id=book_id)
        serializer = BookCreateSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            book = serializer.save()
            return Response({
                'message': 'Book updated successfully',
                'book': BookSerializer(book).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Book.DoesNotExist:
        return Response({
            'error': 'Book not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_book(request, book_id):
    """Download book PDF (authenticated users only)"""
    try:
        book = Book.objects.get(id=book_id)
        if not book.pdf_file:
            return Response({
                'error': 'PDF file not available for this book'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Return the Cloudinary URL for the frontend to handle the download
        return Response({
            'download_url': book.pdf_file
        })
    except Book.DoesNotExist:
        return Response({
            'error': 'Book not found'
        }, status=status.HTTP_404_NOT_FOUND)
