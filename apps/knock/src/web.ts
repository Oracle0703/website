import path from 'node:path';
import type { Express } from 'express';
import express from 'express';

export function registerWeb(app: Express, publicDir: string): void {
  // Static contains the dashboard (and vendor assets like chart.umd.js).
  app.use('/', express.static(publicDir));

  app.get('/healthz', (_req, res) => {
    res.type('text/plain').send('ok');
  });

  // SPA fallback (if we add routes later).
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}
