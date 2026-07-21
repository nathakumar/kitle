import serverHandler from '../dist/server/server.js';

export default async function handler(req, res) {
  try {
    // Convert Node.js request to Web API Request
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    
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
    res.status(response.status);
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

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
    res.status(500).send('Internal Server Error\n' + error.message);
  }
}
