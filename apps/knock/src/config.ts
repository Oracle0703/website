import path from 'node:path';

export type KnockConfig = {
  port: number;
  siteName: string;
  logPath: string;
  dataDir: string;
  dbPath: string;
  statePath: string;
  retentionDays: number;
  ingestIntervalSec: number;
  windowDefault: '1h' | '24h' | '7d';
  disableIngest: boolean;
};

function envInt(key: string, def: number): number {
  const raw = process.env[key];
  if (!raw) return def;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : def;
}

function envBool(key: string, def: boolean): boolean {
  const raw = (process.env[key] || '').trim().toLowerCase();
  if (!raw) return def;
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function envWindow(key: string, def: '1h' | '24h' | '7d'): '1h' | '24h' | '7d' {
  const raw = (process.env[key] || '').trim();
  if (raw === '1h' || raw === '24h' || raw === '7d') return raw;
  return def;
}

export function loadConfig(): KnockConfig {
  const port = envInt('KNOCK_PORT', 3010);
  const siteName = (process.env.KNOCK_SITE_NAME || 'knock').trim() || 'knock';
  const logPath = (process.env.KNOCK_LOG_PATH || '').trim();

  const dataDir = (process.env.KNOCK_DATA_DIR || './data').trim() || './data';
  const absDataDir = path.resolve(process.cwd(), dataDir);

  const dbPath = path.resolve(absDataDir, 'knock.db');
  const statePath = path.resolve(absDataDir, 'state.json');

  const retentionDays = envInt('KNOCK_RETENTION_DAYS', 14);
  const ingestIntervalSec = envInt('KNOCK_INGEST_INTERVAL_SEC', 60);
  const windowDefault = envWindow('KNOCK_WINDOW_DEFAULT', '24h');

  const disableIngest = envBool('KNOCK_DISABLE_INGEST', false);

  return {
    port,
    siteName,
    logPath,
    dataDir: absDataDir,
    dbPath,
    statePath,
    retentionDays,
    ingestIntervalSec,
    windowDefault,
    disableIngest,
  };
}
