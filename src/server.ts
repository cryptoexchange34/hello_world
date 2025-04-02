import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { setupWebSocketServer } from './websocket/server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

async function startServer() {
  try {
    // Initialize Next.js
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    await app.prepare();
    console.log('Next.js app prepared');
    
    const server = createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Setup WebSocket server
    setupWebSocketServer(server);

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer(); 