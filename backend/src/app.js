// backend/src/app.js
import express from 'express';
import cors from 'cors';

// REST routes
import { postsRoutes } from './routes/posts.js';
import { userRoutes } from './routes/users.js';
import { eventRoutes } from './routes/event.js';

// ⬇️ GraphQL
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './graphql/index.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

// core middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================
// GraphQL MUST be mounted BEFORE 404
// =====================
const gqlServer = new ApolloServer({ typeDefs, resolvers });
await gqlServer.start();
app.use(
  '/graphql',
  expressMiddleware(gqlServer, {
    // add auth context here later if you need it
    context: async ({ req }) => ({
      authHeader: req.headers?.authorization || null,
    }),
  }),
);

// Basic routes (optional)
app.get('/', (_req, res) => res.send('Hello from Express Nodemon!'));
app.get('/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() }),
);

// REST API
postsRoutes(app);
userRoutes(app);
eventRoutes(app);

// 404 (keep this AFTER GraphQL + REST mounts)
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// error handler
/* eslint-disable-next-line no-unused-vars */
app.use((err, _req, res, next) => {
  console.error('[ERROR]', err?.message, err?.stack || '');
  if (res.headersSent) return next(err);
  res
    .status(err?.status || 500)
    .json({ message: err?.message || 'Server error' });
});

export { app };
