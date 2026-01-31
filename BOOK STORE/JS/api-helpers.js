// Helper function to get API URLs from config
function getAPIURL() {
    return window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';
}

function getMediaURL() {
    return window.API_CONFIG?.MEDIA_BASE_URL || 'http://127.0.0.1:8000';
}

// Export for use in scripts
window.getAPIURL = getAPIURL;
window.getMediaURL = getMediaURL;
