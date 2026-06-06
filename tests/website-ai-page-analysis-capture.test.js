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
  const mod = await import(`${url.href}?t=${Date.now()}`);
  // A .ts module in a CommonJS package can surface named exports under
  // `default` when loaded via a transform loader (tsx) on Node 20. Flatten
  // so destructuring matches Node 22 native loading.
  return mod.default && typeof mod.default === "object" ? { ...mod.default, ...mod } : mod;
}

function validPayload(input = "https://example.com") {
  return {
    mode: "url",
    input,
    language: "en",
    brief: {
      audience: "Independent builders",
      goal: "Improve page clarity",
      problem: "The landing page needs a clearer message and stronger proof"
    }
  };
}

function htmlResponse(html, init = {}) {
  return {
    status: init.status ?? 200,
    headers: init.headers ?? { "content-type": "text/html; charset=utf-8" },
    text: async () => html
  };
}

const enoughHtml = `
  <html>
    <head><title>Example Landing Page</title><style>.x{}</style></head>
    <body>
      <script>window.__x = true;</script>
      <main>
        <h1>AI page analysis assistant for product teams</h1>
        <p>This public landing page explains a workflow for reviewing page clarity, conversion paths, trust proof,
        mobile readability, and execution backlog. It contains enough readable body text for a deterministic
        capture summary without relying on a live model or persistent storage.</p>
      </main>
    </body>
  </html>
`;

test("D10 capture extracts title and readable body summary", async () => {
  const {
    capturePageForAnalysis,
    createDefaultAnalysisFetcher,
    extractPageSummary
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  assert.equal(typeof createDefaultAnalysisFetcher, "function");

  const extracted = extractPageSummary(enoughHtml, "https://example.com");
  assert.equal(extracted.ok, true);
  assert.equal(extracted.value.title, "Example Landing Page");
  assert.match(extracted.value.text, /AI page analysis assistant/);
  assert.doesNotMatch(extracted.value.text, /window\.__x/);

  const captured = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => htmlResponse(enoughHtml)
  });

  assert.equal(captured.ok, true);
  assert.equal(captured.value.finalUrl, "https://example.com/");
  assert.equal(captured.value.title, "Example Landing Page");
  assert.ok(captured.value.text.length >= 120);
});

test("D10 capture rejects DNS results that resolve to private addresses", async () => {
  const { capturePageForAnalysis } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const result = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["10.0.0.8"],
    fetcher: async () => htmlResponse(enoughHtml)
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "invalid_url");
});

test("D10 capture revalidates redirects and blocks unsafe redirect targets", async () => {
  const { capturePageForAnalysis } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const result = await capturePageForAnalysis("https://example.com", {
    resolver: async (hostname) => hostname === "example.com" ? ["93.184.216.34"] : ["169.254.169.254"],
    fetcher: async () => htmlResponse("", {
      status: 302,
      headers: {
        location: "http://169.254.169.254/latest/meta-data"
      }
    })
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "invalid_url");
});

test("D10 capture stops redirect loops after three hops", async () => {
  const { capturePageForAnalysis } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  let count = 0;
  const result = await capturePageForAnalysis("https://example.com/start", {
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => {
      count += 1;
      return htmlResponse("", {
        status: 302,
        headers: {
          location: `https://example.com/next-${count}`
        }
      });
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "url_unreachable");
  assert.equal(count, 4);
});

test("D10 capture maps size, auth, content, and timeout failures to stable errors", async () => {
  const { capturePageForAnalysis, extractPageSummary } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const tooLarge = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => htmlResponse("x".repeat(2 * 1024 * 1024 + 1))
  });
  assert.equal(tooLarge.ok, false);
  assert.equal(tooLarge.error.code, "page_too_large");

  const auth = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => htmlResponse("<html><title>Login</title><form><input type=\"password\"></form></html>", {
      status: 200
    })
  });
  assert.equal(auth.ok, false);
  assert.equal(auth.error.code, "auth_required_page");

  const short = extractPageSummary("<html><title>Short</title><body>tiny page</body></html>", "https://example.com");
  assert.equal(short.ok, false);
  assert.equal(short.error.code, "insufficient_page_content");

  const timeout = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => {
      const error = new Error("operation timed out");
      error.name = "AbortError";
      throw error;
    }
  });
  assert.equal(timeout.ok, false);
  assert.equal(timeout.error.code, "capture_timeout");
});

test("D10 analyze pipeline can use captured title while preserving safe mock output", async () => {
  const { analyzePageRequest } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const result = await analyzePageRequest(validPayload("https://example.com/pricing"), {
    now: new Date("2026-05-21T10:00:00.000Z"),
    identityKey: "d10-client",
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => htmlResponse(enoughHtml)
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.safe_mock_api, true);
  assert.equal(result.value.source.title, "Example Landing Page");
  assert.equal(result.value.source.url, "https://example.com/pricing");
});

test("D10 capture docs and release checklist are wired", () => {
  assert.ok(exists("docs/website/D10_ACCEPTANCE_REPORT.md"));

  const plan = read("docs/website/D10_AI_PAGE_ANALYSIS_CAPTURE_PLAN.md");
  const report = read("docs/website/D10_ACCEPTANCE_REPORT.md");
  const checklist = read("docs/website/RELEASE_CHECKLIST.md");

  assert.match(plan, /capturePageForAnalysis/);
  assert.match(report, /# Website D10 AI Page Analysis Capture Harness Acceptance Report/);
  assert.match(checklist, /D10 AI Page Analysis Capture Harness/);
  assert.doesNotMatch(plan, /TBD|TODO|implement later|fill in details/);
});
