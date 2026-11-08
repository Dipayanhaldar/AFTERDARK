import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiHandler from './api/[...route].js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function decorateResponse(res) {
  if (!res.status) {
    res.status = function status(code) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function json(payload) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(payload));
      return res;
    };
  }
  if (!res.send) {
    res.send = function send(payload) {
      if (typeof payload === 'object' && payload !== null && !Buffer.isBuffer(payload)) {
        return res.json(payload);
      }
      res.end(payload);
      return res;
    };
  }
  return res;
}

function serveStaticFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return false;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(__dirname, 'public');
  const distIndex = path.join(distPath, 'index.html');
  const distGuest = path.join(distPath, 'guest.html');
  const useStaticDist = process.env.NODE_ENV === 'production' && fs.existsSync(distIndex);

  let vite = null;
  if (!useStaticDist) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: {
          ignored: [
            '**/.data/**',
            '**/android/**',
            '**/guest-site/**',
            '**/dist/**',
            '**/store-output/**'
          ]
        }
      },
      appType: 'spa'
    });
  }

  const server = http.createServer(async (req, res) => {
    decorateResponse(res);
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/healthz') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, service: 'afterdark' }));
      return;
    }

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      try {
        await apiHandler(req, res);
      } catch (error) {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: error?.message || 'Internal server error' }));
        }
      }
      return;
    }

    const isGuestRoute =
      pathname === '/guest' ||
      pathname === '/guest/' ||
      pathname === '/guest/index.html' ||
      pathname === '/guest.html' ||
      pathname.startsWith('/invite/');

    if (vite) {
      if (isGuestRoute) {
        req.url = `/guest.html${parsedUrl.search || ''}`;
      }
      vite.middlewares(req, res, () => {
        if (!res.headersSent) {
          res.statusCode = 404;
          res.end('Not Found');
        }
      });
      return;
    }

    // Production static serving from dist/ or public/
    const safeRelPath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
    const candidateDistFile = path.join(distPath, safeRelPath);
    if (pathname !== '/' && !isGuestRoute && serveStaticFile(res, candidateDistFile)) {
      return;
    }
    const candidatePublicFile = path.join(publicPath, safeRelPath);
    if (pathname !== '/' && !isGuestRoute && serveStaticFile(res, candidatePublicFile)) {
      return;
    }

    if (isGuestRoute && fs.existsSync(distGuest)) {
      serveStaticFile(res, distGuest);
      return;
    }
    if (serveStaticFile(res, distIndex)) {
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });

  server.on('error', (err) => {
    console.error('[server] HTTP server error:', err?.message || err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AFTERDARK server running on http://0.0.0.0:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception (kept alive):', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection (kept alive):', reason);
});

startServer();
