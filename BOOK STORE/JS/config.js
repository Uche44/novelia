// API Configuration
// Automatically uses the correct API URL based on environment

// Detect if we're in production (deployed on Vercel) or development (localhost)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Set API base URL based on environment
const API_BASE_URL = isProduction 
    ? 'https://novelia.onrender.com/api'
    : 'http://127.0.0.1:8000/api';

// Set media base URL (for images and PDFs)
const MEDIA_BASE_URL = isProduction
    ? 'https://novelia.onrender.com'
    : 'http://127.0.0.1:8000';

// Export for use in other files
window.API_CONFIG = {
    API_BASE_URL,
    MEDIA_BASE_URL,
    isProduction
};

console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('API URL:', API_BASE_URL);
