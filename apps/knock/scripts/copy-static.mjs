import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(process.cwd());
const srcDir = path.join(root, 'public');
const outDir = path.join(root, 'dist', 'public');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, ent.name);
    const b = path.join(to, ent.name);
    if (ent.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

if (!fs.existsSync(srcDir)) {
  console.error('missing public dir:', srcDir);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
copyDir(srcDir, outDir);

// Vendor: bundle Chart.js UMD into the static folder so the release zip does not
// need chart.js in node_modules at runtime.
const require = createRequire(import.meta.url);

// chart.js uses package "exports" which may block resolving package.json.
// Resolve the runtime entry instead, then derive the package root.
const chartEntry = require.resolve('chart.js');
const chartRoot = path.resolve(path.dirname(chartEntry), '..');
const chartUmd = path.join(chartRoot, 'dist', 'chart.umd.js');

const vendorDir = path.join(outDir, 'vendor');
fs.mkdirSync(vendorDir, { recursive: true });
fs.copyFileSync(chartUmd, path.join(vendorDir, 'chart.umd.js'));

console.log('copied static:', outDir);
