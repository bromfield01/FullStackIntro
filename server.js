// server.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { generateSitemap } from './generateSitemap.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========================
// PRODUCTION SERVER
// ========================
async function createProdServer() {
  const app = express();

  // Enable gzip compression and static serving from dist/client
  app.use((await import('compression')).default());
  app.use(
    (await import('serve-static')).default(
      path.resolve(__dirname, 'dist/client'),
      {
        index: false,
      },
    ),
  );

  // --- sitemap.xml (prod) ---
  app.get('/sitemap.xml', async (_req, res, next) => {
    try {
      const xml = await generateSitemap();
      res
        .status(200)
        .set({
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300', // 5 minutes
        })
        .send(xml);
    } catch (e) {
      next(e);
    }
  });

  // SSR for everything else
  app.use('*', async (req, res, next) => {
    try {
      const template = fs.readFileSync(
        path.resolve(__dirname, 'dist/client/index.html'),
        'utf-8',
      );
      const { render } = await import('./dist/server/entry-server.js');
      const appHtml = await render(req);
      const html = template.replace('<!--ssr-outlet-->', appHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      next(e);
    }
  });

  return app;
}

// ========================
// DEVELOPMENT SERVER (VITE)
// ========================
async function createDevServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // --- sitemap.xml (dev) ---
  app.get('/sitemap.xml', async (_req, res, next) => {
    try {
      const xml = await generateSitemap();
      res
        .status(200)
        .set({ 'Content-Type': 'application/xml; charset=utf-8' })
        .send(xml);
    } catch (e) {
      next(e);
    }
  });

  const vite = await (
    await import('vite')
  ).createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    try {
      const templateHtml = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8',
      );
      const template = await vite.transformIndexHtml(
        req.originalUrl,
        templateHtml,
      );
      const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
      const appHtml = await render(req);
      const html = template.replace('<!--ssr-outlet-->', appHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return app;
}

// ========================
// MAIN ENTRYPOINT
// ========================
const isProd = process.env.NODE_ENV === 'production';
const app = isProd ? await createProdServer() : await createDevServer();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(
    `✅ ${
      isProd ? 'Production' : 'Development'
    } SSR server running at http://${HOST}:${PORT}`,
  );
});
