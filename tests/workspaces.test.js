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
  assert.ok(exists('apps/knock'), 'apps/knock/ 应存在');
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

test('knock 目录与部署文档应齐备', () => {
  assert.ok(exists('apps/knock/package.json'), 'apps/knock/package.json 应存在');
  assert.ok(exists('apps/knock/src/index.ts'), 'apps/knock/src/index.ts 应存在');

  assert.ok(exists('docs/knock/README.md'), 'docs/knock/README.md 应存在');
  assert.ok(exists('docs/knock/windows-oneclick.md'), 'docs/knock/windows-oneclick.md 应存在');
  assert.ok(exists('docs/knock/scripts/knock-pack-win.ps1'), 'knock-pack-win.ps1 应存在');
  assert.ok(exists('docs/knock/scripts/knock-deploy.ps1'), 'knock-deploy.ps1 应存在');
  assert.ok(exists('docs/knock/scripts/knock-install.ps1'), 'knock-install.ps1 应存在');
});

test('knock 测试目录仅保留 TS 源文件', () => {
  const knockTestDir = path.join(root, 'apps', 'knock', 'test');
  assert.ok(fs.existsSync(knockTestDir), 'apps/knock/test/ 应存在');

  const jsTests = fs
    .readdirSync(knockTestDir)
    .filter((name) => name.endsWith('.js'));

  assert.equal(jsTests.length, 0, 'apps/knock/test/ 不应提交 *.js 测试产物');
});
