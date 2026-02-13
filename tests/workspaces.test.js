const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

test('workspace 目录符合 monorepo 约定', () => {
  assert.ok(exists('apps'), 'apps/ 应存在');
  assert.ok(exists('packages'), 'packages/ 应存在');
  assert.ok(exists('docs'), 'docs/ 应存在');

  assert.ok(exists('apps/website'), 'apps/website/ 应存在');
  assert.ok(exists('apps/dashboard-web'), 'apps/dashboard-web/ 应存在');
  assert.ok(exists('apps/dashboard-api'), 'apps/dashboard-api/ 应存在');
});

test('历史遗留目录已收敛', () => {
  assert.ok(!exists('frontend'), 'frontend/ 不应继续存在于仓库根目录');
  assert.ok(!exists('backend'), 'backend/ 已迁移到 docs/legacy/');
  assert.ok(!exists('admin'), 'admin/ 已迁移到 docs/legacy/');
});

test('文档与锁文件策略符合约定', () => {
  assert.ok(exists('docs/legacy/backend-go/PLAN.md'), '后端历史规划文档应被归档');
  assert.ok(exists('docs/legacy/admin/spec.md'), '后台历史规格文档应被归档');
  assert.ok(!exists('apps/website/package-lock.json'), '子应用不应保留独立 lockfile');
});

test('dashboard-api 测试目录仅保留 TS 源文件', () => {
  const apiTestDir = path.join(root, 'apps', 'dashboard-api', 'test');
  assert.ok(fs.existsSync(apiTestDir), 'apps/dashboard-api/test/ 应存在');

  const jsTests = fs
    .readdirSync(apiTestDir)
    .filter((name) => name.endsWith('.js'));

  assert.equal(jsTests.length, 0, 'apps/dashboard-api/test/ 不应提交 *.js 测试产物');
});
