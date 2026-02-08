const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('monorepo scaffold: expected workspace directories exist', () => {
  const root = process.cwd();
  assert.ok(fs.existsSync(path.join(root, 'apps')), 'apps/ should exist');
  assert.ok(fs.existsSync(path.join(root, 'apps', 'website')), 'apps/website/ should exist');
});
