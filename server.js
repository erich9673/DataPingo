const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5501;

// Serve static files from the current directory
app.use(express.static('.'));

// Middleware to handle clean URLs - serve .html files without extension
app.use((req, res, next) => {
  if (req.path.indexOf('.') === -1) {
    const htmlFile = path.join(__dirname, req.path + '.html');
    
    // Check if the .html file exists
    if (fs.existsSync(htmlFile)) {
      return res.sendFile(htmlFile);
    }
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Clean URLs enabled - .html files accessible without extension');
});