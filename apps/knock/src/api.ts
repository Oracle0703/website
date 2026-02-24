import type { Express, Request } from 'express';

import type { KnockConfig } from './config.js';
import type { KnockDb } from './db.js';

function windowToSinceMs(win: '1h' | '24h' | '7d'): number {
  const now = Date.now();
  if (win === '1h') return now - 60 * 60 * 1000;
  if (win === '7d') return now - 7 * 24 * 60 * 60 * 1000;
  return now - 24 * 60 * 60 * 1000;
}

function parseWindow(req: Request, def: '1h' | '24h' | '7d'): '1h' | '24h' | '7d' {
  const w = String(req.query.window || '').trim();
  if (w === '1h' || w === '24h' || w === '7d') return w;
  return def;
}

function intParam(req: Request, key: string, def: number, min: number, max: number): number {
  const raw = String(req.query[key] || '').trim();
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

export function registerApi(app: Express, cfg: KnockConfig, db: KnockDb): void {
  app.get('/api/config', (_req, res) => {
    res.json({
      siteName: cfg.siteName,
      windowDefault: cfg.windowDefault,
      ingestEnabled: !cfg.disableIngest,
      logPathConfigured: Boolean(cfg.logPath),
    });
  });

  app.get('/api/overview', (req, res) => {
    const win = parseWindow(req, cfg.windowDefault);
    const since = windowToSinceMs(win);

    const total = db.prepare('SELECT COUNT(*) AS n FROM requests WHERE tsMs >= ?').get(since) as { n: number };
    const uniqIp = db
      .prepare('SELECT COUNT(DISTINCT ip) AS n FROM requests WHERE tsMs >= ?')
      .get(since) as { n: number };
    const s4xx = db
      .prepare('SELECT COUNT(*) AS n FROM requests WHERE tsMs >= ? AND status BETWEEN 400 AND 499')
      .get(since) as { n: number };
    const susp = db
      .prepare('SELECT COUNT(*) AS n FROM requests WHERE tsMs >= ? AND suspicious = 1')
      .get(since) as { n: number };

    const totalN = total.n || 0;
    const fourxxN = s4xx.n || 0;

    res.json({
      window: win,
      sinceMs: since,
      total: totalN,
      uniqueIp: uniqIp.n || 0,
      fourxx: fourxxN,
      fourxxRatio: totalN > 0 ? fourxxN / totalN : 0,
      suspicious: susp.n || 0,
    });
  });

  app.get('/api/timeseries', (req, res) => {
    const win = parseWindow(req, cfg.windowDefault);
    const since = windowToSinceMs(win);
    const bucketSec = intParam(req, 'bucketSec', 60, 10, 3600);
    const bucketMs = bucketSec * 1000;

    // Group by bucket start time.
    const rows = db
      .prepare(
        `SELECT
          ((tsMs / @bucketMs) * @bucketMs) AS t,
          COUNT(*) AS total,
          SUM(CASE WHEN status BETWEEN 200 AND 299 THEN 1 ELSE 0 END) AS s2xx,
          SUM(CASE WHEN status BETWEEN 300 AND 399 THEN 1 ELSE 0 END) AS s3xx,
          SUM(CASE WHEN status BETWEEN 400 AND 499 THEN 1 ELSE 0 END) AS s4xx,
          SUM(CASE WHEN status BETWEEN 500 AND 599 THEN 1 ELSE 0 END) AS s5xx
        FROM requests
        WHERE tsMs >= @since
        GROUP BY t
        ORDER BY t ASC`
      )
      .all({ since, bucketMs }) as Array<{ t: number; total: number; s2xx: number; s3xx: number; s4xx: number; s5xx: number }>;

    res.json({ window: win, sinceMs: since, bucketSec, rows });
  });

  app.get('/api/top/ip', (req, res) => {
    const win = parseWindow(req, cfg.windowDefault);
    const since = windowToSinceMs(win);
    const limit = intParam(req, 'limit', 20, 1, 100);

    const rows = db
      .prepare(
        `SELECT ip, COUNT(*) AS n,
          SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) AS serr,
          SUM(CASE WHEN suspicious = 1 THEN 1 ELSE 0 END) AS susp
        FROM requests
        WHERE tsMs >= ?
        GROUP BY ip
        ORDER BY n DESC
        LIMIT ?`
      )
      .all(since, limit) as Array<{ ip: string; n: number; serr: number; susp: number }>;

    res.json({ window: win, sinceMs: since, rows });
  });

  app.get('/api/top/path', (req, res) => {
    const win = parseWindow(req, cfg.windowDefault);
    const since = windowToSinceMs(win);
    const limit = intParam(req, 'limit', 20, 1, 100);

    const rows = db
      .prepare(
        `SELECT path, COUNT(*) AS n,
          SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) AS serr,
          SUM(CASE WHEN suspicious = 1 THEN 1 ELSE 0 END) AS susp
        FROM requests
        WHERE tsMs >= ?
        GROUP BY path
        ORDER BY n DESC
        LIMIT ?`
      )
      .all(since, limit) as Array<{ path: string; n: number; serr: number; susp: number }>;

    res.json({ window: win, sinceMs: since, rows });
  });

  app.get('/api/suspicious', (req, res) => {
    const win = parseWindow(req, cfg.windowDefault);
    const since = windowToSinceMs(win);
    const limit = intParam(req, 'limit', 50, 1, 200);

    const rows = db
      .prepare(
        `SELECT tsMs, ip, method, path, status, suspiciousReason, ua
        FROM requests
        WHERE tsMs >= ? AND suspicious = 1
        ORDER BY tsMs DESC
        LIMIT ?`
      )
      .all(since, limit) as Array<{
      tsMs: number;
      ip: string;
      method: string;
      path: string;
      status: number;
      suspiciousReason: string;
      ua: string;
    }>;

    res.json({ window: win, sinceMs: since, rows });
  });
}
