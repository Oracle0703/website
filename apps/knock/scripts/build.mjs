import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = path.resolve(process.cwd());
const distDir = path.join(root, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src', 'index.ts')],
  outfile: path.join(distDir, 'server.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  banner: {
    js: "import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);"
  },
  target: ['node22'],
  external: ['better-sqlite3'],
  logLevel: 'info'
});
