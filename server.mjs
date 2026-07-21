import { createServer } from 'http';
import serverHandler from './dist/server/server.js';

// Get port from environment or use default
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

// Create HTTP server that uses the Fetch API handler
const server = createServer(async (req, res) => {
  try {
    // Convert Node.js request to Web API Request
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    
    // For GET/HEAD requests, don't include a body
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = req;
    }
    
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body,
    });

    // Call the Fetch API handler
    const response = await serverHandler.fetch(request);

    // Set response status and headers
    res.writeHead(response.status, Object.fromEntries(response.headers));

    // Stream the response body
    if (response.body) {
      try {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      } catch (streamError) {
        console.error('Stream error:', streamError);
      }
    }
    res.end();
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error\n' + error.message);
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
