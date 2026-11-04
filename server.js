import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiHandler from './api/[...route].js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, service: 'afterdark' });
  });

  // Route all /api/* requests to the unified serverless handler (Express 5 compatible)
  app.use('/api', async (req, res) => {
    try {
      req.url = req.originalUrl || req.url;
      await apiHandler(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Rewrite /guest, /guest/, /guest.html, and /invite/* to /index.html so Vite serves the app with HTTP 200
    app.use((req, _res, next) => {
      if (
        req.path === '/guest' ||
        req.path === '/guest/' ||
        req.path === '/guest/index.html' ||
        req.path === '/guest.html' ||
        req.path.startsWith('/invite/')
      ) {
        const searchIndex = req.url.indexOf('?');
        const query = searchIndex >= 0 ? req.url.slice(searchIndex) : '';
        req.url = `/index.html${query}`;
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.status(200).sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AFTERDARK server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
