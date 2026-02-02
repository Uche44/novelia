// Navbar Authentication Handler
// Updates navbar to show "Go to Dashboard" when user is logged in

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
});

function updateNavbar() {
    // Check if user is authenticated
    const token = localStorage.getItem('noveliaToken');
    const user = localStorage.getItem('noveliaUser');
    
    if (token && user) {
        // User is logged in
        const userData = JSON.parse(user);
        const loginLink = document.querySelector('a[href*="login.html"]');
        
        if (loginLink) {
            // Determine if we're on index.html or in HTML folder
            const currentPath = window.location.pathname;
            const isInHtmlFolder = currentPath.includes('/HTML/');
            
            // Determine dashboard URL based on user role and current location
            let dashboardUrl;
            if (userData.is_superuser || userData.is_staff) {
                dashboardUrl = isInHtmlFolder ? './admin-dashboard.html' : './HTML/admin-dashboard.html';
            } else {
                dashboardUrl = isInHtmlFolder ? './user-dashboard.html' : './HTML/user-dashboard.html';
            }
            
            // Update the link
            loginLink.textContent = 'Go to Dashboard';
            loginLink.href = dashboardUrl;
            
            // Add a visual indicator (optional)
            loginLink.style.fontWeight = '600';
        }
    }
}

// Export for use in other scripts
window.updateNavbar = updateNavbar;
