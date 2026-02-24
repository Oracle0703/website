import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

import type { KnockConfig } from './config.js';
import type { KnockDb } from './db.js';
import { parseAccessLogLine } from './parse.js';

export type IngestState = {
  version: 1;
  filePath: string;
  offset: number;
  lastSize: number;
  lastMtimeMs: number;
  updatedAtMs: number;
};

function loadState(statePath: string): IngestState | null {
  try {
    const raw = fs.readFileSync(statePath, 'utf-8');
    const j = JSON.parse(raw);
    if (!j || j.version !== 1) return null;
    if (typeof j.offset !== 'number') return null;
    return j as IngestState;
  } catch {
    return null;
  }
}

function saveState(statePath: string, st: IngestState): void {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(st, null, 2) + '\n', 'utf-8');
}

export function startIngestLoop(cfg: KnockConfig, db: KnockDb): void {
  if (cfg.disableIngest) {
    console.log('[knock] ingest disabled');
    return;
  }

  const tick = async () => {
    try {
      await ingestOnce(cfg, db);
    } catch (e) {
      console.warn('[knock] ingest error:', e);
    }
  };

  void tick();
  setInterval(tick, Math.max(5, cfg.ingestIntervalSec) * 1000);
}

async function ingestOnce(cfg: KnockConfig, db: KnockDb): Promise<void> {
  if (!cfg.logPath) {
    console.log('[knock] KNOCK_LOG_PATH not set; skip ingest');
    return;
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(cfg.logPath);
  } catch {
    console.log('[knock] log file not found; skip ingest:', cfg.logPath);
    return;
  }

  let st = loadState(cfg.statePath);
  if (!st || st.filePath !== cfg.logPath) {
    st = {
      version: 1,
      filePath: cfg.logPath,
      offset: 0,
      lastSize: 0,
      lastMtimeMs: 0,
      updatedAtMs: Date.now(),
    };
  }

  // Detect rotate/truncate on Windows best-effort.
  if (stat.size < st.offset || stat.mtimeMs < st.lastMtimeMs) {
    st.offset = 0;
  }

  if (stat.size === st.offset) {
    st.lastSize = stat.size;
    st.lastMtimeMs = stat.mtimeMs;
    st.updatedAtMs = Date.now();
    saveState(cfg.statePath, st);
    return;
  }

  const insert = db.prepare(
    `INSERT INTO requests (tsMs, ip, method, path, status, bytes, ua, referer, suspicious, suspiciousReason)
     VALUES (@tsMs, @ip, @method, @path, @status, @bytes, @ua, @referer, @suspicious, @suspiciousReason)`
  );

  const stream = fs.createReadStream(cfg.logPath, {
    encoding: 'utf-8',
    start: st.offset,
    end: stat.size - 1,
  });

  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let parsed = 0;
  let inserted = 0;
  db.exec('BEGIN');
  try {
    for await (const line of rl) {
      const rec = parseAccessLogLine(String(line));
      if (!rec) continue;
      parsed += 1;
      insert.run(rec);
      inserted += 1;
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  } finally {
    rl.close();
  }

  st.offset = stat.size;
  st.lastSize = stat.size;
  st.lastMtimeMs = stat.mtimeMs;
  st.updatedAtMs = Date.now();
  saveState(cfg.statePath, st);

  if (inserted > 0) {
    console.log(`[knock] ingested ${inserted} lines (parsed=${parsed})`);
  }

  cleanupOld(cfg, db);
}

function cleanupOld(cfg: KnockConfig, db: KnockDb): void {
  const days = Math.max(1, cfg.retentionDays);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const del = db.prepare('DELETE FROM requests WHERE tsMs < ?');
  const info = del.run(cutoff);
  if (info.changes > 0) {
    console.log(`[knock] retention cleanup: deleted ${info.changes} rows`);
  }
}
