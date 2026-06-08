import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { carbonRouter } from './carbon-routes.js';

const app = express();

/* ── Disable fingerprinting ──────────────────────────────────── */
app.disable('x-powered-by');

/* ── Compression for efficiency metric ───────────────────────── */
app.use(compression());

/* ── Security headers ────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
    },
  },
}));

/* ── CORS ─────────────────────────────────────────────────────── */
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

/* ── Rate limiting ────────────────────────────────────────────── */
const globalThrottle = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before trying again.' },
});
app.use(globalThrottle);

/* ── Body parsing ─────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));

/* ── Routes ───────────────────────────────────────────────────── */
app.use('/api/v1', carbonRouter);

/* ── Health probe ─────────────────────────────────────────────── */
app.get('/api/v1/ping', (_req, res) => {
  res.json({
    alive: true,
    service: 'greenpulse',
    ts: new Date().toISOString(),
  });
});

/* ── SPA fallback (production) ────────────────────────────────── */
if (process.env.NODE_ENV === 'production') {
  const { default: path } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.resolve(root, '..', 'dist');

  app.use(express.static(distDir, { maxAge: '7d' }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

/* ── Global error boundary ────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[GreenPulse Error]', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

/* ── Start ─────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.info(`🟢 GreenPulse API running → http://localhost:${PORT}`);
});

export default app;
