const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
const pages = ['about', 'contact', 'portfolio', 'navbar', '404'];

app.get('/', (req, res) => {
    res.render('index', { currentPage: 'index' });
});

pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.render(page, { currentPage: page });
    });
    // Support .html suffix for backward compatibility if needed, 
    // but better to redirect or just handle it.
    app.get(`/${page}.html`, (req, res) => {
        res.redirect(`/${page}`);
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).render('404', { currentPage: '404' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving templates from: ${path.join(__dirname, 'views')}`);
});