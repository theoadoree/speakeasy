const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from dist directory with proper caching
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-static routes
// This should come AFTER static middleware so assets are served first
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeakEasy web app running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});
