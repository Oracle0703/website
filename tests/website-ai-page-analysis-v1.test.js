const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}`);
}

function validRequest(language = "en") {
  return {
    mode: "url",
    input: "https://example.com/pricing",
    language,
    brief: {
      audience: "Mid-market team leads",
      goal: "Increase trial requests",
      problem: "Hero copy is vague and trust proof appears too late"
    }
  };
}

function validRawOutput(confidence = 0.82) {
  return {
    confidence,
    scores: [
      {
        key: "value_proposition",
        score: 71,
        reason: "The first-screen message names the product category but not the measurable user outcome."
      },
      {
        key: "information_architecture",
        score: 68,
        reason: "The page has useful sections, but the proof and CTA path are not easy to scan."
      },
      {
        key: "conversion_path",
        score: 62,
        reason: "The primary action is present but competing links dilute the next step."
      },
      {
        key: "trust_signal",
        score: 64,
        reason: "Proof exists but appears too late for high-intent visitors."
      },
      {
        key: "mobile_readability",
        score: 69,
        reason: "The mobile order is readable, but the CTA and proof should move earlier."
      }
    ],
    issues: [
      {
        severity: "high",
        evidence: "The hero headline does not connect the audience to a concrete trial request outcome.",
        impact: "Visitors may not understand why the offer matters before deciding to continue.",
        recommendation: "Rewrite the hero around audience, outcome, and one primary CTA."
      }
    ],
    recommendations: [
      {
        module: "Hero",
        action: "Rewrite the headline, subcopy, and primary CTA around the stated conversion goal.",
        priority: "P0",
        expected_outcome: "Reduce comprehension cost and make the next action obvious."
      }
    ],
    backlog: [
      {
        task: "Rewrite hero headline, subcopy, and primary CTA",
        owner: "product/design",
        priority: "P0",
        eta: "0.5d"
      }
    ]
  };
}

test("P3A output gate accepts valid model-like JSON and returns stable analysis result", async () => {
  const { validateModelAnalysisOutput } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const result = validateModelAnalysisOutput(JSON.stringify(validRawOutput()), {
    input: validRequest("en"),
    now: new Date("2026-05-25T08:00:00.000Z"),
    capturedTitle: "Example Pricing"
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.analysis_id, "ana_20260525_0b91a326");
  assert.equal(result.value.status, "succeeded");
  assert.equal(result.value.needs_review, false);
  assert.equal(result.value.confidence, 0.82);
  assert.equal(result.value.safe_mock_api, true);
  assert.equal(result.value.source.title, "Example Pricing");
  assert.equal(result.value.scores.length, 5);
  assert.deepEqual(result.value.scores.map((score) => score.key), [
    "value_proposition",
    "information_architecture",
    "conversion_path",
    "trust_signal",
    "mobile_readability"
  ]);
  assert.ok(result.value.issues[0].evidence);
  assert.ok(result.value.issues[0].impact);
  assert.ok(result.value.recommendations[0].expected_outcome);
  assert.ok(result.value.backlog[0].task);
});

test("P3A output gate rejects malformed or incomplete model output", async () => {
  const { validateModelAnalysisOutput } = await importFresh("apps/website/lib/ai-page-analysis.ts");
  const context = {
    input: validRequest("en"),
    now: new Date("2026-05-25T08:00:00.000Z"),
    capturedTitle: "Example Pricing"
  };

  const malformed = validateModelAnalysisOutput("{not-json", context);
  assert.equal(malformed.ok, false);
  assert.equal(malformed.error.code, "invalid_model_output");

  const missingEvidence = validRawOutput();
  delete missingEvidence.issues[0].evidence;
  const evidenceResult = validateModelAnalysisOutput(missingEvidence, context);
  assert.equal(evidenceResult.ok, false);
  assert.equal(evidenceResult.error.code, "invalid_model_output");

  const missingScore = validRawOutput();
  missingScore.scores = missingScore.scores.filter((score) => score.key !== "trust_signal");
  const scoreResult = validateModelAnalysisOutput(missingScore, context);
  assert.equal(scoreResult.ok, false);
  assert.equal(scoreResult.error.code, "invalid_model_output");

  const emptyBacklog = validRawOutput();
  emptyBacklog.backlog = [];
  const backlogResult = validateModelAnalysisOutput(emptyBacklog, context);
  assert.equal(backlogResult.ok, false);
  assert.equal(backlogResult.error.code, "invalid_model_output");

  const invalidConfidence = validRawOutput();
  invalidConfidence.confidence = "high";
  const confidenceResult = validateModelAnalysisOutput(invalidConfidence, context);
  assert.equal(confidenceResult.ok, false);
  assert.equal(confidenceResult.error.code, "invalid_model_output");
});

test("P3A output gate keeps low-confidence output but marks it for review", async () => {
  const { validateModelAnalysisOutput } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const result = validateModelAnalysisOutput(validRawOutput(0.42), {
    input: validRequest("en"),
    now: new Date("2026-05-25T08:00:00.000Z"),
    capturedTitle: "Example Pricing"
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.confidence, 0.42);
  assert.equal(result.value.needs_review, true);
});

test("P3A output gate clamps numeric confidence into the supported range", async () => {
  const { validateModelAnalysisOutput } = await importFresh("apps/website/lib/ai-page-analysis.ts");
  const context = {
    input: validRequest("en"),
    now: new Date("2026-05-25T08:00:00.000Z"),
    capturedTitle: "Example Pricing"
  };

  const high = validateModelAnalysisOutput(validRawOutput(1.25), context);
  assert.equal(high.ok, true);
  assert.equal(high.value.confidence, 1);
  assert.equal(high.value.needs_review, false);

  const low = validateModelAnalysisOutput(validRawOutput(-0.25), context);
  assert.equal(low.ok, true);
  assert.equal(low.value.confidence, 0);
  assert.equal(low.value.needs_review, true);
});

test("P3A adapter and pipeline export planned V1 boundaries", async () => {
  const {
    createSafeMockAnalysisAdapter,
    runAnalysisPipeline,
    validateModelAnalysisOutput
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  assert.equal(typeof createSafeMockAnalysisAdapter, "function");
  assert.equal(typeof runAnalysisPipeline, "function");

  const request = validRequest("en");
  const page = {
    finalUrl: request.input,
    title: "Example Pricing",
    text: "Readable page summary with enough context for the model adapter boundary."
  };

  const rawMock = await createSafeMockAnalysisAdapter()({
    request,
    page,
    language: "en"
  });

  const validatedMock = validateModelAnalysisOutput(rawMock, {
    input: request,
    now: new Date("2026-05-25T08:00:00.000Z"),
    capturedTitle: page.title
  });
  assert.equal(validatedMock.ok, true);

  let adapterCalled = false;
  const injected = await runAnalysisPipeline(request, page, {
    now: new Date("2026-05-25T08:00:00.000Z"),
    modelAdapter: async (input) => {
      adapterCalled = true;
      assert.equal(input.request.input, request.input);
      assert.equal(input.page.title, "Example Pricing");
      assert.equal(input.language, "en");
      return validRawOutput(0.72);
    }
  });

  assert.equal(adapterCalled, true);
  assert.equal(injected.ok, true);
  assert.equal(injected.value.confidence, 0.72);

  const timeoutError = new Error("model timed out");
  timeoutError.code = "ETIMEDOUT";
  const timedOut = await runAnalysisPipeline(request, page, {
    modelAdapter: async () => {
      throw timeoutError;
    }
  });
  assert.equal(timedOut.ok, false);
  assert.equal(timedOut.error.code, "analysis_timeout");

  const malformed = await runAnalysisPipeline(request, page, {
    modelAdapter: async () => ({ confidence: 0.8, scores: [] })
  });
  assert.equal(malformed.ok, false);
  assert.equal(malformed.error.code, "invalid_model_output");
});

test("P3A route keeps model adapter selection on the server boundary", () => {
  const route = read("apps/website/app/api/analyze/route.ts");

  assert.match(route, /createRouteModelAdapter/);
  assert.match(route, /modelAdapter:\s*createRouteModelAdapter\(\)/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_.*MODEL|NEXT_PUBLIC_.*AI|NEXT_PUBLIC_.*OPENAI/);
});

test("P3A frontend sends structured brief fields for URL analysis", () => {
  const client = read("apps/website/components/landing/ai-page-analysis-landing-client.tsx");

  assert.match(client, /structuredBrief/);
  assert.match(client, /briefLabels/);
  assert.match(client, /audience:\s*structuredBrief\.audience/);
  assert.match(client, /goal:\s*structuredBrief\.goal/);
  assert.match(client, /problem:\s*structuredBrief\.problem/);
  assert.match(client, /value=\{structuredBrief\.audience\}/);
  assert.match(client, /value=\{structuredBrief\.goal\}/);
  assert.match(client, /value=\{structuredBrief\.problem\}/);
  assert.match(client, /analysis_timeout/);
  assert.match(client, /invalid_model_output/);
  assert.doesNotMatch(client, /brief:\s*buildDemoBrief\(effectiveInput,\s*locale\)/);
});
