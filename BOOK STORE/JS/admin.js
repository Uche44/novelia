// API Configuration
// Use API URL from config.js
const API_BASE_URL = window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';

let currentEditBookId = null;

// Check if user is authenticated

function isAuthenticated() {
    return localStorage.getItem('noveliaToken') !== null;
}

// Get auth token from localStorage

function getAuthToken() {
    return localStorage.getItem('noveliaToken');
}

// Tab switching

function initTabs() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            menuItems.forEach(mi => mi.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Load data for the tab
            if (tabName === 'users') {
                fetchUsers();
            } else if (tabName === 'books') {
                fetchBooks();
            }
        });
    });
}

// Fetch all users from API

async function fetchUsers() {
    const token = getAuthToken();
    
    if (!token) {
        alert('Please login as admin to access this page');
        window.location.href = './login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/users/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayUsers(data.users);
            updateUserStats(data.users);
        } else if (response.status === 403) {
            alert('You do not have admin privileges');
            window.location.href = '../index.html';
        } else if (response.status === 401) {
            alert('Your session has expired. Please login again.');
            localStorage.clear();
            window.location.href = './login.html';
        } else {
            throw new Error('Failed to fetch users');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="5" class="error">Failed to load users. Please try again.</td></tr>';
    }
}

// Display users in table

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No users registered yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.phone_number || 'N/A'}</td>
            <td>${user.city ? `${user.city}, ${user.state}` : user.state || 'N/A'}</td>
            <td>${new Date(user.date_joined).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Update user statistics

function updateUserStats(users) {
    // Total users
    document.getElementById('totalUsers').textContent = users.length;
    
    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = users.filter(user => 
        new Date(user.date_joined) >= sevenDaysAgo
    );
    
    document.getElementById('recentUsers').textContent = recentUsers.length;
}

// Fetch all books from API

async function fetchBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books/`);
        
        if (response.ok) {
            const data = await response.json();
            displayBooks(data.books);
            updateBookStats(data.books);
        } else {
            throw new Error('Failed to fetch books');
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        document.getElementById('booksTableBody').innerHTML = 
            '<tr><td colspan="5" class="error">Failed to load books. Please try again.</td></tr>';
    }
}

// Display books in table

function displayBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No books available</td></tr>';
        return;
    }
    
    tbody.innerHTML = books.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>
                <button class="btn-edit" onclick="editBook(${book.id})">Edit</button>
                <button class="btn-danger" onclick="deleteBook(${book.id}, '${book.title}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update book statistics

function updateBookStats(books) {
    // Total books
    document.getElementById('totalBooks').textContent = books.length;
    
    // Unique genres
    const genres = new Set(books.map(book => book.genre));
    document.getElementById('totalGenres').textContent = genres.size;
}

// Open modal for adding new book

function openAddBookModal() {
    currentEditBookId = null;
    document.getElementById('modalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookModal').classList.add('active');
}

// Edit book

async function editBook(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/`);
        
        if (response.ok) {
            const book = await response.json();
            currentEditBookId = bookId;
            
            // Populate form (note: file inputs cannot be pre-filled for security reasons)
            document.getElementById('modalTitle').textContent = 'Edit Book';
            document.getElementById('bookTitle').value = book.title;
            document.getElementById('bookAuthor').value = book.author;
            document.getElementById('bookGenre').value = book.genre;
            document.getElementById('bookDescription').value = book.description;
            
            // Show note about files
            alert('Note: You can upload new files to replace existing cover image and PDF.');
            
            document.getElementById('bookModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error fetching book:', error);
        alert('Failed to load book details');
    }
}

// Delete book

async function deleteBook(bookId, bookTitle) {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
        return;
    }
    
    const token = getAuthToken();
    
    try {
        const response = await fetch(`${API_BASE_URL}/books/delete/${bookId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        
        if (response.ok) {
            alert('Book deleted successfully!');
            fetchBooks();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('An error occurred while deleting the book');
    }
}

// Submit book form (create or update)

async function submitBookForm(e) {
    e.preventDefault();
    
    const token = getAuthToken();
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', document.getElementById('bookTitle').value);
    formData.append('author', document.getElementById('bookAuthor').value);
    formData.append('genre', document.getElementById('bookGenre').value);
    formData.append('description', document.getElementById('bookDescription').value);
    
    // Add files
    const coverFile = document.getElementById('bookCover').files[0];
    const pdfFile = document.getElementById('bookPDF').files[0];
    
    if (coverFile) {
        formData.append('cover_image', coverFile);
    }
    if (pdfFile) {
        formData.append('pdf_file', pdfFile);
    }
    
    try {
        let url, method;
        
        if (currentEditBookId) {
            // Update existing book
            url = `${API_BASE_URL}/books/${currentEditBookId}/update/`;
            method = 'PUT';
        } else {
            // Create new book
            url = `${API_BASE_URL}/books/create/`;
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Token ${token}`
                // Don't set Content-Type, let browser set it with boundary for multipart/form-data
            },
            body: formData
        });
        
        if (response.ok) {
            alert(currentEditBookId ? 'Book updated successfully!' : 'Book created successfully!');
            closeModal();
            fetchBooks();
        } else {
            const data = await response.json();
            alert(JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('An error occurred while saving the book');
    }
}

// Close modal

function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
    document.getElementById('bookForm').reset();
    currentEditBookId = null;
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
    
    localStorage.clear();
    window.location.href = '../index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        alert('Please login to access the admin dashboard');
        window.location.href = './login.html';
        return;
    }
    
    // Initialize tabs
    initTabs();
    
    // Load initial data (users tab is active by default)
    fetchUsers();
    
    // Modal controls
    document.getElementById('addBookBtn').addEventListener('click', openAddBookModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('bookForm').addEventListener('submit', submitBookForm);
    
    // Close modal when clicking outside
    document.getElementById('bookModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
});
