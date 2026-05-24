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

test("D9 AI page analysis input schema normalizes safe URL requests", async () => {
  const {
    validateAnalysisRequest,
    ANALYSIS_SCORE_KEYS
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  assert.deepEqual(ANALYSIS_SCORE_KEYS, [
    "value_proposition",
    "information_architecture",
    "conversion_path",
    "trust_signal",
    "mobile_readability"
  ]);

  const result = validateAnalysisRequest({
    mode: "url",
    input: " https://Example.com/pricing?ref=demo ",
    language: "en",
    brief: {
      audience: "Mid-market team leads",
      goal: "Increase trial requests",
      problem: "Hero copy is vague and the primary CTA is weak"
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.mode, "url");
  assert.equal(result.value.input, "https://example.com/pricing?ref=demo");
  assert.equal(result.value.language, "en");
  assert.equal(result.value.brief.goal, "Increase trial requests");
});

test("D9 AI page analysis rejects invalid brief and unsupported URL inputs", async () => {
  const {
    validateAnalysisRequest,
    analyzePageRequest
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const tooShort = validateAnalysisRequest({
    mode: "url",
    input: "https://example.com",
    brief: {
      audience: "dev",
      goal: "go",
      problem: "bad"
    }
  });

  assert.equal(tooShort.ok, false);
  assert.equal(tooShort.error.code, "input_too_short");

  const ftp = validateAnalysisRequest({
    mode: "url",
    input: "ftp://example.com/file",
    brief: {
      audience: "Independent developers",
      goal: "Improve signup conversion",
      problem: "The page does not explain the product clearly"
    }
  });

  assert.equal(ftp.ok, false);
  assert.equal(ftp.error.code, "invalid_url");

  const badMode = await analyzePageRequest({
    mode: "brief",
    input: "https://example.com",
    brief: {
      audience: "Independent developers",
      goal: "Improve signup conversion",
      problem: "The page does not explain the product clearly"
    }
  });

  assert.equal(badMode.ok, false);
  assert.equal(badMode.error.code, "invalid_mode");
  assert.equal(badMode.httpStatus, 400);
});

test("D9 AI page analysis SSRF guard blocks private and metadata targets", async () => {
  const { validateAnalysisUrlSafety } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  for (const unsafeUrl of [
    "http://localhost:3000",
    "http://127.0.0.1/admin",
    "http://10.0.0.1/",
    "http://172.16.0.8/",
    "http://192.168.1.1/",
    "http://169.254.169.254/latest/meta-data",
    "http://metadata.google.internal/computeMetadata/v1/",
    "https://user:pass@example.com/private"
  ]) {
    const result = validateAnalysisUrlSafety(new URL(unsafeUrl));
    assert.equal(result.ok, false, `${unsafeUrl} should be rejected`);
    assert.equal(result.error.code, "invalid_url");
  }

  const resolvedPrivate = validateAnalysisUrlSafety(new URL("https://example.com"), {
    resolvedAddresses: ["93.184.216.34", "10.0.0.2"]
  });
  assert.equal(resolvedPrivate.ok, false);
  assert.match(resolvedPrivate.error.message, /private|internal|unsafe/i);

  const safe = validateAnalysisUrlSafety(new URL("https://example.com"), {
    resolvedAddresses: ["93.184.216.34"]
  });
  assert.equal(safe.ok, true);
});

test("D9 AI page analysis mock output keeps a stable actionable schema", async () => {
  const {
    createMockPageAnalysis,
    analyzePageRequest
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const normalized = {
    mode: "url",
    input: "https://example.com/pricing",
    language: "en",
    brief: {
      audience: "Mid-market team leads",
      goal: "Increase trial requests",
      problem: "Hero copy is vague and trust proof appears too late"
    }
  };

  const output = createMockPageAnalysis(normalized, {
    now: new Date("2026-05-21T10:00:00.000Z")
  });

  assert.match(output.analysis_id, /^ana_20260521_/);
  assert.equal(output.status, "succeeded");
  assert.equal(output.source.url, "https://example.com/pricing");
  assert.equal(output.source.captured_at, "2026-05-21T10:00:00.000Z");
  assert.equal(output.scores.length, 5);
  assert.ok(output.confidence >= 0.65);
  assert.equal(output.needs_review, false);

  for (const issue of output.issues) {
    assert.ok(issue.severity);
    assert.ok(issue.evidence);
    assert.ok(issue.impact);
    assert.ok(issue.recommendation);
  }

  assert.ok(output.recommendations.length > 0);
  assert.ok(output.backlog.length > 0);
  assert.ok(output.backlog.every((item) => item.task && item.owner && item.priority && item.eta));

  const analyzed = await analyzePageRequest(normalized, {
    now: new Date("2026-05-21T10:00:00.000Z"),
    identityKey: "test-client",
    capture: false
  });

  assert.equal(analyzed.ok, true);
  assert.equal(analyzed.httpStatus, 200);
  assert.equal(analyzed.value.status, "succeeded");
});

test("D9 AI page analysis request gate rate limits high frequency clients", async () => {
  const {
    checkAnalysisRequestGate,
    createAnalysisRequestGate
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const gate = createAnalysisRequestGate();
  const now = Date.parse("2026-05-21T10:00:00.000Z");

  for (let index = 0; index < 5; index += 1) {
    assert.deepEqual(checkAnalysisRequestGate(gate, { identityKey: "client-a", now: now + index }), { ok: true });
  }

  const blocked = checkAnalysisRequestGate(gate, { identityKey: "client-a", now: now + 6 });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.error.code, "rate_limited");

  const later = checkAnalysisRequestGate(gate, { identityKey: "client-a", now: now + 16 * 60 * 1000 });
  assert.equal(later.ok, true);
});

test("D9 AI page analysis API routes, frontend, and docs are wired", () => {
  assert.ok(exists("apps/website/app/api/analyze/route.ts"));
  assert.ok(exists("apps/website/app/api/analyze/healthz/route.ts"));
  assert.ok(exists("docs/website/D9_ACCEPTANCE_REPORT.md"));

  const route = read("apps/website/app/api/analyze/route.ts");
  const healthz = read("apps/website/app/api/analyze/healthz/route.ts");
  const client = read("apps/website/components/landing/ai-page-analysis-landing-client.tsx");
  const checklist = read("docs/website/RELEASE_CHECKLIST.md");
  const report = read("docs/website/D9_ACCEPTANCE_REPORT.md");
  const plan = read("docs/website/D9_AI_PAGE_ANALYSIS_API_PLAN.md");

  assert.match(route, /analyzePageRequest/);
  assert.match(route, /service:\s*"ai-page-analysis"/);
  assert.match(route, /version:\s*"d9"/);
  assert.match(healthz, /service:\s*"ai-page-analysis"/);
  assert.match(client, /fetch\("\/api\/analyze"/);
  assert.match(client, /Safe Mock API|safe mock API/i);
  assert.match(checklist, /D9 AI Page Analysis API/);
  assert.match(report, /# Website D9 AI Page Analysis API Acceptance Report/);
  assert.doesNotMatch(plan, /TBD|TODO|implement later|fill in details/);
});
