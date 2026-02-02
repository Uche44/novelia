// Book Detail Page
//  Displays detailed information about a book and handles PDF downloads
// API URLs come from config.js


// Check if user is authenticated

function isAuthenticated() {
    return localStorage.getItem('noveliaToken') !== null;
}

// Get book ID from URL parameters

function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch book details from API

async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/`);
        
        if (!response.ok) {
            throw new Error('Book not found');
        }
        
        const book = await response.json();
        return book;
    } catch (error) {
        console.error('Error fetching book details:', error);
        throw error;
    }
}

// Display book details on the page

function displayBookDetails(book) {
    // Get image URL - all images now come from Django media
    let imageUrl;
    if (book.cover_image) {
        if (book.cover_image.startsWith('http')) {
            imageUrl = book.cover_image;
        } else if (book.cover_image.startsWith('/media/')) {
            // Path already includes /media/ prefix
            imageUrl = `${MEDIA_BASE_URL}${book.cover_image}`;
        } else {
            // Relative path without /media/ prefix
            imageUrl = `${MEDIA_BASE_URL}/media/${book.cover_image}`;
        }
    } else {
        imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect width="400" height="600" fill="%2315b1b1"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
    }

    // Get PDF URL - all PDFs now come from Django media
    let pdfUrl = '';
    if (book.pdf_file) {
        if (book.pdf_file.startsWith('http')) {
            pdfUrl = book.pdf_file;
        } else if (book.pdf_file.startsWith('/media/')) {
            // Path already includes /media/ prefix
            pdfUrl = `${MEDIA_BASE_URL}${book.pdf_file}`;
        } else {
            // Relative path without /media/ prefix
            pdfUrl = `${MEDIA_BASE_URL}/media/${book.pdf_file}`;
        }
    }

    // Update page elements
    document.getElementById('bookCover').src = imageUrl;
    document.getElementById('bookCover').alt = book.title;
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookGenre').textContent = book.genre;
    document.getElementById('bookDescription').textContent = book.description || 'No description available.';

    // Set up download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (pdfUrl) {
        downloadBtn.onclick = () => handleDownload(pdfUrl, book.title);
    } else {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-ban"></i> PDF Not Available';
        downloadBtn.style.opacity = '0.5';
        downloadBtn.style.cursor = 'not-allowed';
    }

    // Hide loading, show content
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('bookDetailContent').style.display = 'block';
}

// Handle PDF download with authentication check (Frontend-only)

async function handleDownload(pdfUrl, bookTitle) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        // Show alert and redirect to signup page
        alert('Please sign up or login to download books');
        window.location.href = './sign-up.html';
        return;
    }

    // User is authenticated - proceed with download
    const downloadBtn = document.getElementById('downloadBtn');
    const originalHTML = downloadBtn.innerHTML;
    
    try {
        // Show loading state
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        
        // Fetch the PDF as a blob
        const response = await fetch(pdfUrl);
        
        if (!response.ok) {
            throw new Error('Failed to download file');
        }
        
        const blob = await response.blob();
        
        // Create a blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${bookTitle}.pdf`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
        
        // Show success message
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        setTimeout(() => {
            downloadBtn.innerHTML = originalHTML;
            downloadBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download the book. Please try again.');
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.disabled = false;
    }
}

// Show error message

function showError() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
}

// Initialize page

async function initializePage() {
    const bookId = getBookIdFromURL();
    
    if (!bookId) {
        showError();
        return;
    }

    try {
        const book = await fetchBookDetails(bookId);
        displayBookDetails(book);
    } catch (error) {
        showError();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);