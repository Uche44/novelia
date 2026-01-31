
// Event Attendance Management
// Handles user attendance for events with authentication checks


// Use API URL from config.js
const API_BASE_URL = window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';

// Check if user is authenticated

function isAuthenticated() {
    return localStorage.getItem('noveliaToken') !== null;
}

// Get attended events from localStorage
 
function getAttendedEvents() {
    const attended = localStorage.getItem('attendedEvents');
    return attended ? JSON.parse(attended) : [];
}

// Save attended event to localStorage
 
function addAttendedEvent(eventId) {
    const attended = getAttendedEvents();
    if (!attended.includes(eventId)) {
        attended.push(eventId);
        localStorage.setItem('attendedEvents', JSON.stringify(attended));
    }
}

// Check if user is attending an event
 
function isAttending(eventId) {
    return getAttendedEvents().includes(eventId);
}

// Initialize event cards with unique IDs and attendance functionality
 
function initializeEvents() {
    const eventCards = document.querySelectorAll('.cards');
    
    eventCards.forEach((card, index) => {
        const eventId = `event-${index + 1}`;
        card.setAttribute('data-event-id', eventId);
        
        const attendBtn = card.querySelector('.attend-btn');
        const countSpan = card.querySelector('.count');
        const cardBody = card.querySelector('.card-body');
        
        if (attendBtn && countSpan) {
            // Check if user is already attending
            if (isAttending(eventId)) {
                showAttendingBanner(cardBody, attendBtn);
            }
            
            // Add click event listener
            attendBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleAttendance(eventId, attendBtn, countSpan, cardBody);
            });
        }
    });
}

// Handle attendance button click
 
function handleAttendance(eventId, button, countSpan, cardBody) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        // Redirect to signup page if not authenticated
        window.location.href = './signup.html';
        return;
    }
    
    // Check if already attending
    if (isAttending(eventId)) {
        return; // User can only attend once
    }
    
    // Increment attendee count
    const currentCount = parseInt(countSpan.textContent);
    countSpan.textContent = currentCount + 1;
    
    // Save to localStorage
    addAttendedEvent(eventId);
    
    // Show attending banner
    showAttendingBanner(cardBody, button);
}

// Show "You are attending" banner
 
function showAttendingBanner(cardBody, button) {
    // Check if banner already exists
    if (cardBody.querySelector('.attending-banner')) {
        return;
    }
    
    // Create banner
    const banner = document.createElement('div');
    banner.className = 'attending-banner';
    banner.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#15b1b1" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span>You are attending this event</span>
    `;
    
    // Insert banner before the button row
    const buttonRow = cardBody.querySelector('.row');
    cardBody.insertBefore(banner, buttonRow);
    
    // Update button state
    button.disabled = true;
    button.textContent = 'Attending';
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEvents);
