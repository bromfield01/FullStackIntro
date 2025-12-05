// src/index.js
import 'dotenv/config';

import { initDatabase } from './db/init.js';
import { server } from './app.js'; // ⬅️ import the HTTP server, not app

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

await initDatabase();

server.listen(PORT, HOST, () => {
  console.info(`🚀 HTTP + Socket.IO server running at http://${HOST}:${PORT}`);
});

// --- optional but recommended: graceful shutdown ---

function shutdown(signal) {
  console.info(`\n${signal} received, shutting down...`);
  server.close((err) => {
    if (err) {
      console.error('Error while closing server:', err);
      process.exit(1);
    }
    console.info('Server closed gracefully.');
    process.exit(0);
  });

  // safety timeout in case connections never close
  setTimeout(() => {
    console.warn('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
