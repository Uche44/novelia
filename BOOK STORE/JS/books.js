// API Configuration
// Use API URL from config.js
const API_BASE_URL = window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';
const MEDIA_BASE_URL = window.API_CONFIG?.MEDIA_BASE_URL || 'http://127.0.0.1:8000';

// Fetch and display books from API
async function loadBooks(genre = '') {
    try {
        let url = `${API_BASE_URL}/books/`;
        if (genre) {
            url += `?genre=${encodeURIComponent(genre)}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            displayBooks(data.books);
        } else {
            throw new Error('Failed to fetch books');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        const container = document.getElementById('book-section');
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Failed to load books. Please make sure the backend server is running.</p>';
    }
}


// Display books in grid
function displayBooks(books) {
    const container = document.getElementById('book-section');
    
    if (books.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No books found. Please check back later!</p>';
        return;
    }
    
    container.innerHTML = books.map(book => {
        // Get the image URL - all images now come from Django media
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
            // SVG placeholder - no external file needed
            imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect width="200" height="300" fill="%2315b1b1"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
        }
        
        return `
            <div class="B-nov-grids">
                <a href="./book-detail.html?id=${book.id}">
                    <div class="B-nov-img">
                        <img src="${imageUrl}" alt="${book.title}">
                    </div>
                    <div class="B-nov-words">
                        <h3>${book.title}</h3>
                        <p>Author: ${book.author}</p>
                        <p>Genre: ${book.genre}</p>
                        <a href="./book-detail.html?id=${book.id}">Read more</a>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}



// Search books
async function searchBooks(query) {
    try {
        const url = `${API_BASE_URL}/books/?search=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            displayBooks(data.books);
        }
    } catch (error) {
        console.error('Error searching books:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load all books initially
    loadBooks();
    
    // Genre filter
    const genreSelect = document.querySelector('.all-gen');
    if (genreSelect) {
        genreSelect.addEventListener('change', function() {
            const selectedGenre = this.value;
            if (selectedGenre === '' || selectedGenre === 'all') {
                loadBooks();
            } else {
                loadBooks(selectedGenre);
            }
        });
    }
    
    // Search functionality
    const searchInput = document.querySelector('.ser-for');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query) {
                searchBooks(query);
            } else {
                loadBooks();
            }
        });
    }
});
