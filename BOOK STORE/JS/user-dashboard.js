// API Configuration from config.js

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return localStorage.getItem('noveliaToken') !== null;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
    return localStorage.getItem('noveliaToken');
}

/**
 * Load user profile data
 */
function loadUserProfile() {
    const userDataStr = localStorage.getItem('noveliaUser');
    
    if (!userDataStr) {
        alert('Please login to access your dashboard');
        window.location.href = './login.html';
        return;
    }
    
    try {
        const userData = JSON.parse(userDataStr);
        
        // Update profile information
        document.getElementById('userName').textContent = userData.first_name || 'User';
        document.getElementById('userEmail').textContent = userData.email || 'N/A';
        document.getElementById('userFullName').textContent = 
            `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'N/A';
        document.getElementById('userPhone').textContent = userData.phone_number || 'N/A';
        document.getElementById('userState').textContent = userData.state || 'N/A';
        document.getElementById('userCity').textContent = userData.city || 'N/A';
        
        // Update location stat
        if (userData.city && userData.state) {
            document.getElementById('userLocation').textContent = `${userData.city}, ${userData.state}`;
        } else if (userData.state) {
            document.getElementById('userLocation').textContent = userData.state;
        }
        
        // Update member since
        if (userData.date_joined) {
            const joinDate = new Date(userData.date_joined);
            document.getElementById('memberSince').textContent = joinDate.getFullYear();
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('Error loading profile. Please login again.');
        window.location.href = './login.html';
    }
}

/**
 * Logout function
 */
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
        alert('Please login to access your dashboard');
        window.location.href = './login.html';
        return;
    }
    
    // Load user profile
    loadUserProfile();
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
});
