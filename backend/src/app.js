// backend/src/app.js
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { postsRoutes } from './routes/posts.js';
import { userRoutes } from './routes/users.js';
import { handleSocket } from './socket.js';

const app = express();

// basic hardening
app.disable('x-powered-by');
app.set('trust proxy', true);

// --- MIDDLEWARE ---

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*', // tighten in prod
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- BASIC ROUTES ---

app.get('/', (_req, res) => {
  res.send('Hello from Express Nodemon!');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// --- FEATURE ROUTES ---

postsRoutes(app);
userRoutes(app);

// --- HTTP SERVER + SOCKET.IO ---

const server = createServer(app);

const io = new SocketIOServer(server, {
  path: '/socket.io', // must match client
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// wire socket handlers (with JWT auth inside handleSocket)
handleSocket(io);

// optional: make io available to routes/services
app.set('io', io);

// --- 404 HANDLER ---

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- ERROR HANDLER ---

/* eslint-disable-next-line no-unused-vars */
app.use((err, _req, res, next) => {
  console.error('[ERROR]', err?.message, err?.stack || '');
  if (res.headersSent) return next(err);
  res
    .status(err?.status || 500)
    .json({ message: err?.message || 'Server error' });
});

// --- EXPORTS ---

// app  = bare Express instance (for tests, supertest, etc.)
// server = HTTP server with Socket.IO attached (used by index.js for listen())
// io    = Socket.IO server instance
export { app, server, io };
