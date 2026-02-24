const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

test('root workspace config is present', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.private, true, 'root package.json should be private');
  assert.deepEqual(pkg.workspaces, ['apps/*', 'packages/*']);
});

test('monorepo scaffold directories match current layout', () => {
  assert.ok(exists('apps'), 'apps/ should exist');
  assert.ok(exists('packages'), 'packages/ should exist');
  assert.ok(exists('tests'), 'tests/ should exist');
  assert.ok(exists('README.md'), 'README.md should exist');

  assert.ok(exists('apps/website'), 'apps/website/ should exist');
  assert.ok(!exists('frontend'), 'legacy frontend/ should not exist');
});

test('workspace lockfile policy is enforced at root', () => {
  assert.ok(exists('package-lock.json'), 'root package-lock.json should exist');

  const nestedLockfiles = fs
    .readdirSync(path.join(root, 'apps'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, 'apps', entry.name, 'package-lock.json'))
    .filter((candidate) => fs.existsSync(candidate));

  assert.equal(nestedLockfiles.length, 0, 'apps/* should not contain package-lock.json');
});
