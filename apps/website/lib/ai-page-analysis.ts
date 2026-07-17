import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP, type LookupFunction } from "node:net";
import { Readable } from "node:stream";

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
  | "server_busy"
  | "submit_failure"
  | "request_too_large"
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
    generated_at: string;
    capture: {
      performed: boolean;
      final_url?: string;
      captured_at?: string;
    };
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

export type AnalysisConcurrencyGate = {
  active: number;
  max: number;
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
    resolvedAddress: string;
  }
) => Promise<AnalysisFetchResponse>;

export type AnalysisResolver = (hostname: string) => Promise<string[]>;

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
export const ANALYSIS_GATE_MAX_IDENTITIES = 5_000;
export const ANALYSIS_MAX_CONCURRENCY = 2;
const MAX_URL_LENGTH = 2048;
const MAX_CAPTURE_REDIRECTS = 3;
const MAX_CAPTURE_HTML_BYTES = 2 * 1024 * 1024;
const MAX_CAPTURE_TITLE_LENGTH = 240;
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

const CLOUD_METADATA_ADDRESSES = new Set([
  // Azure WireServer/platform virtual address. Standard metadata endpoints are
  // link-local and already covered by the ranges below.
  "168.63.129.16"
]);

const IPV4_DENY_RANGES: ReadonlyArray<readonly [readonly number[], number]> = [
  [[0, 0, 0, 0], 8],
  [[10, 0, 0, 0], 8],
  [[100, 64, 0, 0], 10],
  [[127, 0, 0, 0], 8],
  [[169, 254, 0, 0], 16],
  [[172, 16, 0, 0], 12],
  [[192, 0, 0, 0], 24],
  [[192, 0, 2, 0], 24],
  [[192, 88, 99, 0], 24],
  [[192, 168, 0, 0], 16],
  [[198, 18, 0, 0], 15],
  [[198, 51, 100, 0], 24],
  [[203, 0, 113, 0], 24],
  [[224, 0, 0, 0], 4],
  [[240, 0, 0, 0], 4]
];

const IPV6_DENY_RANGES: ReadonlyArray<readonly [readonly number[], number]> = [
  // IETF protocol assignments, documentation, transition mechanisms, ULA,
  // link-local, site-local, and multicast are not valid public capture targets.
  [[0x20, 0x01, 0x00], 23],
  [[0x20, 0x01, 0x0d, 0xb8], 32],
  [[0x20, 0x02], 16],
  [[0x3f, 0xff], 20],
  [[0xfc], 7],
  [[0xfe, 0x80], 10],
  [[0xfe, 0xc0], 10],
  [[0xff], 8]
];

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
  return hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.+$/g, "")
    .toLowerCase();
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

function matchesPrefix(address: readonly number[], network: readonly number[], prefixLength: number) {
  const wholeBytes = Math.floor(prefixLength / 8);
  const remainingBits = prefixLength % 8;

  for (let index = 0; index < wholeBytes; index += 1) {
    if (address[index] !== network[index]) return false;
  }

  if (remainingBits === 0) return true;
  const mask = 0xff << (8 - remainingBits);
  return (address[wholeBytes] & mask) === ((network[wholeBytes] ?? 0) & mask);
}

function parseIpv6(address: string): number[] | null {
  let normalized = normalizeHostname(address);
  if (normalized.includes("%") || isIP(normalized) !== 6) return null;

  const ipv4Match = normalized.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (ipv4Match) {
    const ipv4 = parseIpv4(ipv4Match[1]);
    if (!ipv4) return null;
    const replacement = `${((ipv4[0] << 8) | ipv4[1]).toString(16)}:${((ipv4[2] << 8) | ipv4[3]).toString(16)}`;
    normalized = `${normalized.slice(0, -ipv4Match[1].length)}${replacement}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null;

  const groups = [...head, ...Array.from({ length: missing }, () => "0"), ...tail];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))) return null;

  return groups.flatMap((group) => {
    const value = Number.parseInt(group, 16);
    return [value >> 8, value & 0xff];
  });
}

function isPublicIpv4(address: string) {
  const octets = parseIpv4(address);
  if (!octets) return false;
  if (CLOUD_METADATA_ADDRESSES.has(address)) return false;

  return !IPV4_DENY_RANGES.some(([network, prefix]) => matchesPrefix(octets, network, prefix));
}

function isPublicIpv6(address: string) {
  const bytes = parseIpv6(address);
  if (!bytes) return false;

  const ipv4Mapped = matchesPrefix(bytes, Array(10).fill(0).concat([0xff, 0xff]), 96);
  const ipv4Compatible = matchesPrefix(bytes, Array(12).fill(0), 96);
  if (ipv4Mapped || ipv4Compatible) {
    return isPublicIpv4(bytes.slice(12).join("."));
  }

  // NAT64 and other translation prefixes can obscure the actual IPv4 target.
  if (matchesPrefix(bytes, [0x00, 0x64, 0xff, 0x9b, 0, 0, 0, 0, 0, 0, 0, 0], 96)) return false;
  if (matchesPrefix(bytes, [0x00, 0x64, 0xff, 0x9b, 0x00, 0x01], 48)) return false;

  // Be conservative: only globally routable 2000::/3 space is eligible.
  if (!matchesPrefix(bytes, [0x20], 3)) return false;
  return !IPV6_DENY_RANGES.some(([network, prefix]) => matchesPrefix(bytes, network, prefix));
}

export function isPublicAnalysisAddress(address: string) {
  const normalized = normalizeHostname(address);
  const version = isIP(normalized);

  if (version === 4) return isPublicIpv4(normalized);
  if (version === 6) return isPublicIpv6(normalized);
  return false;
}

function isUnsafeHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);
  const version = isIP(normalized);

  if (!normalized) return true;
  if (version !== 0) return !isPublicAnalysisAddress(normalized);
  if (normalized === "localhost" || normalized.endsWith(".localhost")) return true;
  if (normalized.endsWith(".local") || normalized.endsWith(".internal") || normalized.endsWith(".home.arpa")) return true;
  if (CLOUD_METADATA_HOSTS.has(normalized)) return true;

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

  if (url.port) {
    return failure("invalid_url", "Only the standard HTTP and HTTPS ports are supported.");
  }

  if (isUnsafeHostname(url.hostname)) {
    return failure("invalid_url", "Private, local, or metadata URLs are not accepted.");
  }

  for (const address of options.resolvedAddresses ?? []) {
    if (!isPublicAnalysisAddress(address)) {
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

export function createAnalysisConcurrencyGate(max = ANALYSIS_MAX_CONCURRENCY): AnalysisConcurrencyGate {
  return {
    active: 0,
    max: Math.max(1, Math.floor(max))
  };
}

const concurrencyGateKey = Symbol.for("meaningful-ink.ai-page-analysis.concurrency-gate");
const analysisGlobal = globalThis as typeof globalThis & {
  [concurrencyGateKey]?: AnalysisConcurrencyGate;
};

export const analysisConcurrencyGate =
  analysisGlobal[concurrencyGateKey] ?? createAnalysisConcurrencyGate();
analysisGlobal[concurrencyGateKey] = analysisConcurrencyGate;

export function tryAcquireAnalysisSlot(gate: AnalysisConcurrencyGate): (() => void) | null {
  if (gate.active >= gate.max) return null;

  gate.active += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    gate.active = Math.max(0, gate.active - 1);
  };
}

export function isAnalysisPublicCaptureEnabled(
  environment: Readonly<Record<string, string | undefined>> = process.env
) {
  return environment.AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE === "true";
}

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

function rejectOnAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(new DOMException("Capture aborted", "AbortError"));
  }

  return new Promise<T>((resolve, reject) => {
    const handleAbort = () => reject(new DOMException("Capture aborted", "AbortError"));
    signal.addEventListener("abort", handleAbort, { once: true });
    operation.then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", handleAbort);
    });
  });
}

async function resolveAndValidate(
  url: URL,
  resolver: AnalysisResolver,
  signal: AbortSignal
): Promise<{ ok: true; value: { addresses: string[] } } | { ok: false; error: AnalysisError }> {
  const safety = validateAnalysisUrlSafety(url);
  if (!safety.ok) {
    return safety;
  }

  let addresses: string[];
  try {
    addresses = await rejectOnAbort(resolver(url.hostname), signal);
  } catch {
    if (signal.aborted) {
      return failure("capture_timeout", "The target page capture timed out during DNS resolution.");
    }
    return failure("url_unreachable", "The URL host could not be resolved.");
  }

  if (addresses.length === 0) {
    return failure("url_unreachable", "The URL host did not resolve to an address.");
  }

  const resolvedSafety = validateAnalysisUrlSafety(url, { resolvedAddresses: addresses });
  if (!resolvedSafety.ok) {
    return resolvedSafety;
  }

  // Only connect to IPv4. A globally scoped IPv6 address can still be an
  // operator-specific translation prefix whose embedded IPv4 target cannot be
  // proven from syntax alone. Dual-stack hosts continue through their A record.
  const ipv4Addresses = addresses.filter(
    (address) => isIP(normalizeHostname(address)) === 4
  );
  if (ipv4Addresses.length === 0) {
    return failure("invalid_url", "Public capture requires a directly routable IPv4 address.");
  }

  return {
    ok: true,
    value: {
      addresses: ipv4Addresses
    }
  };
}

async function readCaptureResponseBody(
  response: AnalysisFetchResponse,
  signal: AbortSignal
): Promise<{ ok: true; value: string } | { ok: false; error: AnalysisError }> {
  const declaredLength = Number(getHeaderValue(response.headers, "content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CAPTURE_HTML_BYTES) {
    if (response.body) {
      void response.body
        .cancel("capture body exceeded declared byte limit")
        .catch(() => undefined);
    }
    return failure("page_too_large", "The target page is larger than the D10 capture limit.");
  }

  if (!response.body) {
    const html = await rejectOnAbort(response.text(), signal);
    if (Buffer.byteLength(html, "utf8") > MAX_CAPTURE_HTML_BYTES) {
      return failure("page_too_large", "The target page is larger than the D10 capture limit.");
    }
    return { ok: true, value: html };
  }

  const reader = response.body.getReader();
  const cancelOnAbort = () => {
    void reader.cancel("capture timed out").catch(() => undefined);
  };
  signal.addEventListener("abort", cancelOnAbort, { once: true });
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

    if (signal.aborted) {
      throw new DOMException("Capture aborted", "AbortError");
    }
    html += decoder.decode();
    return { ok: true, value: html };
  } finally {
    signal.removeEventListener("abort", cancelOnAbort);
    reader.releaseLock();
  }
}

export function extractPageSummary(
  html: string,
  finalUrl: string
): { ok: true; value: PageCaptureSummary } | { ok: false; error: AnalysisError } {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = compactText(titleMatch?.[1] ?? new URL(finalUrl).hostname)
    .slice(0, MAX_CAPTURE_TITLE_LENGTH);
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

export function createPinnedAnalysisLookup(address: string): LookupFunction {
  const family = isIP(address);
  if (family !== 4 && family !== 6) {
    throw new Error("A pinned capture address must be a valid IP address.");
  }

  return (_hostname, options, callback) => {
    if (options.all) {
      callback(null, [{ address, family }]);
      return;
    }

    callback(null, address, family);
  };
}

export function createDefaultAnalysisFetcher(): AnalysisFetcher {
  return (url, init) => new Promise((resolve, reject) => {
    if (
      isIP(normalizeHostname(init.resolvedAddress)) !== 4 ||
      !isPublicAnalysisAddress(init.resolvedAddress)
    ) {
      reject(new Error("Refusing to connect to an unvalidated capture address."));
      return;
    }

    const requester = url.protocol === "https:" ? httpsRequest : httpRequest;
    const request = requester(url, {
      method: "GET",
      headers: {
        "accept": "text/html,application/xhtml+xml",
        "accept-encoding": "identity",
        "user-agent": "website-ai-page-analysis-capture/2.0",
        ...init.headers
      },
      lookup: createPinnedAnalysisLookup(init.resolvedAddress),
      agent: false,
      signal: init.signal,
      ...(url.protocol === "https:" && isIP(normalizeHostname(url.hostname)) === 0
        ? { servername: normalizeHostname(url.hostname) }
        : {})
    }, (response) => {
      const headers = new Headers();
      for (const [name, value] of Object.entries(response.headers)) {
        if (Array.isArray(value)) {
          for (const item of value) headers.append(name, item);
        } else if (typeof value === "string") {
          headers.set(name, value);
        }
      }

      resolve({
        status: response.statusCode ?? 0,
        headers,
        body: Readable.toWeb(response) as ReadableStream<Uint8Array>,
        text: async () => {
          const chunks: Buffer[] = [];
          for await (const chunk of response) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          return Buffer.concat(chunks).toString("utf8");
        }
      });
    });

    request.once("error", reject);
    request.end();
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
      const resolved = await resolveAndValidate(currentUrl, resolver, abortController.signal);
      if (!resolved.ok) {
        return resolved;
      }

      let response: AnalysisFetchResponse;
      try {
        response = await rejectOnAbort(fetcher(currentUrl, {
          headers: {
            "accept": "text/html,application/xhtml+xml",
            "accept-encoding": "identity",
            "user-agent": "website-ai-page-analysis-capture/2.0"
          },
          redirect: "manual",
          signal: abortController.signal,
          resolvedAddress: resolved.value.addresses[0]
        }), abortController.signal);
      } catch (error) {
        if (isTimeoutLikeError(error)) {
          return failure("capture_timeout", "The target page capture timed out.");
        }
        return failure("url_unreachable", "The target page could not be reached.");
      }

      if (response.status >= 300 && response.status < 400) {
        const location = getHeaderValue(response.headers, "location");
        try {
          await response.body?.cancel("redirect response is not consumed");
        } catch {
          // Redirect validation remains authoritative if stream cancellation races a close.
        }
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
        bodyResult = await readCaptureResponseBody(response, abortController.signal);
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
  options: {
    now?: Date;
    capture?: Pick<PageCaptureSummary, "finalUrl" | "title">;
  } = {}
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
      title: options.capture?.title ?? (isEnglish ? `Safe Mock for ${hostname}` : `${hostname} 的 Safe Mock 演示`),
      generated_at: now.toISOString(),
      capture: options.capture
        ? {
            performed: true,
            final_url: options.capture.finalUrl,
            captured_at: now.toISOString()
          }
        : {
            performed: false
          }
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
  if (code === "server_busy") return 503;
  if (code === "page_too_large" || code === "request_too_large") return 413;
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
    concurrencyGate?: AnalysisConcurrencyGate;
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

  const releaseSlot = tryAcquireAnalysisSlot(options.concurrencyGate ?? analysisConcurrencyGate);
  if (!releaseSlot) {
    return {
      ok: false,
      httpStatus: 503,
      error: {
        code: "server_busy",
        message: "The analysis service is at its two-request concurrency limit. Please retry shortly."
      }
    };
  }

  try {
    let captureSummary: PageCaptureSummary | undefined;
    // Public URL capture is opt-in. Callers must pass capture: true explicitly;
    // the route only does so when the server-side feature flag is exactly "true".
    if (options.capture === true) {
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

      captureSummary = capture.value;
    }

    return {
      ok: true,
      httpStatus: 200,
      value: createMockPageAnalysis(validation.value, {
        now: options.now,
        capture: captureSummary
      })
    };
  } finally {
    releaseSlot();
  }
}
