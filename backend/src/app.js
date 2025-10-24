import express from 'express';
import cors from 'cors';
import { postsRoutes } from './routes/posts.js';
import { userRoutes } from './routes/users.js';

import { eventRoutes } from './routes/event.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

// middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// basic routes
app.get('/', (_req, res) => res.send('Hello from Express Nodemon!'));
app.get('/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() }),
);

// posts API
postsRoutes(app);
userRoutes(app);
eventRoutes(app);

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// error handler (4 args required by Express; ignore unused _next for lint)
/* eslint-disable-next-line no-unused-vars */
app.use((err, _req, res, next) => {
  console.error('[ERROR]', err?.message, err?.stack || '');
  if (res.headersSent) return next(err); // <-- use next, not return;
  res
    .status(err?.status || 500)
    .json({ message: err?.message || 'Server error' });
});

export { app };
