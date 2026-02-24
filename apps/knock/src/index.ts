import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import dotenv from 'dotenv';

import { loadConfig } from './config.js';
import { openDb } from './db.js';
import { startIngestLoop } from './ingest.js';
import { registerApi } from './api.js';
import { registerWeb } from './web.js';

dotenv.config();

const cfg = loadConfig();
fs.mkdirSync(cfg.dataDir, { recursive: true });

const db = openDb(cfg.dbPath);

const app = express();
app.disable('x-powered-by');

// API first, then static.
registerApi(app, cfg, db);

// In release zips we ship dist/public next to dist/server.js.
const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, 'public');
registerWeb(app, publicDir);

startIngestLoop(cfg, db);

app.listen(cfg.port, () => {
  console.log(`[knock] ${cfg.siteName} listening on http://127.0.0.1:${cfg.port}`);
  if (!cfg.logPath) console.log('[knock] NOTE: set KNOCK_LOG_PATH in .env to enable ingest');
});
