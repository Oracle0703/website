import { createHash, randomUUID } from "node:crypto";
import { mkdir, appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const CONTACT_FORM_ERROR_CODES = [
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
] as const;

export type ContactFormErrorCode = (typeof CONTACT_FORM_ERROR_CODES)[number];

export type ContactFormError = {
  code: ContactFormErrorCode;
  message: string;
};

export type ContactFormInput = {
  name?: unknown;
  contact?: unknown;
  project_goal?: unknown;
  timeline?: unknown;
  budget_range?: unknown;
  links?: unknown;
  honeypot?: unknown;
};

export type NormalizedContactFormInput = {
  name: string;
  contact: string;
  projectGoal: string;
  timeline: string;
  budgetRange: string;
  links: string[];
};

export type ContactSubmissionGate = {
  attemptsByIdentity: Map<string, number[]>;
  duplicateByContactGoal: Map<string, number>;
  lastCleanupAt: number;
};

type GateInput = {
  contact: string;
  projectGoal: string;
  identityKey: string;
  now?: number;
};

export type ContactSubmission = NormalizedContactFormInput & {
  submissionId: string;
  receivedAt: string;
  ipHash: string;
  userAgent: string;
};

export type ContactStorageGuardResult =
  | { ok: true; directory: string }
  | { ok: false; error: { code: "unsafe_storage_directory"; message: string } };

export type ContactCleanupResult = {
  filePath: string;
  dryRun: boolean;
  retentionDays: number;
  cutoff: string;
  totalLines: number;
  keptCount: number;
  expiredCount: number;
  malformedCount: number;
  missingFile: boolean;
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 3;
export const CONTACT_GATE_MAX_ENTRIES = 5_000;
export const CONTACT_RETENTION_DAYS = 90;
export const CONTACT_NOTIFICATION_TIMEOUT_MS = 5_000;
const PLACEHOLDER_CONTACT_PATTERN = /(^|\b)(hello@example\.com|test@example\.com|example\.com|example\.org|example\.net)(\b|$)/i;
const UNSAFE_CONTACT_STORAGE_SEGMENTS = [
  ["apps", "website", "public"],
  ["apps", "website", ".next"],
  ["apps", "website", "app"],
  ["apps", "website", "components"],
  ["apps", "website", "lib"]
];

function error(code: ContactFormErrorCode, message: string): { ok: false; error: ContactFormError } {
  return { ok: false, error: { code, message } };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getLinks(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => getString(item)).filter(Boolean);
  }

  const asString = getString(value);
  if (!asString) return [];

  return asString
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isLowQualityProjectGoal(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const compact = normalized.replace(/[^a-zA-Z0-9\u3400-\u9fff]/g, "");
  const uniqueCharacters = new Set(compact.toLowerCase()).size;

  return normalized.length < 20 || uniqueCharacters < 8 || /(.)\1{9,}/.test(compact);
}

function normalizeGoalFingerprint(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
    .trim()
    .slice(0, 120);
}

export function hashContactValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getContactIdentityKey(ipAddress: string, contact: string) {
  return hashContactValue(`${ipAddress.trim().toLowerCase()}|${contact.trim().toLowerCase()}`);
}

export function validateContactFormSubmission(input: ContactFormInput):
  | { ok: true; value: NormalizedContactFormInput }
  | { ok: false; error: ContactFormError } {
  const honeypot = getString(input.honeypot);
  if (honeypot) {
    return error("low_quality_input", "The request could not be accepted.");
  }

  const name = getString(input.name);
  const contact = getString(input.contact);
  const projectGoal = getString(input.project_goal);
  const timeline = getString(input.timeline).slice(0, 120);
  const budgetRange = getString(input.budget_range).slice(0, 120);
  const links = getLinks(input.links);

  if (!name || !contact || !projectGoal) {
    return error("missing_required_field", "Name, reply channel, and project goal are required.");
  }

  if (name.length < 2 || name.length > 60 || contact.length > 160) {
    return error("missing_required_field", "Name or reply channel is outside the accepted length.");
  }

  if (PLACEHOLDER_CONTACT_PATTERN.test(contact)) {
    return error("invalid_contact", "Use a real reply channel instead of a placeholder address.");
  }

  if (isLowQualityProjectGoal(projectGoal)) {
    return error("low_quality_input", "Add more context about the goal, current state, and expected outcome.");
  }

  if (links.length > 3) {
    return error("invalid_link", "At most three public links are supported.");
  }

  for (const link of links) {
    try {
      const url = new URL(link);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return error("invalid_link", "Only HTTP and HTTPS links are supported.");
      }
    } catch {
      return error("invalid_link", "Links must be valid public URLs.");
    }
  }

  return {
    ok: true,
    value: {
      name,
      contact,
      projectGoal,
      timeline,
      budgetRange,
      links
    }
  };
}

export function createContactSubmissionGate(): ContactSubmissionGate {
  return {
    attemptsByIdentity: new Map(),
    duplicateByContactGoal: new Map(),
    lastCleanupAt: 0
  };
}

export const contactSubmissionGate = createContactSubmissionGate();

function makeRoomInGateMap<TKey, TValue>(
  map: Map<TKey, TValue>,
  maximumSize: number,
  incomingKey: TKey
) {
  if (map.has(incomingKey)) return;

  while (map.size >= maximumSize) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) break;
    map.delete(oldestKey);
  }
}

function cleanupContactSubmissionGate(
  gate: ContactSubmissionGate,
  now: number,
  incomingIdentityKey: string,
  incomingDuplicateKey: string
) {
  const cleanupDue = now - gate.lastCleanupAt >= FIFTEEN_MINUTES;
  const needsRoom =
    (!gate.attemptsByIdentity.has(incomingIdentityKey) &&
      gate.attemptsByIdentity.size >= CONTACT_GATE_MAX_ENTRIES) ||
    (!gate.duplicateByContactGoal.has(incomingDuplicateKey) &&
      gate.duplicateByContactGoal.size >= CONTACT_GATE_MAX_ENTRIES);
  if (!cleanupDue && !needsRoom) return;

  for (const [identityKey, attempts] of gate.attemptsByIdentity) {
    const activeAttempts = attempts.filter((timestamp) => now - timestamp < FIFTEEN_MINUTES);
    if (activeAttempts.length === 0) {
      gate.attemptsByIdentity.delete(identityKey);
    } else if (activeAttempts.length !== attempts.length) {
      gate.attemptsByIdentity.set(identityKey, activeAttempts);
    }
  }

  for (const [duplicateKey, timestamp] of gate.duplicateByContactGoal) {
    if (now - timestamp >= ONE_DAY) {
      gate.duplicateByContactGoal.delete(duplicateKey);
    }
  }

  makeRoomInGateMap(
    gate.attemptsByIdentity,
    CONTACT_GATE_MAX_ENTRIES,
    incomingIdentityKey
  );
  makeRoomInGateMap(
    gate.duplicateByContactGoal,
    CONTACT_GATE_MAX_ENTRIES,
    incomingDuplicateKey
  );
  gate.lastCleanupAt = now;
}

export function checkContactSubmissionGate(
  gate: ContactSubmissionGate,
  input: GateInput
): { ok: true } | { ok: false; error: ContactFormError } {
  const now = input.now ?? Date.now();
  const duplicateKey = hashContactValue(
    `${input.contact.trim().toLowerCase()}|${normalizeGoalFingerprint(input.projectGoal)}`
  );
  cleanupContactSubmissionGate(gate, now, input.identityKey, duplicateKey);
  const attempts = gate.attemptsByIdentity.get(input.identityKey) ?? [];
  const activeAttempts = attempts.filter((timestamp) => now - timestamp < FIFTEEN_MINUTES);

  if (activeAttempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return error("rate_limited", "Too many requests. Please retry later.");
  }

  const previousDuplicate = gate.duplicateByContactGoal.get(duplicateKey);

  if (previousDuplicate && now - previousDuplicate < ONE_DAY) {
    activeAttempts.push(now);
    gate.attemptsByIdentity.set(input.identityKey, activeAttempts);
    return error("duplicate_submit", "A similar request was already received.");
  }

  activeAttempts.push(now);
  gate.attemptsByIdentity.set(input.identityKey, activeAttempts);
  gate.duplicateByContactGoal.set(duplicateKey, now);

  return { ok: true };
}

export function createContactSubmission(
  input: NormalizedContactFormInput,
  metadata: { ipAddress: string; userAgent?: string }
): ContactSubmission {
  return {
    ...input,
    submissionId: `contact_${new Date().toISOString().slice(0, 10).replaceAll("-", "")}_${randomUUID().slice(0, 8)}`,
    receivedAt: new Date().toISOString(),
    ipHash: hashContactValue(metadata.ipAddress),
    userAgent: metadata.userAgent?.slice(0, 240) ?? ""
  };
}

export function getContactSubmissionsDir() {
  return process.env.CONTACT_SUBMISSIONS_DIR ?? path.join(process.cwd(), ".data", "website-contact");
}

function isPathInside(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

export function validateContactSubmissionsDirectory(
  directory = getContactSubmissionsDir(),
  root = process.cwd()
): ContactStorageGuardResult {
  const resolvedDirectory = path.resolve(directory);
  const resolvedRoot = path.resolve(root);

  for (const segment of UNSAFE_CONTACT_STORAGE_SEGMENTS) {
    const unsafeDirectory = path.join(resolvedRoot, ...segment);
    if (isPathInside(unsafeDirectory, resolvedDirectory)) {
      return {
        ok: false,
        error: {
          code: "unsafe_storage_directory",
          message: `Contact submissions directory must not be inside ${path.relative(resolvedRoot, unsafeDirectory)}.`
        }
      };
    }
  }

  return {
    ok: true,
    directory: resolvedDirectory
  };
}

export async function appendContactSubmission(submission: ContactSubmission) {
  const directory = getContactSubmissionsDir();
  const storageGuard = validateContactSubmissionsDirectory(directory);
  if (!storageGuard.ok) {
    throw new Error(storageGuard.error.code);
  }

  await mkdir(directory, { recursive: true });
  await appendFile(path.join(directory, "submissions.jsonl"), `${JSON.stringify(submission)}\n`, "utf8");
}

export async function cleanupContactSubmissionsFile({
  filePath = path.join(getContactSubmissionsDir(), "submissions.jsonl"),
  now = new Date(),
  retentionDays = CONTACT_RETENTION_DAYS,
  dryRun = true
}: {
  filePath?: string;
  now?: Date;
  retentionDays?: number;
  dryRun?: boolean;
} = {}): Promise<ContactCleanupResult> {
  const cutoffDate = new Date(now.getTime() - retentionDays * ONE_DAY);

  let source = "";
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        filePath,
        dryRun,
        retentionDays,
        cutoff: cutoffDate.toISOString(),
        totalLines: 0,
        keptCount: 0,
        expiredCount: 0,
        malformedCount: 0,
        missingFile: true
      };
    }

    throw error;
  }

  const lines = source.split(/\r?\n/).filter((line) => line.length > 0);
  const keptLines: string[] = [];
  let keptCount = 0;
  let expiredCount = 0;
  let malformedCount = 0;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as { receivedAt?: unknown };
      const receivedAt = typeof parsed.receivedAt === "string" ? new Date(parsed.receivedAt) : null;

      if (!receivedAt || Number.isNaN(receivedAt.getTime())) {
        malformedCount += 1;
        keptLines.push(line);
        continue;
      }

      if (receivedAt.getTime() < cutoffDate.getTime()) {
        expiredCount += 1;
        continue;
      }

      keptCount += 1;
      keptLines.push(line);
    } catch {
      malformedCount += 1;
      keptLines.push(line);
    }
  }

  if (!dryRun) {
    const nextSource = keptLines.length > 0 ? `${keptLines.join("\n")}\n` : "";
    await writeFile(filePath, nextSource, "utf8");
  }

  return {
    filePath,
    dryRun,
    retentionDays,
    cutoff: cutoffDate.toISOString(),
    totalLines: lines.length,
    keptCount,
    expiredCount,
    malformedCount,
    missingFile: false
  };
}

export async function sendContactNotification(
  submission: ContactSubmission,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {}
) {
  const webhookUrl = process.env.CONTACT_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: true as const, skipped: true as const };
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    options.timeoutMs ?? CONTACT_NOTIFICATION_TIMEOUT_MS
  );

  try {
    const response = await (options.fetcher ?? fetch)(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        type: "website.contact.received",
        submissionId: submission.submissionId,
        receivedAt: submission.receivedAt,
        name: submission.name,
        contact: submission.contact,
        projectGoal: submission.projectGoal,
        timeline: submission.timeline,
        budgetRange: submission.budgetRange,
        links: submission.links
      })
    });

    if (!response.ok) {
      return { ok: false as const, error: "notification_failure" as const };
    }

    return { ok: true as const, skipped: false as const };
  } catch {
    return { ok: false as const, error: "notification_failure" as const };
  } finally {
    clearTimeout(timeoutId);
  }
}
