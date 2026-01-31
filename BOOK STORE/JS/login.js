// API Configuration
// Use API URL from config.js

// Login form handler - API URL comes from config.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent form from submitting normally
            
            // Get form data
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                // Show loading state
                const submitBtn = document.getElementById('submitBtn');
                const btnText = submitBtn.querySelector('.btn-text');
                const spinner = submitBtn.querySelector('.spinner');
                
                submitBtn.disabled = true;
                btnText.textContent = 'Signing In...';
                spinner.style.display = 'inline-block';
                
                // Get API URL from config.js
                const API_BASE_URL = window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';
                
                // Send login request
                const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store user data in localStorage
                    localStorage.setItem('noveliaToken', data.token);
                    localStorage.setItem('noveliaUserEmail', data.user.email);
                    localStorage.setItem('noveliaUser', JSON.stringify(data.user));
                    
                    // Show success message
                    alert('Login successful! Welcome back.');
                    
                    // Check if user is admin/superuser and redirect accordingly
                    if (data.user.is_superuser || data.user.is_staff) {
                        // Redirect to admin dashboard
                        window.location.href = './admin-dashboard.html';
                    } else {
                        // Redirect to user dashboard
                        window.location.href = './user-dashboard.html';
                    }
                } else {
                    // Show error message
                    alert(data.error || 'Invalid email or password');
                    
                    submitBtn.disabled = false;
                    btnText.textContent = 'Sign In';
                    spinner.style.display = 'none';
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred. Please try again.');
                
                const submitBtn = document.getElementById('submitBtn');
                const btnText = submitBtn.querySelector('.btn-text');
                const spinner = submitBtn.querySelector('.spinner');
                
                submitBtn.disabled = false;
                btnText.textContent = 'Sign In';
                spinner.style.display = 'none';
            }
        });
    }
});