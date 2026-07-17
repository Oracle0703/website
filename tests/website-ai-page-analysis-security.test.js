const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

async function importFresh(relPath) {
  const url = pathToFileURL(path.join(root, relPath));
  return import(`${url.href}?t=${Date.now()}-${Math.random()}`);
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

const enoughHtml = `
  <html><head><title>Public example</title></head><body><main>
  This public page contains enough readable content to exercise the bounded capture path without using
  a live model. The remaining words make the deterministic extraction longer than the minimum threshold
  while keeping the test fixture compact and predictable for the security regression suite.
  </main></body></html>
`;

function htmlResponse(html, init = {}) {
  return {
    status: init.status ?? 200,
    headers: init.headers ?? { "content-type": "text/html; charset=utf-8" },
    text: async () => html
  };
}

test("AI analysis capture feature flag is explicit and defaults to no outbound request", async () => {
  const {
    analyzePageRequest,
    createAnalysisConcurrencyGate,
    createAnalysisRequestGate,
    isAnalysisPublicCaptureEnabled
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  assert.equal(isAnalysisPublicCaptureEnabled({}), false);
  assert.equal(isAnalysisPublicCaptureEnabled({ AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE: "false" }), false);
  assert.equal(isAnalysisPublicCaptureEnabled({ AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE: "1" }), false);
  assert.equal(isAnalysisPublicCaptureEnabled({ AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE: "TRUE" }), false);
  assert.equal(isAnalysisPublicCaptureEnabled({ AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE: "true" }), true);

  let resolverCalled = false;
  let fetcherCalled = false;
  const result = await analyzePageRequest(validPayload(), {
    identityKey: "flag-default",
    gate: createAnalysisRequestGate(),
    concurrencyGate: createAnalysisConcurrencyGate(),
    resolver: async () => {
      resolverCalled = true;
      return ["93.184.216.34"];
    },
    fetcher: async () => {
      fetcherCalled = true;
      return htmlResponse(enoughHtml);
    }
  });

  assert.equal(result.ok, true);
  assert.equal(resolverCalled, false);
  assert.equal(fetcherCalled, false);
  assert.equal(result.value.source.capture.performed, false);
  assert.match(result.value.source.title, /Safe Mock/);
  assert.equal("captured_at" in result.value.source, false);
});

test("AI analysis request JSON reader enforces declared and streaming byte limits", async () => {
  const {
    ANALYSIS_REQUEST_MAX_BYTES,
    readLimitedAnalysisJsonBody
  } = await importFresh("apps/website/lib/ai-analysis-request-body.ts");

  const valid = await readLimitedAnalysisJsonBody(new Request("https://example.test/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true })
  }));
  assert.deepEqual(valid, { ok: true, value: { ok: true } });

  let declaredBodyCancelled = false;
  const declaredTooLarge = await readLimitedAnalysisJsonBody({
    headers: new Headers({ "content-length": String(ANALYSIS_REQUEST_MAX_BYTES + 1) }),
    body: new ReadableStream({
      cancel() {
        declaredBodyCancelled = true;
      }
    })
  });
  assert.equal(declaredTooLarge.ok, false);
  assert.equal(declaredTooLarge.httpStatus, 413);
  assert.equal(declaredTooLarge.error.code, "request_too_large");
  assert.equal(declaredBodyCancelled, true);

  let cancelled = false;
  const streamingTooLarge = await readLimitedAnalysisJsonBody({
    headers: new Headers(),
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(ANALYSIS_REQUEST_MAX_BYTES));
        controller.enqueue(new Uint8Array(1));
      },
      cancel() {
        cancelled = true;
      }
    })
  });
  assert.equal(streamingTooLarge.ok, false);
  assert.equal(streamingTooLarge.httpStatus, 413);
  assert.equal(streamingTooLarge.error.code, "request_too_large");
  assert.equal(cancelled, true);

  const invalidJson = await readLimitedAnalysisJsonBody(new Request("https://example.test/api/analyze", {
    method: "POST",
    body: "{broken"
  }));
  assert.equal(invalidJson.ok, false);
  assert.equal(invalidJson.httpStatus, 400);
  assert.equal(invalidJson.error.code, "submit_failure");
});

test("AI analysis SSRF guard handles IPv4, IPv6, mapped IPv4, and special names", async () => {
  const {
    isPublicAnalysisAddress,
    validateAnalysisUrlSafety
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  for (const unsafeAddress of [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "168.63.129.16",
    "172.31.255.255",
    "192.0.0.1",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "::ffff:192.168.1.1",
    "64:ff9b::7f00:1",
    "2001:db8::1",
    "2002:7f00:1::",
    "3fff::1",
    "fc00::1",
    "fe80::1",
    "fec0::1",
    "ff02::1"
  ]) {
    assert.equal(isPublicAnalysisAddress(unsafeAddress), false, `${unsafeAddress} must be rejected`);
  }

  for (const publicAddress of ["1.1.1.1", "93.184.216.34", "2606:4700:4700::1111", "::ffff:93.184.216.34"]) {
    assert.equal(isPublicAnalysisAddress(publicAddress), true, `${publicAddress} should be public`);
  }

  for (const unsafeUrl of [
    "http://localhost./",
    "http://service.internal/",
    "http://printer.local/",
    "http://router.home.arpa/",
    "http://2130706433/",
    "http://[::ffff:127.0.0.1]/",
    "https://example.com:8443/"
  ]) {
    const result = validateAnalysisUrlSafety(new URL(unsafeUrl));
    assert.equal(result.ok, false, `${unsafeUrl} must be rejected`);
  }
});

test("AI analysis total timeout also bounds a resolver that ignores AbortSignal", async () => {
  const { capturePageForAnalysis } = await importFresh("apps/website/lib/ai-page-analysis.ts");
  const result = await capturePageForAnalysis("https://example.com", {
    timeoutMs: 5,
    resolver: async () => new Promise(() => {}),
    fetcher: async () => htmlResponse(enoughHtml)
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "capture_timeout");
});

test("AI analysis capture pins every request and redirect to that hop's validated address", async () => {
  const {
    capturePageForAnalysis,
    createPinnedAnalysisLookup
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const lookup = createPinnedAnalysisLookup("93.184.216.34");
  const pinned = await new Promise((resolve, reject) => {
    lookup("rebinding.example", { all: false }, (error, address, family) => {
      if (error) reject(error);
      else resolve({ address, family });
    });
  });
  assert.deepEqual(pinned, { address: "93.184.216.34", family: 4 });

  const requests = [];
  const result = await capturePageForAnalysis("https://example.com/start", {
    resolver: async (hostname) => hostname === "example.com" ? ["93.184.216.34"] : ["1.1.1.1"],
    fetcher: async (url, init) => {
      requests.push([url.hostname, init.resolvedAddress, init.headers["accept-encoding"]]);
      if (url.hostname === "example.com") {
        return htmlResponse("", {
          status: 302,
          headers: { location: "https://www.example.com/final" }
        });
      }
      return htmlResponse(enoughHtml);
    }
  });

  assert.equal(result.ok, true);
  assert.deepEqual(requests, [
    ["example.com", "93.184.216.34", "identity"],
    ["www.example.com", "1.1.1.1", "identity"]
  ]);
  assert.equal(result.value.finalUrl, "https://www.example.com/final");
});

test("AI analysis capture cancels declared oversized bodies, caps titles, and connects only over IPv4", async () => {
  const {
    capturePageForAnalysis,
    extractPageSummary
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  let bodyCancelled = false;
  const oversized = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["93.184.216.34"],
    fetcher: async () => ({
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-length": String(2 * 1024 * 1024 + 1)
      },
      body: new ReadableStream({
        cancel() {
          bodyCancelled = true;
        }
      }),
      text: async () => ""
    })
  });
  assert.equal(oversized.ok, false);
  assert.equal(oversized.error.code, "page_too_large");
  assert.equal(bodyCancelled, true);

  let fetchCalled = false;
  const ipv6Only = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["2606:4700:4700::1111"],
    fetcher: async () => {
      fetchCalled = true;
      return htmlResponse(enoughHtml);
    }
  });
  assert.equal(ipv6Only.ok, false);
  assert.equal(ipv6Only.error.code, "invalid_url");
  assert.equal(fetchCalled, false);

  let connectedAddress = "";
  const dualStack = await capturePageForAnalysis("https://example.com", {
    resolver: async () => ["2606:4700:4700::1111", "93.184.216.34"],
    fetcher: async (_url, init) => {
      connectedAddress = init.resolvedAddress;
      return htmlResponse(enoughHtml);
    }
  });
  assert.equal(dualStack.ok, true);
  assert.equal(connectedAddress, "93.184.216.34");

  const longTitle = extractPageSummary(
    `<html><head><title>${"A".repeat(10_000)}</title></head><body><main>${"Readable content ".repeat(20)}</main></body></html>`,
    "https://example.com"
  );
  assert.equal(longTitle.ok, true);
  assert.equal(longTitle.value.title.length, 240);
});

test("AI analysis global concurrency gate returns a clear 503 and releases slots", async () => {
  const {
    analyzePageRequest,
    createAnalysisConcurrencyGate,
    createAnalysisRequestGate
  } = await importFresh("apps/website/lib/ai-page-analysis.ts");

  const concurrencyGate = createAnalysisConcurrencyGate(2);
  const rateGate = createAnalysisRequestGate();
  let entered = 0;
  let notifyEntered;
  const bothEntered = new Promise((resolve) => {
    notifyEntered = resolve;
  });
  let releaseFetches;
  const continueFetches = new Promise((resolve) => {
    releaseFetches = resolve;
  });
  const fetcher = async () => {
    entered += 1;
    if (entered === 2) notifyEntered();
    await continueFetches;
    return htmlResponse(enoughHtml);
  };
  const common = {
    capture: true,
    gate: rateGate,
    concurrencyGate,
    resolver: async () => ["93.184.216.34"],
    fetcher
  };

  const first = analyzePageRequest(validPayload(), { ...common, identityKey: "concurrent-1" });
  const second = analyzePageRequest(validPayload(), { ...common, identityKey: "concurrent-2" });
  await bothEntered;

  const rejected = await analyzePageRequest(validPayload(), { ...common, identityKey: "concurrent-3" });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.httpStatus, 503);
  assert.equal(rejected.error.code, "server_busy");
  assert.match(rejected.error.message, /two-request concurrency limit/i);

  releaseFetches();
  const completed = await Promise.all([first, second]);
  assert.ok(completed.every((item) => item.ok));
  assert.equal(concurrencyGate.active, 0);
});

test("AI analysis deployment docs keep capture off by default and define proxy limits", () => {
  const deploy = fs.readFileSync(path.join(root, "docs/website/DEPLOY_WINDOWS_BAOTA.md"), "utf8");
  const checklist = fs.readFileSync(path.join(root, "docs/website/RELEASE_CHECKLIST.md"), "utf8");

  assert.match(deploy, /AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE=false/);
  assert.match(deploy, /location = \/api\/analyze/);
  assert.match(deploy, /client_max_body_size 16k/);
  assert.match(deploy, /limit_conn analyze_global 2/);
  assert.match(checklist, /固定.*公网 IP|pin.*public IP/i);
});
