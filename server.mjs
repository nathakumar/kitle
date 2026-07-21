import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the TanStack Start server
const { createServer } = await import('./dist/server/server.js');

// Create and start the server
const server = createServer();

// Get port from environment or use default
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

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
