const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), "utf8"));
}

function sourceFiles(relPath) {
  const absolutePath = path.join(root, relPath);
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const childPath = path.join(relPath, entry.name);
    if (entry.isDirectory()) return sourceFiles(childPath);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [childPath] : [];
  });
}

test("website does not install the unused framer-motion runtime", () => {
  const websitePackage = readJson("apps/website/package.json");
  const lockfile = readJson("package-lock.json");
  const files = ["apps/website/app", "apps/website/components", "apps/website/lib"]
    .flatMap(sourceFiles);

  assert.equal(websitePackage.dependencies?.["framer-motion"], undefined);
  assert.equal(lockfile.packages?.["node_modules/framer-motion"], undefined);
  for (const relPath of files) {
    const source = fs.readFileSync(path.join(root, relPath), "utf8");
    assert.doesNotMatch(source, /from\s+["']framer-motion["']/, relPath);
  }
});
