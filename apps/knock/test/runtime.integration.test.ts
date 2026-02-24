import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Tests compile to `.test-dist/test/*.js`; from there, `../..` is the app root.
const knockDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const serverEntry = path.join(knockDir, 'dist', 'server.js');
const vendorAsset = path.join(knockDir, 'dist', 'public', 'vendor', 'chart.umd.js');

function toErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}

function hasListenEpermSignal(text: string): boolean {
  return /(?:\blisten\b[^\n]*\bEPERM\b|\bEPERM\b[^\n]*\blisten\b)/i.test(text);
}

function pickFallbackPort(): number {
  return 20_000 + Math.floor(Math.random() * 40_000);
}

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('failed to allocate a test port'));
        return;
      }
      server.close((err) => {
        if (err) reject(err);
        else resolve(addr.port);
      });
    });
  });
}

function startServer(port: number, dataDir: string): { child: ChildProcess; logs: string[] } {
  const logs: string[] = [];
  const child = spawn(process.execPath, [serverEntry], {
    cwd: knockDir,
    env: {
      ...process.env,
      KNOCK_DISABLE_INGEST: '1',
      KNOCK_DATA_DIR: dataDir,
      KNOCK_PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (chunk) => logs.push(String(chunk)));
  child.stderr?.on('data', (chunk) => logs.push(String(chunk)));

  return { child, logs };
}

async function waitForReady(baseUrl: string, child: ChildProcess, logs: string[]): Promise<void> {
  const deadline = Date.now() + 12_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`knock exited early with code ${child.exitCode}:\n${logs.join('')}`);
    }

    try {
      const res = await fetch(`${baseUrl}/healthz`);
      if (res.status === 200) return;
    } catch {
      // Server has not started listening yet.
    }

    await delay(100);
  }

  throw new Error(`timed out waiting for knock to start:\n${logs.join('')}`);
}

function onceExit(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return Promise.resolve();
  return new Promise<void>((resolve) => child.once('exit', () => resolve()));
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return;

  // Attach exit listener before signaling to avoid missing a fast-exit event.
  const exited = onceExit(child);

  child.kill('SIGTERM');

  await Promise.race([exited, delay(3_000)]);

  if (child.exitCode === null) {
    const exited2 = onceExit(child);
    child.kill('SIGKILL');
    await Promise.race([exited2, delay(3_000)]);
  }
}

test('bundled runtime serves health, dashboard, and vendor assets', async (t) => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'knock-runtime-'));
  let port: number;

  try {
    port = await findFreePort();
  } catch (error) {
    // Some sandboxes disallow test processes from probing free ports.
    // Fall back to a high random port and let the spawned runtime determine viability.
    if (hasListenEpermSignal(toErrorText(error))) {
      port = pickFallbackPort();
    } else {
      throw error;
    }
  }

  const baseUrl = `http://127.0.0.1:${port}`;
  const { child, logs } = startServer(port, dataDir);
  let skipReason: string | null = null;

  try {
    await waitForReady(baseUrl, child, logs);

    const healthz = await fetch(`${baseUrl}/healthz`);
    assert.equal(healthz.status, 200);
    assert.match(await healthz.text(), /ok/i);

    const home = await fetch(`${baseUrl}/`);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Knock/);

    const vendorStat = await fs.stat(vendorAsset);
    const vendor = await fetch(`${baseUrl}/vendor/chart.umd.js`);
    assert.equal(vendor.status, 200);

    const contentLength = vendor.headers.get('content-length');
    assert.equal(contentLength, String(vendorStat.size));
  } catch (error) {
    const details = `${toErrorText(error)}\n${logs.join('')}`;

    if (child.exitCode !== null && hasListenEpermSignal(details)) {
      skipReason =
        'Skipping runtime integration test: environment blocks socket bind/listen (detected listen EPERM).';
    } else {
      throw error;
    }
  } finally {
    await stopServer(child);
    await fs.rm(dataDir, { recursive: true, force: true });
  }

  if (skipReason) {
    t.skip(skipReason);
  }
});
