const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const fs = require('fs-extra');
const morgan = require('morgan');
const logger = require('./utils/logger');
const nodemailer = require('nodemailer');

// Configure Nodemailer Transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || null,
        pass: process.env.SMTP_PASS || null
    }
});

const isMailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
if (!isMailConfigured) {
    logger.warn('SMTP credentials not configured. Email notifications will be logged instead of sent.');
}

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
app.use(express.static(path.join(__dirname, 'public')));

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

        // Send email notification
        const mailOptions = {
            from: process.env.CONTACT_SENDER || 'no-reply@nexuscore.io',
            to: process.env.CONTACT_RECEIVER || 'admin@nexuscore.io',
            subject: `New Contact Form Submission: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 0;">New Contact Form Submission</h2>
                    <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></p>
                    <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="margin: 10px 0;"><strong>Message:</strong></p>
                    <div style="white-space: pre-wrap; background: #f7fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; font-style: italic; color: #4a5568;">${message}</div>
                </div>
            `
        };

        if (isMailConfigured) {
            try {
                await transporter.sendMail(mailOptions);
                logger.info('Email notification sent successfully.');
            } catch (mailErr) {
                logger.error('Failed to send email notification', { error: mailErr.message, stack: mailErr.stack });
            }
        } else {
            logger.info(`SMTP not configured. Logged notification details: ${JSON.stringify(mailOptions, null, 2)}`);
        }

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