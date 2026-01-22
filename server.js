/**
 * Basic Node.js Server
 * Simple HTTP server for development and future backend integration
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL
  let urlPath = req.url.split('?')[0];
  
  // Default to index.html for root
  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  // Remove leading slash for file path
  let filePath = path.join(__dirname, urlPath.substring(1));
  
  // Security check
  const resolvedPath = path.resolve(filePath);
  const resolvedDir = path.resolve(__dirname);
  
  if (!resolvedPath.startsWith(resolvedDir)) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>', 'utf-8');
    return;
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read and serve file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(`Error: ${error.code} - ${filePath}`);
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - File Not Found</h1><p>File: ${urlPath}</p>`, 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>500 - Server Error</h1><p>Error: ${error.code}</p>`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Click IT server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${__dirname}`);
  console.log('Press Ctrl+C to stop the server');
});
