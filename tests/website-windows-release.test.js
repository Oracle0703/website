const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("website config emits a traceable monorepo standalone build", () => {
  const source = read("apps/website/next.config.js");

  assert.match(source, /output:\s*["']standalone["']/);
  assert.match(source, /outputFileTracingRoot:\s*path\.join\(__dirname,\s*["']\.\.\/\.\.["']\)/);
  assert.doesNotMatch(source, /experimental:\s*\{[\s\S]*outputFileTracingRoot/);
  assert.match(source, /NEXT_PUBLIC_RELEASE_SHA/);
  assert.match(source, /key:\s*["']X-Release-Sha["']/);
});

test("GitHub builds and verifies the release on Windows x64", () => {
  const source = read(".github/workflows/website-windows-release.yml");

  assert.match(source, /workflow_dispatch:/);
  assert.match(source, /push:[\s\S]*branches:[\s\S]*- main/);
  assert.match(source, /runs-on:\s*windows-latest/);
  assert.match(source, /node-version:\s*22\.22\.0/);
  assert.match(source, /NEXT_PUBLIC_SITE_URL:\s*https:\/\/www\.meaningful\.ink/);
  assert.match(source, /NEXT_PUBLIC_RELEASE_SHA:\s*\$\{\{ github\.sha \}\}/);
  assert.match(source, /package-website-standalone\.ps1/);
  assert.match(source, /verify-website-standalone\.ps1/);
  assert.match(source, /actions\/upload-artifact@v4/);
  assert.match(read("scripts/verify-website-standalone.ps1"), /search-index\.json/);
  assert.match(read("scripts/verify-website-standalone.ps1"), /X-Robots-Tag/);
  assert.match(read("scripts/verify-website-standalone.ps1"), /CONTACT_SUBMISSIONS_DIR/);
  assert.match(read("scripts/verify-website-standalone.ps1"), /\/icon-192\.png/);
  assert.doesNotMatch(read("scripts/verify-website-standalone.ps1"), /\/_next\/image\?/);
});

test("packager assembles static, public, content and the traced runtime", () => {
  const source = read("scripts/package-website-standalone.ps1");

  assert.match(source, /process\.platform \+ '-' \+ process\.arch/);
  assert.match(source, /win32-x64/);
  assert.match(source, /\.next\\standalone/);
  assert.match(source, /\.next\\static/);
  assert.match(source, /content\\blog/);
  assert.doesNotMatch(source, /sharp-win32-x64\.node/);
  assert.match(source, /release-manifest\.json/);
  assert.match(source, /Get-FileHash[\s\S]*SHA256/);
  assert.match(source, /Refusing to package environment files/);
});

test("server deploy script verifies before switching copy-mode current", () => {
  const source = read("scripts/deploy-website-prebuilt.ps1");
  const executableSource = source.replace(/<#[\s\S]*?#>/g, "");

  assert.match(source, /Get-FileHash[\s\S]*SHA256/);
  assert.match(source, /Assert-SafeArchive/);
  assert.match(source, /Unsafe archive entry/);
  assert.match(source, /Port \$Port is still listening/);
  assert.match(source, /Move-Item -LiteralPath \$current -Destination \$backup/);
  assert.match(source, /Move-Item -LiteralPath \$stage -Destination \$current/);
  assert.doesNotMatch(executableSource, /\bnpm (?:ci|install|run)\b/);
  assert.doesNotMatch(executableSource, /\bnext build\b/);
});

test("release start command is loopback-only by default", () => {
  const source = read("scripts/start-website.cmd");

  assert.match(source, /HOSTNAME=127\.0\.0\.1/);
  assert.match(source, /PORT=3001/);
  assert.match(source, /node apps\\website\\server\.js/);
  assert.doesNotMatch(source, /npm/);
});

test("Baota runbook documents artifact integrity, health and rollback", () => {
  const source = read("docs/website/DEPLOY_WINDOWS_BAOTA.md");

  assert.match(source, /服务器不再执行 `npm ci`、`npm install` 或 `next build`/);
  assert.match(source, /直接提供预优化后的本地图片/);
  assert.match(source, /\.sha256/);
  assert.match(source, /X-Release-Sha/);
  assert.match(source, /CONTACT_SUBMISSIONS_DIR/);
  assert.match(source, /## 回滚/);
});

test("Windows release publishes the artifact to Aliyun OSS and documents the internal pull", () => {
  const workflow = read(".github/workflows/website-windows-release.yml");
  const upload = read("scripts/upload-website-release-to-oss.ps1");
  const pull = read("scripts/pull-website-release-from-oss.ps1");
  const docs = read("docs/website/DEPLOY_WINDOWS_BAOTA.md");
  const artifactAt = workflow.indexOf("actions/upload-artifact@v4");
  const ossAt = workflow.indexOf("secrets.ALIYUN_OSS_ACCESS_KEY_ID");

  assert.ok(artifactAt > 0 && ossAt > artifactAt);
  assert.equal(workflow.match(/if: github\.event_name != 'pull_request'/g).length, 2);
  assert.match(workflow, /secrets\.ALIYUN_OSS_ACCESS_KEY_ID/);
  assert.match(workflow, /secrets\.ALIYUN_OSS_ACCESS_KEY_SECRET/);
  assert.match(workflow, /pull-website-release-from-oss\.ps1 -SelfTest/);
  assert.match(workflow, /upload-website-release-to-oss\.ps1 -SelfTest/);
  assert.doesNotMatch(workflow, /access-key-secret:/i);
  assert.doesNotMatch(workflow, /-k\s+\$\{\{/);

  assert.match(upload, /meaningful-website-releases/);
  assert.match(upload, /oss-cn-chengdu\.aliyuncs\.com/);
  assert.match(upload, /06ebec1680ce68b1807393e65a1e3f5f99c3b69c9b47c40578a80187da4462c3/);
  assert.match(upload, /releases\/latest\.json/);
  assert.match(upload, /refs\/heads\/main/);
  assert.doesNotMatch(upload, /--access-key-secret/);
  assert.doesNotMatch(upload, /-k\b/);

  assert.match(pull, /oss-cn-chengdu-internal\.aliyuncs\.com/);
  assert.match(pull, /ALIYUN_OSS_ACCESS_KEY_ID/);
  assert.match(pull, /ALIYUN_OSS_ACCESS_KEY_SECRET/);
  assert.match(pull, /deploy-website-prebuilt\.ps1/);
  assert.match(pull, /C:\\services\\meaningful-website/);
  assert.match(pull, /releases\/latest\.json/);

  for (const source of [workflow, upload, pull, docs]) {
    assert.doesNotMatch(source, /LTAI[0-9A-Za-z]{8,}/);
  }
  assert.match(docs, /pull-website-release-from-oss\.ps1/);
  assert.match(docs, /ALIYUN_OSS_ACCESS_KEY_ID/);
  assert.match(docs, /ALIYUN_OSS_ACCESS_KEY_SECRET/);
  assert.match(docs, /oss-cn-chengdu-internal\.aliyuncs\.com/);
  assert.match(docs, /meaningful-website-releases/);
  assert.match(docs, /releases\/latest\.json/);
  assert.match(docs, /GitHub Artifact/);
  assert.match(read(".gitignore"), /^oss\.env$/m);
});
