const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

test("static rendering spike distinguishes initial diagnosis from the localized root layout state", () => {
  const source = read("docs/website/STATIC_RENDERING_SPIKE.md");

  assert.match(source, /初始诊断/);
  assert.match(source, /当前状态/);
  assert.match(source, /app\/\(zh\)\/layout\.tsx/);
  assert.match(source, /app\/en\/layout\.tsx/);
  assert.match(source, /路由直接决定服务端 `<html lang>`/);
  assert.match(source, /公开入口为 `○`/);
  assert.match(source, /详情页保持 `●` SSG/);
});
