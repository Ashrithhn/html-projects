/**
 * Unified Layout & Interactivity Script
 * Handles dynamic header/footer injection and site-wide animations.
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Inject Header & Footer
    injectLayout();
    
    // 2. Initialize Animations
    initAnimations();
    
    // 3. Initialize Visitor Counter
    initVisitorCounter();
});

/**
 * Injects the unified Header and Footer into the page
 */
function injectLayout() {
    const body = document.body;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // --- Header Construction ---
    const header = document.createElement('header');
    header.className = 'main-header';
    header.innerHTML = `
        <div class="header-container">
            <a href="index.html" class="logo">Nexus Core</a>
            <nav>
                <ul class="nav-menu">
                    <li><a href="index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">Home</a></li>
                    <li><a href="about.html" class="nav-link ${currentPage === 'about.html' ? 'active' : ''}">About</a></li>
                    <li><a href="portfolio.html" class="nav-link ${currentPage === 'portfolio.html' ? 'active' : ''}">Portfolio</a></li>
                    <li><a href="contact.html" class="nav-link ${currentPage === 'contact.html' ? 'active' : ''}">Contact</a></li>
                </ul>
            </nav>
        </div>
    `;
    body.prepend(header);

    // --- Footer Construction ---
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-brand">
                <h2>Nexus Core Projects</h2>
                <p>A collection of modern web projects showcasing clean design and interactive experiences.</p>
            </div>
            <div class="footer-links">
                <h3>Navigation</h3>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="portfolio.html">Portfolio</a></li>
                    <li><a href="navbar.html">Nav Hub</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h3>Connect</h3>
                <ul>
                    <li><a href="https://github.com/NexusCore">GitHub</a></li>
                    <li><a href="contact.html">Contact Me</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} Nexus Core. All rights reserved.</p>
            <div class="visit-counter">
                Visitors: <span id="visitor-count">...</span>
            </div>
        </div>
    `;
    body.appendChild(footer);
}

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