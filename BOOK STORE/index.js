// Homepage - Load books from Django API
// API URLs come from config.js (window.API_CONFIG)

// Fetch and display books on homepage
async function loadHomepageBooks() {
    try {
        const response = await fetch(`${window.API_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api'}/books/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        const books = data.books || [];
        
        // Display first 4 books on homepage
        displayHomepageBooks(books.slice(0, 4));
        
    } catch (error) {
        console.error('Error loading books:', error);
        const container = document.getElementById('book-section');
        if (container) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Unable to load books. Please try again later.</p>';
        }
    }
}

// Display books in homepage grid
function displayHomepageBooks(books) {
    const container = document.getElementById('book-section');
    
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No books available yet. Check back soon!</p>';
        return;
    }
    
    container.innerHTML = books.map(book => {
        // Get the image URL
        let imageUrl;
        if (book.cover_image) {
            if (book.cover_image.startsWith('http')) {
                imageUrl = book.cover_image;
            } else if (book.cover_image.startsWith('/media/')) {
                imageUrl = `${MEDIA_BASE_URL}${book.cover_image}`;
            } else {
                imageUrl = `${MEDIA_BASE_URL}/media/${book.cover_image}`;
            }
        } else {
            // SVG placeholder
            imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect width="200" height="300" fill="%2315b1b1"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
        }
        
        return `
            <div class="B-nov-grids">
                <a href="./HTML/book-detail.html?id=${book.id}">
                    <div class="B-nov-img">
                        <img src="${imageUrl}" alt="${book.title}">
                    </div>
                    <div class="B-nov-words">
                        <h3>${book.title}</h3>
                        <p>Author: ${book.author}</p>
                        <p>Genre: ${book.genre}</p>
                        <a href="./HTML/book-detail.html?id=${book.id}">Read more</a>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadHomepageBooks();
    
    // Existing code for smooth scrolling, animations, etc.
    initSmoothScrolling();
    initScrollAnimations();
    initMobileMenu();
    initScrollProgress();
});


// SMOOTH SCROLLING FOR NAVIGATION LINKS

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// MOBILE MENU TOGGLE
function initMobileMenu() {
    const nav = document.querySelector('nav');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (!nav || !navLinksContainer) return;
    
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(hamburger);
    
    hamburger.addEventListener('click', function() {
        navLinksContainer.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// SCROLL ANIMATIONS - FADE IN ON SCROLL
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.B-nov-grids, .authors-grid, .event-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// SCROLL PROGRESS BAR
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(to right, #15b1b1, #00d1d1);
        width: 0%;
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}
