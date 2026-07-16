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
});

test("D7 contact submission gate catches rate limits and duplicate submissions", async () => {
  const {
    CONTACT_GATE_MAX_ENTRIES,
    checkContactSubmissionGate,
    createContactSubmissionGate
  } = await importFresh("apps/website/lib/contact-form.ts");

  const gate = createContactSubmissionGate();
  const base = {
    contact: "ada@lovelace.dev",
    projectGoal: "I want to refine a public product page and clarify the conversion path.",
    identityKey: "client-one",
    now: 1_000_000
  };

  assert.equal(checkContactSubmissionGate(gate, base).ok, true);
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
    capacityGate.attemptsByIdentity.set(`client-${index}`, [3_000_000]);
    capacityGate.duplicateByContactGoal.set(`duplicate-${index}`, 3_000_000);
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
});

test("D7 contact webhook delivery has a bounded timeout", async () => {
  const { sendContactNotification } = await importFresh("apps/website/lib/contact-form.ts");
  const previousWebhook = process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
  process.env.CONTACT_NOTIFICATION_WEBHOOK_URL = "https://hooks.example.test/contact";

  try {
    const result = await sendContactNotification({
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
    }, {
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

test("D7 contact API route exposes healthz and post handlers without leaking private counts", () => {
  assert.ok(exists("apps/website/app/api/contact/route.ts"), "contact API route should exist");
  assert.ok(exists("apps/website/app/api/contact/healthz/route.ts"), "contact healthz route should exist");

  const routeSource = read("apps/website/app/api/contact/route.ts");
  const healthzSource = read("apps/website/app/api/contact/healthz/route.ts");
  const moduleSource = read("apps/website/lib/contact-form.ts");

  assert.match(routeSource, /export async function GET/);
  assert.match(routeSource, /export async function POST/);
  assert.match(routeSource, /service:\s*"website-contact"/);
  assert.match(routeSource, /version:\s*"d7"/);
  assert.match(healthzSource, /export async function GET/);
  assert.match(healthzSource, /service:\s*"website-contact"/);
  assert.match(healthzSource, /version:\s*"d7"/);
  assert.match(routeSource, /validateContactFormSubmission/);
  assert.match(routeSource, /checkContactSubmissionGate/);
  assert.match(routeSource, /appendContactSubmission/);
  assert.match(routeSource, /sendContactNotification/);
  assert.doesNotMatch(routeSource, /submissionCount|count:/);

  assert.match(moduleSource, /CONTACT_SUBMISSIONS_DIR/);
  assert.match(moduleSource, /CONTACT_NOTIFICATION_WEBHOOK_URL/);
  assert.match(moduleSource, /ipHash/);
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

  for (const key of [
    "contactForm",
    "privacyNotice",
    "retentionNotice",
    "deletionNotice",
    "errors",
    "received_with_notification_failure"
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
