const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5501;

// Mobile User-Agent detection regex
const MOBILE_REGEX = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function isMobileDevice(userAgent) {
  return MOBILE_REGEX.test(userAgent);
}

// Serve static assets (CSS, JS, images) from root for both versions
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Smart routing middleware - detects mobile vs desktop
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = isMobileDevice(userAgent);
  
  // Skip for static assets
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  // Determine which version to serve
  let filePath;
  
  if (isMobile) {
    // Serve mobile version
    if (req.path === '/' || req.path === '/index.html') {
      filePath = path.join(__dirname, 'mobile', 'index.html');
    } else {
      // Try mobile-specific page first, fallback to desktop
      const mobilePath = path.join(__dirname, 'mobile', req.path, 'index.html');
      const desktopPath = path.join(__dirname, req.path, 'index.html');
      
      if (fs.existsSync(mobilePath)) {
        filePath = mobilePath;
      } else if (fs.existsSync(desktopPath)) {
        filePath = desktopPath;
      } else if (req.path.endsWith('.html')) {
        filePath = path.join(__dirname, req.path);
      }
    }
  } else {
    // Serve desktop version (default)
    if (req.path === '/' || req.path === '/index.html') {
      filePath = path.join(__dirname, 'index.html');
    } else if (req.path.endsWith('/')) {
      filePath = path.join(__dirname, req.path, 'index.html');
    } else if (req.path.endsWith('.html')) {
      filePath = path.join(__dirname, req.path);
    } else {
      filePath = path.join(__dirname, req.path, 'index.html');
    }
  }
  
  // Serve the file if it exists
  if (filePath && fs.existsSync(filePath)) {
    console.log(`[${isMobile ? '📱 MOBILE' : '💻 DESKTOP'}] ${req.path} -> ${path.relative(__dirname, filePath)}`);
    return res.sendFile(filePath);
  }
  
  next();
});

// Fallback static middleware
app.use(express.static(__dirname));

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`\n🚀 Smart Server Running!`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - Network:  http://10.0.0.163:${PORT}`);
  console.log(`\n📱 Mobile detection: Active`);
  console.log(`💻 Desktop version: ./index.html`);
  console.log(`📱 Mobile version:  ./mobile/index.html\n`);
});
