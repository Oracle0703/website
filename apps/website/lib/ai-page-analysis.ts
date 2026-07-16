import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";

export const ANALYSIS_SCORE_KEYS = [
  "value_proposition",
  "information_architecture",
  "conversion_path",
  "trust_signal",
  "mobile_readability"
] as const;

export type AnalysisScoreKey = (typeof ANALYSIS_SCORE_KEYS)[number];
export type AnalysisLanguage = "zh" | "en";
export type AnalysisErrorCode =
  | "invalid_mode"
  | "invalid_url"
  | "input_too_short"
  | "rate_limited"
  | "submit_failure"
  | "url_unreachable"
  | "auth_required_page"
  | "insufficient_page_content"
  | "page_too_large"
  | "capture_timeout";

export type AnalysisError = {
  code: AnalysisErrorCode;
  message: string;
};

export type AnalysisBrief = {
  audience: string;
  goal: string;
  problem: string;
};

export type NormalizedAnalysisRequest = {
  mode: "url";
  input: string;
  language: AnalysisLanguage;
  brief: AnalysisBrief;
};

export type AnalysisScore = {
  key: AnalysisScoreKey;
  label: string;
  score: number;
  reason: string;
};

export type AnalysisIssue = {
  severity: "high" | "medium" | "low";
  evidence: string;
  impact: string;
  recommendation: string;
};

export type AnalysisRecommendation = {
  module: string;
  action: string;
  priority: "P0" | "P1" | "P2";
  expected_outcome: string;
};

export type AnalysisBacklogItem = {
  task: string;
  owner: string;
  priority: "P0" | "P1" | "P2";
  eta: string;
};

export type PageAnalysisResult = {
  analysis_id: string;
  status: "succeeded";
  needs_review: boolean;
  confidence: number;
  source: {
    url: string;
    title: string;
    captured_at: string;
  };
  scores: AnalysisScore[];
  issues: AnalysisIssue[];
  recommendations: AnalysisRecommendation[];
  backlog: AnalysisBacklogItem[];
  safe_mock_api: true;
};

export type AnalysisRequestGate = {
  attemptsByIdentity: Map<string, number[]>;
  lastCleanupAt: number;
};

export type PageCaptureSummary = {
  finalUrl: string;
  title: string;
  text: string;
};

export type AnalysisFetchResponse = {
  status: number;
  headers?: Headers | Record<string, string> | Map<string, string>;
  body?: ReadableStream<Uint8Array> | null;
  text: () => Promise<string>;
};

export type AnalysisFetcher = (
  url: URL,
  init: {
    signal?: AbortSignal;
    headers: Record<string, string>;
    redirect: "manual";
  }
) => Promise<AnalysisFetchResponse>;

export type AnalysisResolver = (hostname: string) => Promise<string[]>;

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
export const ANALYSIS_GATE_MAX_IDENTITIES = 5_000;
const MAX_URL_LENGTH = 2048;
const MAX_CAPTURE_REDIRECTS = 3;
const MAX_CAPTURE_HTML_BYTES = 2 * 1024 * 1024;
export const ANALYSIS_CAPTURE_TIMEOUT_MS = 10_000;
const MIN_CAPTURE_TEXT_LENGTH = 120;
const MAX_BRIEF_LENGTH = {
  audience: 240,
  goal: 240,
  problem: 500
};

const CLOUD_METADATA_HOSTS = new Set([
  "metadata.google.internal",
  "metadata",
  "instance-data",
  "169.254.169.254"
]);

function failure(code: AnalysisErrorCode, message: string): { ok: false; error: AnalysisError } {
  return {
    ok: false,
    error: {
      code,
      message
    }
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBrief(value: unknown): AnalysisBrief | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const brief = {
    audience: getString(record.audience).slice(0, MAX_BRIEF_LENGTH.audience),
    goal: getString(record.goal).slice(0, MAX_BRIEF_LENGTH.goal),
    problem: getString(record.problem).slice(0, MAX_BRIEF_LENGTH.problem)
  };

  if (brief.audience.length < 4 || brief.goal.length < 4 || brief.problem.length < 4) {
    return null;
  }

  return brief;
}

function normalizeHostname(hostname: string) {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function parseIpv4(address: string): number[] | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) return Number.NaN;
    return Number(part);
  });

  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets;
}

function isUnsafeIpv4(address: string) {
  const octets = parseIpv4(address);
  if (!octets) return false;

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 203 && second === 0)
  );
}

function isUnsafeIpv6(address: string) {
  const normalized = normalizeHostname(address);

  return (
    normalized === "::1" ||
    normalized === "0:0:0:0:0:0:0:1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("ff")
  );
}

function isUnsafeHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);

  if (!normalized) return true;
  if (normalized === "localhost" || normalized.endsWith(".localhost")) return true;
  if (CLOUD_METADATA_HOSTS.has(normalized)) return true;
  if (isUnsafeIpv4(normalized) || isUnsafeIpv6(normalized)) return true;

  return false;
}

export function validateAnalysisUrlSafety(
  url: URL,
  options: { resolvedAddresses?: string[] } = {}
): { ok: true } | { ok: false; error: AnalysisError } {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return failure("invalid_url", "Only HTTP and HTTPS URLs are supported.");
  }

  if (url.username || url.password) {
    return failure("invalid_url", "URLs with embedded credentials are not accepted.");
  }

  if (isUnsafeHostname(url.hostname)) {
    return failure("invalid_url", "Private, local, or metadata URLs are not accepted.");
  }

  for (const address of options.resolvedAddresses ?? []) {
    if (isUnsafeHostname(address)) {
      return failure("invalid_url", "Resolved private or internal addresses are not accepted.");
    }
  }

  return { ok: true };
}

export function validateAnalysisRequest(payload: unknown):
  | { ok: true; value: NormalizedAnalysisRequest }
  | { ok: false; error: AnalysisError } {
  if (!payload || typeof payload !== "object") {
    return failure("submit_failure", "Request body must be a JSON object.");
  }

  const record = payload as Record<string, unknown>;
  if (record.mode !== "url") {
    return failure("invalid_mode", "D9 only supports URL analysis mode.");
  }

  const rawInput = getString(record.input);
  if (!rawInput || rawInput.length > MAX_URL_LENGTH) {
    return failure("invalid_url", "URL is required and must be shorter than 2048 characters.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawInput);
  } catch {
    return failure("invalid_url", "URL must be a valid HTTP or HTTPS URL.");
  }

  const safety = validateAnalysisUrlSafety(parsedUrl);
  if (!safety.ok) {
    return safety;
  }

  const brief = normalizeBrief(record.brief);
  if (!brief) {
    return failure("input_too_short", "Audience, goal, and problem must each contain at least four characters.");
  }

  const language = record.language === "en" ? "en" : "zh";

  return {
    ok: true,
    value: {
      mode: "url",
      input: parsedUrl.toString(),
      language,
      brief
    }
  };
}

export function createAnalysisRequestGate(): AnalysisRequestGate {
  return {
    attemptsByIdentity: new Map(),
    lastCleanupAt: 0
  };
}

export const analysisRequestGate = createAnalysisRequestGate();

function cleanupAnalysisRequestGate(
  gate: AnalysisRequestGate,
  now: number,
  incomingIdentityKey: string
) {
  const cleanupDue = now - gate.lastCleanupAt >= FIFTEEN_MINUTES;
  const needsRoom =
    !gate.attemptsByIdentity.has(incomingIdentityKey) &&
    gate.attemptsByIdentity.size >= ANALYSIS_GATE_MAX_IDENTITIES;
  if (!cleanupDue && !needsRoom) return;

  for (const [identityKey, attempts] of gate.attemptsByIdentity) {
    const activeAttempts = attempts.filter((timestamp) => now - timestamp < FIFTEEN_MINUTES);
    if (activeAttempts.length === 0) {
      gate.attemptsByIdentity.delete(identityKey);
    } else if (activeAttempts.length !== attempts.length) {
      gate.attemptsByIdentity.set(identityKey, activeAttempts);
    }
  }

  if (!gate.attemptsByIdentity.has(incomingIdentityKey)) {
    while (gate.attemptsByIdentity.size >= ANALYSIS_GATE_MAX_IDENTITIES) {
      const oldestIdentity = gate.attemptsByIdentity.keys().next().value;
      if (typeof oldestIdentity !== "string") break;
      gate.attemptsByIdentity.delete(oldestIdentity);
    }
  }

  gate.lastCleanupAt = now;
}

export function checkAnalysisRequestGate(
  gate: AnalysisRequestGate,
  input: { identityKey: string; now?: number }
): { ok: true } | { ok: false; error: AnalysisError } {
  const now = input.now ?? Date.now();
  cleanupAnalysisRequestGate(gate, now, input.identityKey);
  const attempts = gate.attemptsByIdentity.get(input.identityKey) ?? [];
  const activeAttempts = attempts.filter((timestamp) => now - timestamp < FIFTEEN_MINUTES);

  if (activeAttempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return failure("rate_limited", "Too many analysis requests. Please retry later.");
  }

  activeAttempts.push(now);
  gate.attemptsByIdentity.set(input.identityKey, activeAttempts);

  return { ok: true };
}

function labelFor(key: AnalysisScoreKey, language: AnalysisLanguage) {
  const labels: Record<AnalysisLanguage, Record<AnalysisScoreKey, string>> = {
    zh: {
      value_proposition: "价值表达",
      information_architecture: "信息架构",
      conversion_path: "行动路径",
      trust_signal: "可信证据",
      mobile_readability: "移动端可读性"
    },
    en: {
      value_proposition: "Value proposition",
      information_architecture: "Information architecture",
      conversion_path: "Conversion path",
      trust_signal: "Trust signal",
      mobile_readability: "Mobile readability"
    }
  };

  return labels[language][key];
}

function reasonFor(key: AnalysisScoreKey, language: AnalysisLanguage, brief: AnalysisBrief) {
  if (language === "en") {
    const reasons: Record<AnalysisScoreKey, string> = {
      value_proposition: `The page should tie the first-screen message more directly to ${brief.goal}.`,
      information_architecture: "The main sections need a clearer scan path from problem to proof.",
      conversion_path: "The primary action should stay visually dominant and match the stated goal.",
      trust_signal: "Proof points should appear earlier and connect to the audience risk.",
      mobile_readability: "The mobile reading order should prioritize outcome, proof, and one next action."
    };
    return reasons[key];
  }

  const reasons: Record<AnalysisScoreKey, string> = {
    value_proposition: `首屏信息需要更直接服务于「${brief.goal}」。`,
    information_architecture: "页面主区块需要形成从问题、方案到证据的清晰扫读路径。",
    conversion_path: "主行动需要保持视觉主导，并与业务目标一致。",
    trust_signal: "信任证据应更早出现，并回应目标受众的决策风险。",
    mobile_readability: "移动端顺序应优先呈现结果、证据和单一下一步。"
  };

  return reasons[key];
}

function buildAnalysisId(input: NormalizedAnalysisRequest, now: Date) {
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const digest = createHash("sha256")
    .update(`${input.input}|${input.brief.audience}|${input.brief.goal}|${input.brief.problem}`)
    .digest("hex")
    .slice(0, 8);

  return `ana_${datePart}_${digest}`;
}

function getHeaderValue(headers: AnalysisFetchResponse["headers"], name: string) {
  if (!headers) return "";
  const lowerName = name.toLowerCase();

  if (headers instanceof Headers) {
    return headers.get(name) ?? "";
  }

  if (headers instanceof Map) {
    return headers.get(name) ?? headers.get(lowerName) ?? "";
  }

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  return "";
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}

function compactText(value: string) {
  return decodeHtmlEntities(value)
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtmlForText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function detectAuthPage(status: number, html: string) {
  if (status === 401 || status === 403) {
    return true;
  }

  const normalized = html.toLowerCase();
  return (
    /<input\b[^>]*type=["']?password/i.test(html) ||
    normalized.includes("sign in") ||
    normalized.includes("log in") ||
    normalized.includes("login required") ||
    normalized.includes("authentication required")
  );
}

function isTimeoutLikeError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: unknown; message?: unknown; code?: unknown };
  const name = typeof candidate.name === "string" ? candidate.name.toLowerCase() : "";
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  const code = typeof candidate.code === "string" ? candidate.code.toLowerCase() : "";

  return (
    name === "aborterror" ||
    code.includes("timeout") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

async function resolveAndValidate(
  url: URL,
  resolver: AnalysisResolver
): Promise<{ ok: true } | { ok: false; error: AnalysisError }> {
  const safety = validateAnalysisUrlSafety(url);
  if (!safety.ok) {
    return safety;
  }

  let addresses: string[];
  try {
    addresses = await resolver(url.hostname);
  } catch {
    return failure("url_unreachable", "The URL host could not be resolved.");
  }

  if (addresses.length === 0) {
    return failure("url_unreachable", "The URL host did not resolve to an address.");
  }

  return validateAnalysisUrlSafety(url, { resolvedAddresses: addresses });
}

async function readCaptureResponseBody(
  response: AnalysisFetchResponse
): Promise<{ ok: true; value: string } | { ok: false; error: AnalysisError }> {
  const declaredLength = Number(getHeaderValue(response.headers, "content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CAPTURE_HTML_BYTES) {
    return failure("page_too_large", "The target page is larger than the D10 capture limit.");
  }

  if (!response.body) {
    const html = await response.text();
    if (Buffer.byteLength(html, "utf8") > MAX_CAPTURE_HTML_BYTES) {
      return failure("page_too_large", "The target page is larger than the D10 capture limit.");
    }
    return { ok: true, value: html };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let html = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      byteLength += value.byteLength;
      if (byteLength > MAX_CAPTURE_HTML_BYTES) {
        try {
          await reader.cancel("capture body exceeded byte limit");
        } catch {
          // The size failure remains authoritative even if cancellation races an abort.
        }
        return failure("page_too_large", "The target page is larger than the D10 capture limit.");
      }

      html += decoder.decode(value, { stream: true });
    }

    html += decoder.decode();
    return { ok: true, value: html };
  } finally {
    reader.releaseLock();
  }
}

export function extractPageSummary(
  html: string,
  finalUrl: string
): { ok: true; value: PageCaptureSummary } | { ok: false; error: AnalysisError } {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = compactText(titleMatch?.[1] ?? new URL(finalUrl).hostname);
  const text = compactText(stripHtmlForText(html));

  if (detectAuthPage(200, html)) {
    return failure("auth_required_page", "The target page appears to require authentication.");
  }

  if (text.length < MIN_CAPTURE_TEXT_LENGTH) {
    return failure("insufficient_page_content", "The target page does not expose enough readable content.");
  }

  return {
    ok: true,
    value: {
      finalUrl,
      title,
      text
    }
  };
}

export function createDefaultAnalysisFetcher(): AnalysisFetcher {
  return async (url, init) => fetch(url, {
    method: "GET",
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent": "website-ai-page-analysis-capture/1.0",
      ...init.headers
    },
    redirect: init.redirect,
    signal: init.signal
  });
}

export async function resolveAnalysisHostname(hostname: string) {
  const addresses = await lookup(hostname, {
    all: true,
    verbatim: false
  });

  return addresses.map((address) => address.address);
}

export async function capturePageForAnalysis(
  input: string,
  options: {
    resolver?: AnalysisResolver;
    fetcher?: AnalysisFetcher;
    maxRedirects?: number;
    timeoutMs?: number;
  } = {}
): Promise<{ ok: true; value: PageCaptureSummary } | { ok: false; error: AnalysisError }> {
  const resolver = options.resolver ?? resolveAnalysisHostname;
  const fetcher = options.fetcher ?? createDefaultAnalysisFetcher();
  const maxRedirects = options.maxRedirects ?? MAX_CAPTURE_REDIRECTS;
  let currentUrl: URL;

  try {
    currentUrl = new URL(input);
  } catch {
    return failure("invalid_url", "URL must be valid.");
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    options.timeoutMs ?? ANALYSIS_CAPTURE_TIMEOUT_MS
  );

  try {
    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      const resolved = await resolveAndValidate(currentUrl, resolver);
      if (!resolved.ok) {
        return resolved;
      }

      let response: AnalysisFetchResponse;
      try {
        response = await fetcher(currentUrl, {
          headers: {
            "accept": "text/html,application/xhtml+xml",
            "user-agent": "website-ai-page-analysis-capture/1.0"
          },
          redirect: "manual",
          signal: abortController.signal
        });
      } catch (error) {
        if (isTimeoutLikeError(error)) {
          return failure("capture_timeout", "The target page capture timed out.");
        }
        return failure("url_unreachable", "The target page could not be reached.");
      }

      if (response.status >= 300 && response.status < 400) {
        const location = getHeaderValue(response.headers, "location");
        if (!location) {
          return failure("url_unreachable", "The target page redirected without a location.");
        }

        if (redirectCount >= maxRedirects) {
          return failure("url_unreachable", "The target page redirected too many times.");
        }

        try {
          currentUrl = new URL(location, currentUrl);
        } catch {
          return failure("invalid_url", "Redirect target must be a valid URL.");
        }
        continue;
      }

      let bodyResult: Awaited<ReturnType<typeof readCaptureResponseBody>>;
      try {
        bodyResult = await readCaptureResponseBody(response);
      } catch (error) {
        if (isTimeoutLikeError(error)) {
          return failure("capture_timeout", "The target page capture timed out.");
        }
        return failure("url_unreachable", "The target page body could not be read.");
      }

      if (!bodyResult.ok) {
        return bodyResult;
      }

      if (detectAuthPage(response.status, bodyResult.value)) {
        return failure("auth_required_page", "The target page appears to require authentication.");
      }

      return extractPageSummary(bodyResult.value, currentUrl.toString());
    }

    return failure("url_unreachable", "The target page redirected too many times.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createMockPageAnalysis(
  input: NormalizedAnalysisRequest,
  options: { now?: Date; capturedTitle?: string } = {}
): PageAnalysisResult {
  const now = options.now ?? new Date();
  const hostname = new URL(input.input).hostname;
  const language = input.language;
  const scores: AnalysisScore[] = ANALYSIS_SCORE_KEYS.map((key, index) => ({
    key,
    label: labelFor(key, language),
    score: [68, 63, 59, 61, 66][index],
    reason: reasonFor(key, language, input.brief)
  }));

  const isEnglish = language === "en";

  return {
    analysis_id: buildAnalysisId(input, now),
    status: "succeeded",
    needs_review: false,
    confidence: 0.82,
    source: {
      url: input.input,
      title: options.capturedTitle ?? (isEnglish ? `Safe mock capture for ${hostname}` : `${hostname} 的安全 Mock 捕获`),
      captured_at: now.toISOString()
    },
    scores,
    issues: isEnglish
      ? [
          {
            severity: "high",
            evidence: `The brief says the goal is "${input.brief.goal}", but the current problem points to unclear first-screen messaging.`,
            impact: "Visitors may not understand relevance before deciding whether to continue.",
            recommendation: "Rewrite the hero around audience, outcome, and one primary CTA."
          },
          {
            severity: "medium",
            evidence: `The audience "${input.brief.audience}" needs proof before a conversion decision.`,
            impact: "High-intent visitors may hesitate if trust evidence appears too late.",
            recommendation: "Move proof, risk reducers, and one concrete result closer to the first screen."
          }
        ]
      : [
          {
            severity: "high",
            evidence: `Brief 目标是「${input.brief.goal}」，但当前问题指向首屏表达不清。`,
            impact: "访问者可能在继续浏览前无法判断页面是否与自己相关。",
            recommendation: "围绕受众、结果和单一主 CTA 重写首屏。"
          },
          {
            severity: "medium",
            evidence: `目标受众「${input.brief.audience}」在转化前需要更早看到证据。`,
            impact: "如果信任证据出现过晚，高意向访问者会延迟或放弃行动。",
            recommendation: "把证明、风险消除和一个具体结果前置到首屏附近。"
          }
        ],
    recommendations: isEnglish
      ? [
          {
            module: "Hero",
            action: "Rewrite the headline and subcopy around audience, outcome, and time-to-value.",
            priority: "P0",
            expected_outcome: "Reduce comprehension cost and make the next action obvious."
          },
          {
            module: "Trust proof",
            action: "Move the strongest proof point directly below the hero.",
            priority: "P1",
            expected_outcome: "Give high-intent visitors enough confidence to continue."
          }
        ]
      : [
          {
            module: "Hero 首屏",
            action: "围绕受众、结果和价值到达时间重写标题与副标题。",
            priority: "P0",
            expected_outcome: "降低理解成本，让下一步行动更明确。"
          },
          {
            module: "信任证据",
            action: "把最强证据点移动到首屏下方。",
            priority: "P1",
            expected_outcome: "让高意向访问者在继续前获得足够信心。"
          }
        ],
    backlog: isEnglish
      ? [
          {
            task: "Rewrite hero headline, subcopy, and primary CTA",
            owner: "product/design",
            priority: "P0",
            eta: "0.5d"
          },
          {
            task: "Place one proof block near the first-screen CTA",
            owner: "design/frontend",
            priority: "P1",
            eta: "1d"
          }
        ]
      : [
          {
            task: "重写首屏标题、副标题和主 CTA",
            owner: "产品/设计",
            priority: "P0",
            eta: "0.5d"
          },
          {
            task: "在首屏 CTA 附近放置一个证据模块",
            owner: "设计/前端",
            priority: "P1",
            eta: "1d"
          }
        ],
    safe_mock_api: true
  };
}

function statusForError(code: AnalysisErrorCode) {
  if (code === "rate_limited") return 429;
  if (code === "page_too_large") return 413;
  if (code === "capture_timeout") return 504;
  if (code === "url_unreachable" || code === "auth_required_page" || code === "insufficient_page_content") return 422;
  return 400;
}

export async function analyzePageRequest(
  payload: unknown,
  options: {
    now?: Date;
    identityKey?: string;
    gate?: AnalysisRequestGate;
    resolvedAddresses?: string[];
    resolver?: AnalysisResolver;
    fetcher?: AnalysisFetcher;
    capture?: boolean;
  } = {}
): Promise<
  | { ok: true; httpStatus: 200; value: PageAnalysisResult }
  | { ok: false; httpStatus: number; error: AnalysisError }
> {
  const validation = validateAnalysisRequest(payload);
  if (!validation.ok) {
    return {
      ok: false,
      httpStatus: statusForError(validation.error.code),
      error: validation.error
    };
  }

  const safety = validateAnalysisUrlSafety(new URL(validation.value.input), {
    resolvedAddresses: options.resolvedAddresses
  });
  if (!safety.ok) {
    return {
      ok: false,
      httpStatus: 400,
      error: safety.error
    };
  }

  const gateResult = checkAnalysisRequestGate(options.gate ?? analysisRequestGate, {
    identityKey: options.identityKey ?? "anonymous",
    now: options.now?.getTime()
  });
  if (!gateResult.ok) {
    return {
      ok: false,
      httpStatus: 429,
      error: gateResult.error
    };
  }

  let capturedTitle: string | undefined;
  if (options.capture !== false) {
    const capture = await capturePageForAnalysis(validation.value.input, {
      resolver: options.resolver,
      fetcher: options.fetcher
    });

    if (!capture.ok) {
      return {
        ok: false,
        httpStatus: statusForError(capture.error.code),
        error: capture.error
      };
    }

    capturedTitle = capture.value.title;
  }

  return {
    ok: true,
    httpStatus: 200,
    value: createMockPageAnalysis(validation.value, {
      now: options.now,
      capturedTitle
    })
  };
}
