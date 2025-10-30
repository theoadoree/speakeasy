const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from current directory with no caching for development
app.use(express.static(__dirname, {
  maxAge: 0,
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-static routes EXCEPT /terms and /privacy
// Use middleware without path parameter to avoid path-to-regexp issues
app.use((req, res) => {
  // If requesting terms.html or privacy.html, serve them directly
  if (req.path === '/terms' || req.path === '/terms.html') {
    return res.sendFile(path.join(__dirname, 'terms.html'));
  }
  if (req.path === '/privacy' || req.path === '/privacy.html') {
    return res.sendFile(path.join(__dirname, 'privacy.html'));
  }
  // Otherwise, serve the React app
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeakEasy web app running on port ${PORT}`);
  console.log(`Serving static files from: ${__dirname}`);
});
