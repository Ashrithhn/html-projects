// Enhanced script to add interactivity to the HTML projects page

document.addEventListener('DOMContentLoaded', function() {
    // Add animation to project cards when they come into view
    const projectCards = document.querySelectorAll('.project-card');
    
    // Add fade-in-up class to all cards initially
    projectCards.forEach((card, index) => {
        card.classList.add('fade-in-up');
        card.style.transitionDelay = `${index * 0.15}s`;
    });
    
    // Create intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all project cards
    projectCards.forEach(card => {
        observer.observe(card);
    });
    
    // Add click event to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Project gallery coming soon! Meanwhile, check out the console for project details.');
            
            // Log project information to console
            console.log('HTML Projects Collection - Featured Projects:');
            console.log('1. Interactive Calculator: A responsive calculator with modern UI design and smooth animations');
            console.log('2. Weather Dashboard: Real-time weather app with beautiful visualizations and forecasts');
            console.log('3. Portfolio Website: Personal portfolio showcasing projects and skills with smooth transitions');
            console.log('4. E-commerce Landing: Modern shopping interface with product showcase and cart functionality');
        });
    });
    
    // Add click events to project cards
    projectCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const projects = [
                'Interactive Calculator: A responsive calculator with modern UI design and smooth animations',
                'Weather Dashboard: Real-time weather app with beautiful visualizations and forecasts',
                'Portfolio Website: Personal portfolio showcasing projects and skills with smooth transitions',
                'E-commerce Landing: Modern shopping interface with product showcase and cart functionality'
            ];
            
            alert(`Project Details:\n${projects[index]}`);
        });
    });
    
    // Add footer with visitor counter
    const container = document.querySelector('.container');
    if (container) {
        const footer = document.createElement('footer');
        footer.innerHTML = `
            <p>Built with ❤️ using HTML, CSS, and JavaScript</p>
            <div class='visit-counter'>Visitors: <span id='visitor-count'>--</span></div>
        `;
        container.appendChild(footer);
        
        // Initialize visitor counter
        initializeVisitorCounter();
    }
});

// Initialize visitor counter
function initializeVisitorCounter() {
    // Get stored count or start with a random number
    let visitorCount = localStorage.getItem('visitorCount');
    
    if (!visitorCount) {
        visitorCount = Math.floor(Math.random() * 500) + 100; // Random number between 100-600
        localStorage.setItem('visitorCount', visitorCount);
    } else {
        visitorCount = parseInt(visitorCount);
        visitorCount++; // Increment for new visitor
        localStorage.setItem('visitorCount', visitorCount);
    }
    
    // Update the counter display
    const counterElement = document.getElementById('visitor-count');
    if (counterElement) {
        counterElement.textContent = visitorCount.toLocaleString();
    }
}