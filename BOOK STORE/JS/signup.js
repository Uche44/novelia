// API Configuration from config.js

// Signup form handler
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                first_name: document.querySelector('input[placeholder="John"]').value,
                last_name: document.querySelector('input[placeholder="Doe"]').value,
                email: document.querySelector('input[type="email"]').value,
                phone_number: document.querySelector('input[type="tel"]').value,
                state: document.getElementById('state').value,
                city: document.querySelector('.city input').value,
                password: document.getElementById('password').value,
                password2: document.getElementById('confirmPassword').value,
                username: document.querySelector('input[type="email"]').value.split('@')[0] // Use email prefix as username
            };
            
            // Validate passwords match
            if (formData.password !== formData.password2) {
                document.getElementById('passwordError').style.display = 'block';
                return;
            } else {
                document.getElementById('passwordError').style.display = 'none';
            }
            
            try {
                // Show loading state
                const submitBtn = document.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating Account...';
                
                // Send signup request
                const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store user data in localStorage
                    localStorage.setItem('noveliaToken', data.token);
                    localStorage.setItem('noveliaUserEmail', data.user.email);
                    localStorage.setItem('noveliaUser', JSON.stringify(data.user));
                    
                    // Show success message
                    alert('Account created successfully! Welcome to Novelia.');
                    
                    // Redirect to login page
                    window.location.href = './login.html';
                } else {
                    // Show error message
                    let errorMessage = 'Registration failed. ';
                    if (data.email) {
                        errorMessage += 'Email: ' + data.email.join(', ');
                    } else if (data.password) {
                        errorMessage += 'Password: ' + data.password.join(', ');
                    } else {
                        errorMessage += JSON.stringify(data);
                    }
                    alert(errorMessage);
                    
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred. Please try again.');
                
                const submitBtn = document.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }
});