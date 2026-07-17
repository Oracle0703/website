const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

test("D7 contact form module validates required fields, quality, links, and placeholders", async () => {
  assert.ok(exists("apps/website/lib/contact-form.ts"), "contact form module should exist");

  const {
    CONTACT_FIELD_MAX_LENGTHS,
    CONTACT_FORM_ERROR_CODES,
    validateContactFormSubmission
  } = await importFresh("apps/website/lib/contact-form.ts");

  for (const code of [
    "missing_required_field",
    "invalid_contact",
    "low_quality_input",
    "invalid_link",
    "rate_limited",
    "duplicate_submit",
    "submit_failure",
    "storage_failure",
    "notification_failure",
    "received_with_notification_failure"
  ]) {
    assert.ok(CONTACT_FORM_ERROR_CODES.includes(code), `${code} should be a known error code`);
  }

  assert.equal(validateContactFormSubmission({}).ok, false);
  assert.equal(validateContactFormSubmission({}).error.code, "missing_required_field");

  const base = {
    name: "Ada Lovelace",
    contact: "ada@lovelace.dev",
    project_goal: "I want to refine a public product page and clarify the conversion path.",
    timeline: "This month",
    budget_range: "Exploratory",
    links: ["https://lovelace.dev/product"],
    honeypot: ""
  };

  assert.equal(validateContactFormSubmission(base).ok, true);
  assert.equal(
    validateContactFormSubmission({ ...base, contact: "hello@example.com" }).error.code,
    "invalid_contact"
  );
  assert.equal(
    validateContactFormSubmission({ ...base, project_goal: "Need help" }).error.code,
    "low_quality_input"
  );
  assert.equal(
    validateContactFormSubmission({ ...base, links: ["ftp://example.org/file"] }).error.code,
    "invalid_link"
  );
  assert.equal(
    validateContactFormSubmission({
      ...base,
      links: [
        "https://example.org/one",
        "https://example.org/two",
        "https://example.org/three",
        "https://example.org/four"
      ]
    }).error.code,
    "invalid_link"
  );
  assert.equal(
    validateContactFormSubmission({ ...base, honeypot: "bot-filled" }).error.code,
    "low_quality_input"
  );
  assert.equal(
    validateContactFormSubmission({
      ...base,
      project_goal: "x".repeat(CONTACT_FIELD_MAX_LENGTHS.projectGoal + 1)
    }).error.code,
    "low_quality_input"
  );
  assert.equal(
    validateContactFormSubmission({
      ...base,
      timeline: "x".repeat(CONTACT_FIELD_MAX_LENGTHS.timeline + 1)
    }).error.code,
    "low_quality_input"
  );
  assert.equal(
    validateContactFormSubmission({
      ...base,
      links: [`https://example.org/${"x".repeat(CONTACT_FIELD_MAX_LENGTHS.link)}`]
    }).error.code,
    "invalid_link"
  );
});

test("V4 contact request JSON reader enforces the byte limit while streaming", async () => {
  const {
    CONTACT_REQUEST_MAX_BYTES,
    ContactPayloadTooLargeError,
    readContactRequestJson
  } = await importFresh("apps/website/lib/contact-form.ts");

  const parsed = await readContactRequestJson(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Ada" })
    })
  );
  assert.deepEqual(parsed, { name: "Ada" });

  await assert.rejects(
    readContactRequestJson(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(CONTACT_REQUEST_MAX_BYTES + 1)
        },
        body: "{}"
      })
    ),
    ContactPayloadTooLargeError
  );

  await assert.rejects(
    readContactRequestJson(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ project_goal: "x".repeat(CONTACT_REQUEST_MAX_BYTES) })
      })
    ),
    ContactPayloadTooLargeError
  );
});

test("D7 contact submission gate catches rate limits and duplicate submissions", async () => {
  const {
    CONTACT_GATE_MAX_ENTRIES,
    checkContactSubmissionGate,
    createContactSubmissionGate,
    rollbackContactSubmissionGate
  } = await importFresh("apps/website/lib/contact-form.ts");

  const gate = createContactSubmissionGate();
  const base = {
    contact: "ada@lovelace.dev",
    projectGoal: "I want to refine a public product page and clarify the conversion path.",
    identityKey: "client-one",
    now: 1_000_000
  };

  const firstReservation = checkContactSubmissionGate(gate, base);
  assert.equal(firstReservation.ok, true);
  assert.equal(typeof firstReservation.reservation.reservationId, "string");
  assert.equal(checkContactSubmissionGate(gate, { ...base, now: 1_000_001 }).ok, false);
  assert.equal(
    checkContactSubmissionGate(gate, { ...base, now: 1_000_001 }).error.code,
    "duplicate_submit"
  );

  const rateGate = createContactSubmissionGate();
  for (const offset of [0, 1, 2]) {
    assert.equal(
      checkContactSubmissionGate(rateGate, {
        ...base,
        contact: `person-${offset}@lovelace.dev`,
        projectGoal: `${base.projectGoal} ${offset}`,
        now: 2_000_000 + offset
      }).ok,
      true
    );
  }

  const limited = checkContactSubmissionGate(rateGate, {
    ...base,
    contact: "person-4@lovelace.dev",
    projectGoal: `${base.projectGoal} extra`,
    now: 2_000_003
  });
  assert.equal(limited.ok, false);
  assert.equal(limited.error.code, "rate_limited");

  const capacityGate = createContactSubmissionGate();
  for (let index = 0; index < CONTACT_GATE_MAX_ENTRIES; index += 1) {
    capacityGate.attemptsByIdentity.set(`client-${index}`, [
      { reservationId: `reservation-${index}`, timestamp: 3_000_000 }
    ]);
    capacityGate.duplicateByContactGoal.set(`duplicate-${index}`, {
      reservationId: `reservation-${index}`,
      timestamp: 3_000_000
    });
  }
  capacityGate.lastCleanupAt = 3_000_000;

  assert.equal(
    checkContactSubmissionGate(capacityGate, {
      ...base,
      identityKey: "new-client",
      contact: "new-client@lovelace.dev",
      projectGoal: `${base.projectGoal} capacity check`,
      now: 3_000_001
    }).ok,
    true
  );
  assert.equal(capacityGate.attemptsByIdentity.size, CONTACT_GATE_MAX_ENTRIES);
  assert.equal(capacityGate.duplicateByContactGoal.size, CONTACT_GATE_MAX_ENTRIES);
  assert.equal(capacityGate.attemptsByIdentity.has("client-0"), false);
  assert.equal(capacityGate.attemptsByIdentity.has("new-client"), true);

  const recoverableGate = createContactSubmissionGate();
  const recoverableReservation = checkContactSubmissionGate(recoverableGate, base);
  assert.equal(recoverableReservation.ok, true);
  rollbackContactSubmissionGate(recoverableGate, recoverableReservation.reservation);
  assert.equal(
    checkContactSubmissionGate(recoverableGate, { ...base, now: base.now + 1 }).ok,
    true,
    "a persistence failure should not make the retained form look like a duplicate"
  );

  const concurrentGate = createContactSubmissionGate();
  const older = checkContactSubmissionGate(concurrentGate, {
    ...base,
    projectGoal: `${base.projectGoal} older`,
    now: 4_000_000
  });
  const newer = checkContactSubmissionGate(concurrentGate, {
    ...base,
    projectGoal: `${base.projectGoal} newer`,
    now: 4_000_001
  });
  assert.equal(older.ok, true);
  assert.equal(newer.ok, true);

  rollbackContactSubmissionGate(concurrentGate, older.reservation);
  assert.deepEqual(
    concurrentGate.attemptsByIdentity.get(base.identityKey).map((attempt) => attempt.reservationId),
    [newer.reservation.reservationId],
    "rollback should remove only the failed persistence reservation"
  );
  assert.equal(concurrentGate.duplicateByContactGoal.has(older.reservation.duplicateKey), false);
  assert.equal(concurrentGate.duplicateByContactGoal.has(newer.reservation.duplicateKey), true);
});

test("V4 contact identity rate limit is IP-only", async () => {
  const { getContactIdentityKey } = await importFresh("apps/website/lib/contact-form.ts");

  assert.equal(getContactIdentityKey("203.0.113.10"), getContactIdentityKey("203.0.113.10"));
  assert.notEqual(getContactIdentityKey("203.0.113.10"), getContactIdentityKey("203.0.113.11"));
  assert.equal(getContactIdentityKey.length, 1);
});

test("V4 contact notification reports delivered, skipped, and failed outcomes", async () => {
  const { sendContactNotification } = await importFresh("apps/website/lib/contact-form.ts");
  const previousWebhook = process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
  const submission = {
    submissionId: "contact_timeout",
    receivedAt: "2026-07-15T10:00:00.000Z",
    name: "Ada Lovelace",
    contact: "ada@lovelace.dev",
    projectGoal: "Review the product page and improve its conversion path.",
    timeline: "This month",
    budgetRange: "Exploratory",
    links: [],
    ipHash: "test-hash",
    userAgent: "node-test"
  };

  try {
    delete process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
    assert.deepEqual(await sendContactNotification(submission), {
      ok: true,
      status: "skipped"
    });

    process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = "https://hooks.example.test/contact";
    let deliveredRequestInit;
    let responseBodyCancelled = false;
    assert.deepEqual(await sendContactNotification(submission, {
      fetcher: async (_url, init) => {
        deliveredRequestInit = init;
        return new Response(
          new ReadableStream({
            cancel() {
              responseBodyCancelled = true;
            }
          }),
          { status: 200 }
        );
      }
    }), {
      ok: true,
      status: "delivered"
    });
    assert.equal(deliveredRequestInit.redirect, "error");
    assert.equal(responseBodyCancelled, true);

    const result = await sendContactNotification(submission, {
      timeoutMs: 5,
      fetcher: async (_url, init) => new Promise((_resolve, reject) => {
        const rejectAsAborted = () => {
          const error = new Error("webhook aborted");
          error.name = "AbortError";
          reject(error);
        };

        if (init?.signal?.aborted) {
          rejectAsAborted();
          return;
        }
        init?.signal?.addEventListener("abort", rejectAsAborted, { once: true });
      })
    });

    assert.deepEqual(result, {
      ok: false,
      status: "failed",
      error: "notification_failure"
    });

    process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = "not-a-valid-url";
    assert.deepEqual(await sendContactNotification(submission), {
      ok: false,
      status: "failed",
      error: "notification_failure"
    });

    process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = "http://hooks.example.test/contact";
    assert.deepEqual(await sendContactNotification(submission), {
      ok: false,
      status: "failed",
      error: "notification_failure"
    });
  } finally {
    if (previousWebhook === undefined) {
      delete process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
    } else {
      process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = previousWebhook;
    }
  }
});

test("V11 production contact storage requires a durable absolute external path", async () => {
  const {
    getContactReleaseRoot,
    getContactServiceReadiness,
    getContactSubmissionsDir
  } = await importFresh("apps/website/lib/contact-form.ts");
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDirectory = process.env.CONTACT_SUBMISSIONS_DIR;
  const externalDirectory = fs.mkdtempSync(
    path.join(require("node:os").tmpdir(), "website-contact-production-")
  );

  try {
    process.env.NODE_ENV = "production";
    delete process.env.CONTACT_SUBMISSIONS_DIR;
    assert.throws(() => getContactSubmissionsDir(), /contact_storage_not_configured/);
    assert.equal((await getContactServiceReadiness()).ready, false);

    process.env.CONTACT_SUBMISSIONS_DIR = "relative/contact";
    assert.throws(() => getContactSubmissionsDir(), /contact_storage_must_be_absolute/);

    process.env.CONTACT_SUBMISSIONS_DIR = path.join(root, ".data", "website-contact");
    assert.throws(() => getContactSubmissionsDir(), /contact_storage_inside_release/);

    const simulatedReleaseRoot = fs.mkdtempSync(
      path.join(require("node:os").tmpdir(), "website-standalone-release-")
    );
    const standaloneWorkingDirectory = path.join(simulatedReleaseRoot, "apps", "website");
    fs.mkdirSync(standaloneWorkingDirectory, { recursive: true });
    assert.equal(getContactReleaseRoot(standaloneWorkingDirectory), simulatedReleaseRoot);

    const originalWorkingDirectory = process.cwd();
    const outsideAliasRoot = fs.mkdtempSync(
      path.join(require("node:os").tmpdir(), "website-contact-release-alias-")
    );
    try {
      process.chdir(standaloneWorkingDirectory);
      process.env.CONTACT_SUBMISSIONS_DIR = path.join(simulatedReleaseRoot, "data", "contact");
      assert.throws(() => getContactSubmissionsDir(), /contact_storage_inside_release/);

      if (process.platform !== "win32") {
        const releaseDataDirectory = path.join(simulatedReleaseRoot, "data", "linked-contact");
        const outsideAlias = path.join(outsideAliasRoot, "contact");
        fs.mkdirSync(releaseDataDirectory, { recursive: true });
        fs.symlinkSync(releaseDataDirectory, outsideAlias, "dir");
        process.env.CONTACT_SUBMISSIONS_DIR = outsideAlias;
        assert.equal(
          (await getContactServiceReadiness()).ready,
          false,
          "a path outside the release must still fail when it resolves back inside"
        );
      }
    } finally {
      process.chdir(originalWorkingDirectory);
      fs.rmSync(outsideAliasRoot, { recursive: true, force: true });
      fs.rmSync(simulatedReleaseRoot, { recursive: true, force: true });
    }

    process.env.CONTACT_SUBMISSIONS_DIR = externalDirectory;
    assert.equal(getContactSubmissionsDir(), path.resolve(externalDirectory));
    assert.equal((await getContactServiceReadiness()).ready, true);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousDirectory === undefined) delete process.env.CONTACT_SUBMISSIONS_DIR;
    else process.env.CONTACT_SUBMISSIONS_DIR = previousDirectory;
    fs.rmSync(externalDirectory, { recursive: true, force: true });
  }
});

test("V4 contact readiness checks persistence without exposing paths or webhook secrets", async () => {
  const { getContactServiceReadiness } = await importFresh("apps/website/lib/contact-form.ts");
  const previousDirectory = process.env.CONTACT_SUBMISSIONS_DIR;
  const previousWebhook = process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
  const directory = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "website-contact-ready-"));

  try {
    process.env.CONTACT_SUBMISSIONS_DIR = directory;
    delete process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
    assert.deepEqual(await getContactServiceReadiness(), {
      ready: true,
      persistence: "ready",
      notification: "not_configured"
    });

    process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = "https://secret.example.test/contact-token";
    const configured = await getContactServiceReadiness();
    assert.equal(configured.notification, "configured");
    assert.doesNotMatch(JSON.stringify(configured), /secret|contact-token|website-contact-ready/);

    process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = "not-a-url";
    const invalidNotification = await getContactServiceReadiness();
    assert.equal(invalidNotification.notification, "invalid");
    assert.equal(invalidNotification.persistence, "ready");
    assert.equal(invalidNotification.ready, false);
  } finally {
    if (previousDirectory === undefined) delete process.env.CONTACT_SUBMISSIONS_DIR;
    else process.env.CONTACT_SUBMISSIONS_DIR = previousDirectory;
    if (previousWebhook === undefined) delete process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
    else process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = previousWebhook;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("V4 contact storage rejects symlinks and persists private durable JSONL", async (t) => {
  const {
    appendContactSubmission,
    cleanupContactSubmissionsFile,
    getContactServiceReadiness
  } = await importFresh("apps/website/lib/contact-form.ts");
  const previousDirectory = process.env.CONTACT_SUBMISSIONS_DIR;
  const previousWebhook = process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
  const temporaryRoot = fs.mkdtempSync(
    path.join(require("node:os").tmpdir(), "website-contact-storage-")
  );
  const directory = path.join(temporaryRoot, "contact");
  const submissionsFile = path.join(directory, "submissions.jsonl");
  const makeSubmission = (submissionId, receivedAt) => ({
    submissionId,
    receivedAt,
    name: "Ada Lovelace",
    contact: "ada@lovelace.dev",
    projectGoal: "Review the product page and improve its conversion path.",
    timeline: "This month",
    budgetRange: "Exploratory",
    links: [],
    ipHash: "test-hash",
    userAgent: "node-test"
  });

  try {
    process.env.CONTACT_SUBMISSIONS_DIR = directory;
    delete process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
    await appendContactSubmission(makeSubmission("contact_initial", "2026-07-15T10:00:00.000Z"));

    const firstLines = fs.readFileSync(submissionsFile, "utf8").trim().split("\n");
    assert.equal(firstLines.length, 1);
    assert.equal(JSON.parse(firstLines[0]).submissionId, "contact_initial");
    if (process.platform !== "win32") {
      assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
      assert.equal(fs.statSync(submissionsFile).mode & 0o777, 0o600);
    }

    fs.writeFileSync(
      submissionsFile,
      `${JSON.stringify(makeSubmission("contact_expired", "2025-01-01T00:00:00.000Z"))}\n`,
      "utf8"
    );
    await Promise.all([
      appendContactSubmission(makeSubmission("contact_concurrent", "2026-07-15T10:01:00.000Z")),
      cleanupContactSubmissionsFile({
        filePath: submissionsFile,
        now: new Date("2026-07-15T12:00:00.000Z"),
        retentionDays: 90,
        dryRun: false
      })
    ]);

    const afterCleanup = fs.readFileSync(submissionsFile, "utf8");
    assert.doesNotMatch(afterCleanup, /contact_expired/);
    assert.match(afterCleanup, /contact_concurrent/);
    assert.deepEqual(
      fs.readdirSync(directory).filter((entry) => entry.endsWith(".tmp")),
      [],
      "atomic cleanup should not leave temporary files behind"
    );
    assert.deepEqual(await getContactServiceReadiness(), {
      ready: true,
      persistence: "ready",
      notification: "not_configured"
    });

    if (process.platform === "win32") {
      t.diagnostic("symlink checks require elevated Windows privileges and are covered on POSIX CI");
    } else {
      const symlinkTarget = path.join(temporaryRoot, "symlink-target.jsonl");
      fs.writeFileSync(symlinkTarget, "private", "utf8");
      fs.rmSync(submissionsFile);
      fs.symlinkSync(symlinkTarget, submissionsFile, "file");
      assert.equal((await getContactServiceReadiness()).ready, false);

      const linkedDirectory = path.join(temporaryRoot, "linked-contact");
      fs.symlinkSync(directory, linkedDirectory, "dir");
      process.env.CONTACT_SUBMISSIONS_DIR = linkedDirectory;
      assert.equal((await getContactServiceReadiness()).ready, false);
    }
  } finally {
    if (previousDirectory === undefined) delete process.env.CONTACT_SUBMISSIONS_DIR;
    else process.env.CONTACT_SUBMISSIONS_DIR = previousDirectory;
    if (previousWebhook === undefined) delete process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
    else process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = previousWebhook;
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("D7 contact API route exposes healthz and post handlers without leaking private counts", () => {
  assert.ok(exists("apps/website/app/api/contact/route.ts"), "contact API route should exist");
  assert.ok(exists("apps/website/app/api/contact/healthz/route.ts"), "contact healthz route should exist");

  const routeSource = read("apps/website/app/api/contact/route.ts");
  const healthzSource = read("apps/website/app/api/contact/healthz/route.ts");
  const moduleSource = read("apps/website/lib/contact-form.ts");

  assert.match(routeSource, /export async function GET/);
  assert.match(routeSource, /export async function POST/);
  assert.match(routeSource, /service:\s*"website-contact"/);
  assert.match(routeSource, /version:\s*"v4"/);
  assert.match(healthzSource, /export async function GET/);
  assert.match(healthzSource, /service:\s*"website-contact"/);
  assert.match(healthzSource, /version:\s*"v4"/);
  assert.match(routeSource, /validateContactFormSubmission/);
  assert.match(routeSource, /checkContactSubmissionGate/);
  assert.match(routeSource, /appendContactSubmission/);
  assert.match(routeSource, /rollbackContactSubmissionGate/);
  assert.match(routeSource, /sendContactNotification/);
  assert.match(routeSource, /readContactRequestJson/);
  assert.doesNotMatch(routeSource, /request\.json\(\)/);
  assert.match(routeSource, /getContactIdentityKey\(ipAddress\)/);
  assert.match(routeSource, /x-real-ip[\s\S]*x-forwarded-for/);
  assert.match(routeSource, /split\(","\)\.at\(-1\)/);
  assert.match(routeSource, /gateResult\.reservation/);
  assert.match(routeSource, /notification_status:\s*"delivered"/);
  assert.match(routeSource, /notification_status:\s*"skipped"/);
  assert.match(routeSource, /notification_status:\s*"failed"/);
  assert.match(routeSource, /persistence_status:\s*"saved"/);
  assert.match(healthzSource, /getContactServiceReadiness/);
  assert.match(healthzSource, /readiness\.ready \? 200 : 503/);
  assert.doesNotMatch(routeSource, /submissionCount|count:/);

  assert.match(moduleSource, /CONTACT_SUBMISSIONS_DIR/);
  assert.match(moduleSource, /CONTACT_NOTIFICATION_WEBHOOK_URL/);
  assert.match(moduleSource, /ipHash/);
  assert.match(moduleSource, /CONTACT_REQUEST_MAX_BYTES = 32 \* 1024/);
  assert.match(moduleSource, /fileHandle\.sync\(\)/);
  assert.match(moduleSource, /fsConstants\.O_EXCL/);
  assert.match(moduleSource, /await rename\(temporaryPath, filePath\)/);
});

test("D7 contact form UI posts to the contact API and keeps failure states recoverable", () => {
  const clientSource = read("apps/website/app/contact/contact-client.tsx");
  const i18nSource = read("apps/website/lib/i18n.ts");

  assert.match(clientSource, /useState/);
  assert.match(clientSource, /handleSubmit/);
  assert.match(clientSource, /fetch\("\/api\/contact"/);
  assert.match(clientSource, /name="honeypot"/);
  assert.match(clientSource, /copy\.contactForm/);
  assert.match(clientSource, /setSubmitState/);
  assert.match(clientSource, /response\.ok/);
  assert.match(clientSource, /payload\.persistence_status === "saved"/);
  assert.match(clientSource, /aria-busy=\{isSubmitting\}/);
  assert.match(clientSource, /aria-describedby="contact-form-description contact-form-status"/);
  assert.match(clientSource, /aria-live="polite"/);
  assert.match(clientSource, /statusRef\.current\?\.focus/);
  assert.match(clientSource, /submissionInFlightRef/);
  assert.match(clientSource, /handleStartAnotherSubmission/);
  assert.match(clientSource, /githubFallbackAction/);

  for (const key of [
    "contactForm",
    "privacyNotice",
    "retentionNotice",
    "deletionNotice",
    "errors",
    "received_with_notification_failure",
    "notificationDelivered",
    "notificationSkipped",
    "notificationFailed",
    "savedGuidance",
    "githubFallbackAction",
    "submitAnotherAction"
  ]) {
    assert.match(i18nSource, new RegExp(`${key}:`));
  }

  assert.doesNotMatch(i18nSource, /hello@example\.com|mailto:hello|example\.com/);
});

test("D7 release docs and acceptance report record implemented form boundaries", () => {
  const spec = read("docs/website/D7_CONTACT_FORM_SPEC.md");
  const plan = read("docs/website/D7_CONTACT_FORM_IMPLEMENTATION_PLAN.md");
  const report = read("docs/website/D7_ACCEPTANCE_REPORT.md");
  const checklist = read("docs/website/RELEASE_CHECKLIST.md");

  assert.match(plan, /Task 1: RED Tests/);
  assert.match(spec, /D7 已实现|D7 implemented/i);
  assert.match(spec, /CONTACT_SUBMISSIONS_DIR/);
  assert.match(spec, /CONTACT_NOTIFICATION_WEBHOOK_URL/);
  assert.match(report, /# Website D7 Contact Form Acceptance Report/);
  assert.match(report, /POST \/api\/contact/);
  assert.match(report, /npm run verify:website-browser/);
  assert.match(checklist, /D7 Contact API/);
  assert.match(checklist, /CONTACT_SUBMISSIONS_DIR/);
});
