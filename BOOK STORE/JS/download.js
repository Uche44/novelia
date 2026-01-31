// API Configuration
// Use API URL from config.js
const API_BASE_URL = window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';


// Check if user is authenticated

function isAuthenticated() {
    return localStorage.getItem('noveliaToken') !== null;
}


// Get auth token from localStorage

function getAuthToken() {
    return localStorage.getItem('noveliaToken');
}


// Handle book download with authentication check

async function downloadBook(bookId, bookTitle) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        alert('Please login to download books');
        window.location.href = '/BOOK STORE/HTML/sign-up.html';
        return;
    }
    
    try {
        const token = getAuthToken();
        
        // Fetch the PDF from protected endpoint
        const response = await fetch(`${API_BASE_URL}/books/download/${bookId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        
        if (response.ok) {
            // Get the blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${bookTitle}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else if (response.status === 401) {
            alert('Your session has expired. Please login again.');
            localStorage.clear();
            window.location.href = '/BOOK STORE/HTML/login.html';
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to download book');
        }
    } catch (error) {
        console.error('Download error:', error);
        alert('An error occurred while downloading. Please try again.');
    }
}


// Initialize download buttons

document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.download');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get book ID and title from data attributes or page
            const bookId = this.getAttribute('data-book-id');
            const bookTitle = this.getAttribute('data-book-title') || 
                             document.querySelector('.words h1')?.textContent || 
                             'book';
            
            downloadBook(bookId, bookTitle);
        });
    });
});


// Update UI based on authentication status

function updateAuthUI() {
    const isLoggedIn = isAuthenticated();
    const userEmail = localStorage.getItem('noveliaUserEmail');
    
    // Update navigation links
    const loginLinks = document.querySelectorAll('a[href*="login.html"]');
    loginLinks.forEach(link => {
        if (isLoggedIn) {
            link.textContent = userEmail;
            link.href = '#';
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Do you want to logout?')) {
                    logout();
                }
            });
        }
    });
}


// Logout function

async function logout() {
    const token = getAuthToken();
    
    try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Redirect to homepage
    window.location.href = '/BOOK STORE/index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);
