const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const fs = require('fs-extra');
const morgan = require('morgan');
const logger = require('./utils/logger');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
// Use morgan to log HTTP requests, forwarding to winston's info level
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Rate Limiting: Max 5 contact form submissions per hour per IP
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many requests from this IP, please try again after an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
const pages = ['about', 'contact', 'portfolio', 'navbar', '404'];

app.get('/', (req, res) => {
    res.render('index', { currentPage: 'index' });
});

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.render(page, { currentPage: page });
    });
    app.get(`/${page}.html`, (req, res) => {
        res.redirect(`/${page}`);
    });
});

// Contact Form POST Handler
app.post('/contact', contactLimiter, [
    body('name').trim().isLength({ min: 2 }).escape().withMessage('Name must be at least 2 characters.'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
    body('subject').trim().notEmpty().escape().withMessage('Subject is required.'),
    body('message').trim().isLength({ min: 10 }).escape().withMessage('Message must be at least 10 characters.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;
    const submission = {
        id: Date.now(),
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
    };

    try {
        const filePath = path.join(__dirname, 'contacts.json');
        
        // Ensure the file exists
        await fs.ensureFile(filePath);
        
        // Read existing data
        let contacts = [];
        const content = await fs.readFile(filePath, 'utf8');
        if (content) {
            contacts = JSON.parse(content);
        }
        
        // Add new submission
        contacts.push(submission);
        
        // Write back to file
        await fs.writeJson(filePath, contacts, { spaces: 2 });

        res.json({ success: true, message: 'Message received successfully!' });
    } catch (err) {
        logger.error('Error saving contact submission', { error: err.message, stack: err.stack });
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
});

// Handle 404
app.use((req, res) => {
    res.status(404).render('404', { currentPage: '404' });
});

app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}/`);
    logger.info(`Serving templates from: ${path.join(__dirname, 'views')}`);
});