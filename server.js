const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle the root route by redirecting to index.html (main homepage)
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // If the requested file doesn't exist with extension, try adding .html
  if (!path.extname(filePath)) {
    filePath += '.html';
  }
  
  filePath = path.join(process.cwd(), filePath);
  
  // Resolve the path to prevent directory traversal
  const resolvedPath = path.resolve(process.cwd());
  const requestedPath = path.resolve(filePath);
  
  if (!requestedPath.startsWith(resolvedPath)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }
  
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Try to serve 404.html if it exists
        const errorPagePath = path.join(process.cwd(), '404.html');
        fs.readFile(errorPagePath, (err404, content404) => {
          if (err404) {
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content404, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${process.cwd()}`);
  console.log('Available pages:');
  console.log(`- http://localhost:${PORT}/ (Homepage with Navigation)`);
  console.log(`- http://localhost:${PORT}/index.html (Homepage)`);
  console.log(`- http://localhost:${PORT}/navbar.html (Navigation Page)`);
  console.log(`- http://localhost:${PORT}/portfolio.html (Portfolio)`);
  console.log(`- http://localhost:${PORT}/contact.html (Contact Form)`);
  console.log(`- http://localhost:${PORT}/404.html (Error Page)`);
});