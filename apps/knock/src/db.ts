import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type KnockDb = Database.Database;

export function openDb(dbPath: string): KnockDb {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tsMs INTEGER NOT NULL,
      ip TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status INTEGER NOT NULL,
      bytes INTEGER NOT NULL,
      ua TEXT NOT NULL,
      referer TEXT NOT NULL,
      suspicious INTEGER NOT NULL,
      suspiciousReason TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_ts ON requests(tsMs);
    CREATE INDEX IF NOT EXISTS idx_requests_ip ON requests(ip);
    CREATE INDEX IF NOT EXISTS idx_requests_path ON requests(path);
    CREATE INDEX IF NOT EXISTS idx_requests_susp ON requests(suspicious);
  `);

  return db;
}
