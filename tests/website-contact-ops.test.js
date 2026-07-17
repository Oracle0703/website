const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}`);
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "website-contact-ops-"));
}

test("D8 contact storage guard rejects public, build, and source directories", async () => {
  const {
    CONTACT_RETENTION_DAYS,
    validateContactSubmissionsDirectory
  } = await importFresh("apps/website/lib/contact-form.ts");

  assert.equal(CONTACT_RETENTION_DAYS, 90);

  for (const relPath of [
    "apps/website/public/contact",
    "apps/website/.next/contact",
    "apps/website/app/contact",
    "apps/website/components/contact",
    "apps/website/lib/contact"
  ]) {
    const result = validateContactSubmissionsDirectory(path.join(root, relPath), root);
    assert.equal(result.ok, false, `${relPath} should be rejected`);
    assert.equal(result.error.code, "unsafe_storage_directory");
  }

  const safe = validateContactSubmissionsDirectory(path.join(root, ".data", "website-contact"), root);
  assert.equal(safe.ok, true);
});

test("D8 cleanup dry-run reports expired records without modifying JSONL", async () => {
  const {
    cleanupContactSubmissionsFile
  } = await importFresh("apps/website/lib/contact-form.ts");

  const tempDir = makeTempDir();
  const filePath = path.join(tempDir, "submissions.jsonl");
  const oldSubmission = {
    submissionId: "contact_old",
    receivedAt: "2026-01-01T00:00:00.000Z",
    name: "Old",
    contact: "old@lovelace.dev",
    projectGoal: "Old request with enough detail to be valid.",
    timeline: "",
    budgetRange: "",
    links: [],
    ipHash: "old",
    userAgent: ""
  };
  const freshSubmission = {
    ...oldSubmission,
    submissionId: "contact_fresh",
    receivedAt: "2026-05-01T00:00:00.000Z"
  };
  const original = [
    JSON.stringify(oldSubmission),
    "{malformed-json",
    JSON.stringify(freshSubmission)
  ].join("\n") + "\n";

  fs.writeFileSync(filePath, original, "utf8");

  const result = await cleanupContactSubmissionsFile({
    filePath,
    now: new Date("2026-05-21T00:00:00.000Z"),
    retentionDays: 90,
    dryRun: true
  });

  assert.equal(result.expiredCount, 1);
  assert.equal(result.keptCount, 1);
  assert.equal(result.malformedCount, 1);
  assert.equal(result.dryRun, true);
  assert.equal(fs.readFileSync(filePath, "utf8"), original);
});

test("D8 cleanup deletes expired records and preserves malformed lines", async () => {
  const {
    cleanupContactSubmissionsFile
  } = await importFresh("apps/website/lib/contact-form.ts");

  const tempDir = makeTempDir();
  const filePath = path.join(tempDir, "submissions.jsonl");
  fs.writeFileSync(
    filePath,
    [
      JSON.stringify({ submissionId: "contact_old", receivedAt: "2026-01-01T00:00:00.000Z" }),
      "not-json",
      JSON.stringify({ submissionId: "contact_fresh", receivedAt: "2026-05-01T00:00:00.000Z" })
    ].join("\n") + "\n",
    "utf8"
  );

  const result = await cleanupContactSubmissionsFile({
    filePath,
    now: new Date("2026-05-21T00:00:00.000Z"),
    retentionDays: 90,
    dryRun: false
  });

  const updated = fs.readFileSync(filePath, "utf8");
  assert.equal(result.expiredCount, 1);
  assert.equal(result.keptCount, 1);
  assert.equal(result.malformedCount, 1);
  assert.match(updated, /not-json/);
  assert.match(updated, /contact_fresh/);
  assert.doesNotMatch(updated, /contact_old/);
});

test("V11 contact operations reject external links that resolve into a release", (t) => {
  if (process.platform === "win32") {
    t.skip("creating directory symlinks requires elevated Windows privileges");
    return;
  }

  const temporaryRoot = makeTempDir();
  const releaseRoot = path.join(temporaryRoot, "release");
  const workingDirectory = path.join(releaseRoot, "apps", "website");
  const protectedDirectory = path.join(releaseRoot, "data", "contact");
  const externalParent = path.join(temporaryRoot, "external-parent");
  const externalDirectory = path.join(externalParent, "contact");
  fs.mkdirSync(workingDirectory, { recursive: true });
  fs.mkdirSync(protectedDirectory, { recursive: true });
  fs.symlinkSync(path.dirname(protectedDirectory), externalParent, "dir");

  try {
    for (const args of [["--check-storage"], ["--cleanup", "--dry-run"]]) {
      const result = spawnSync(
        process.execPath,
        [path.join(root, "scripts/manage-website-contact-submissions.mjs"), ...args],
        {
          cwd: workingDirectory,
          encoding: "utf8",
          env: {
            ...process.env,
            NODE_ENV: "production",
            CONTACT_SUBMISSIONS_DIR: externalDirectory
          }
        }
      );

      assert.notEqual(result.status, 0, `${args.join(" ")} must reject the linked directory`);
      assert.match(result.stdout, /unsafe_storage_directory/);
    }
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("D8 contact operations script and docs are wired into release workflow", () => {
  assert.ok(exists("scripts/manage-website-contact-submissions.mjs"));
  assert.ok(exists("docs/website/D8_ACCEPTANCE_REPORT.md"));

  const packageJson = read("package.json");
  const checklist = read("docs/website/RELEASE_CHECKLIST.md");
  const report = read("docs/website/D8_ACCEPTANCE_REPORT.md");

  assert.match(packageJson, /"contact:ops":\s*"node scripts\/manage-website-contact-submissions\.mjs"/);
  assert.match(checklist, /D8 Contact Operations/);
  assert.match(checklist, /npm run contact:ops -- --check-storage/);
  assert.match(report, /# Website D8 Contact Operations Acceptance Report/);
  assert.match(report, /retention cleanup/i);
  assert.match(report, /unsafe_storage_directory/);
});
