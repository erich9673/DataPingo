const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5501;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Root
  if (pathname === '/') {
    serveFile(path.join(__dirname, 'index.html'), res);
    return;
  }

  // Trailing slash means "this is a directory URL" - go straight to its index.html,
  // mirroring GitHub Pages, which does not strip the slash and re-check extensions.
  if (pathname.endsWith('/')) {
    const indexPath = path.join(__dirname, pathname, 'index.html');
    if (fs.existsSync(indexPath)) {
      serveFile(indexPath, res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - File Not Found</h1>');
    return;
  }

  const filePath = path.join(__dirname, pathname);

  // Exact file match
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(filePath, res);
    return;
  }

  // No extension: try adding .html (matches GitHub Pages priority)
  if (!path.extname(pathname)) {
    const htmlFilePath = filePath + '.html';
    if (fs.existsSync(htmlFilePath)) {
      serveFile(htmlFilePath, res);
      return;
    }
  }

  // Directory without trailing slash: GitHub Pages 301-redirects to add the slash
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && fs.existsSync(path.join(filePath, 'index.html'))) {
    res.writeHead(301, { Location: pathname + '/' });
    res.end();
    return;
  }

  // File not found
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 - File Not Found</h1>');
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 - Internal Server Error</h1>');
      return;
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Clean URLs enabled - access pages without .html extension');
});