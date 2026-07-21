import { createServer } from 'http';
import serverHandler from './dist/server/server.js';

// Get port from environment or use default
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

// Create HTTP server that uses the Fetch API handler
const server = createServer(async (req, res) => {
  try {
    // Convert Node.js request to Web API Request
    const url = new URL(req.url, `http://${req.headers.host}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
    });

    // Call the Fetch API handler
    const response = await serverHandler.fetch(request);

    // Set response status and headers
    res.writeHead(response.status, Object.fromEntries(response.headers));

    // Stream the response body
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    }
    res.end();
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Start listening
server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
