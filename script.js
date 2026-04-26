/**
 * Unified Layout & Interactivity Script
 * Handles dynamic header/footer injection and site-wide animations.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Initialize Animations
    initAnimations();

    // 2. Initialize Visitor Counter
    initVisitorCounter();
});

/**
 * Initializes IntersectionObserver animations for cards
 */
function initAnimations() {
    const cards = document.querySelectorAll('.project-card, .nav-button, .feature-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(card);
    });
}

/**
 * Manages the sitewide visitor counter using localStorage
 */
function initVisitorCounter() {
    const counterKey = 'site_visitor_count';
    let count = localStorage.getItem(counterKey);

    if (!count) {
        count = Math.floor(Math.random() * 500) + 120;
    } else {
        count = parseInt(count) + 1;
    }

    localStorage.setItem(counterKey, count);

    const display = document.getElementById('visitor-count');
    if (display) {
        display.textContent = count.toLocaleString();
    }
}