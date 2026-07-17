import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  access,
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  unlink
} from "node:fs/promises";
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

type ContactGateAttempt = {
  reservationId: string;
  timestamp: number;
};

type ContactDuplicateReservation = {
  reservationId: string;
  timestamp: number;
};

export type ContactSubmissionGate = {
  attemptsByIdentity: Map<string, ContactGateAttempt[]>;
  duplicateByContactGoal: Map<string, ContactDuplicateReservation>;
  lastCleanupAt: number;
};

type GateInput = {
  contact: string;
  projectGoal: string;
  identityKey: string;
  now?: number;
};

export type ContactGateReservation = {
  reservationId: string;
  identityKey: string;
  duplicateKey: string;
};

export type ContactSubmission = NormalizedContactFormInput & {
  submissionId: string;
  receivedAt: string;
  ipHash: string;
  userAgent: string;
};

export type ContactNotificationResult =
  | { ok: true; status: "delivered" }
  | { ok: true; status: "skipped" }
  | { ok: false; status: "failed"; error: "notification_failure" };

export type ContactServiceReadiness = {
  ready: boolean;
  persistence: "ready" | "failed";
  notification: "configured" | "not_configured" | "invalid";
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
export const CONTACT_REQUEST_MAX_BYTES = 32 * 1024;
export const CONTACT_FIELD_MAX_LENGTHS = {
  name: 60,
  contact: 160,
  projectGoal: 4_000,
  timeline: 120,
  budgetRange: 120,
  link: 2_048
} as const;
const PLACEHOLDER_CONTACT_PATTERN = /(^|\b)(hello@example\.com|test@example\.com|example\.com|example\.org|example\.net)(\b|$)/i;
const UNSAFE_CONTACT_STORAGE_SEGMENTS = [
  ["apps", "website", "public"],
  ["apps", "website", ".next"],
  ["apps", "website", "app"],
  ["apps", "website", "components"],
  ["apps", "website", "lib"]
];
const CONTACT_SUBMISSIONS_FILENAME = "submissions.jsonl";

export class ContactPayloadTooLargeError extends Error {
  constructor() {
    super(`Contact request body exceeds ${CONTACT_REQUEST_MAX_BYTES} bytes.`);
    this.name = "ContactPayloadTooLargeError";
  }
}

let contactStorageLockTail: Promise<void> = Promise.resolve();

function withContactStorageLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = contactStorageLockTail.then(operation, operation);
  contactStorageLockTail = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

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

export async function readContactRequestJson(
  request: Pick<Request, "body" | "headers">,
  maximumBytes = CONTACT_REQUEST_MAX_BYTES
): Promise<unknown> {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
      throw new ContactPayloadTooLargeError();
    }
  }

  if (!request.body) {
    throw new SyntaxError("Contact request body is empty.");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let totalBytes = 0;
  let source = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel("contact_request_too_large").catch(() => undefined);
        throw new ContactPayloadTooLargeError();
      }

      source += decoder.decode(value, { stream: true });
    }
    source += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  return JSON.parse(source) as unknown;
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

function getContactDuplicateKey(contact: string, projectGoal: string) {
  return hashContactValue(
    `${contact.trim().toLowerCase()}|${normalizeGoalFingerprint(projectGoal)}`
  );
}

export function hashContactValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getContactIdentityKey(ipAddress: string) {
  return hashContactValue(ipAddress.trim().toLowerCase());
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
  const timeline = getString(input.timeline);
  const budgetRange = getString(input.budget_range);
  const links = getLinks(input.links);

  if (!name || !contact || !projectGoal) {
    return error("missing_required_field", "Name, reply channel, and project goal are required.");
  }

  if (
    name.length < 2 ||
    name.length > CONTACT_FIELD_MAX_LENGTHS.name ||
    contact.length > CONTACT_FIELD_MAX_LENGTHS.contact
  ) {
    return error("missing_required_field", "Name or reply channel is outside the accepted length.");
  }

  if (PLACEHOLDER_CONTACT_PATTERN.test(contact)) {
    return error("invalid_contact", "Use a real reply channel instead of a placeholder address.");
  }

  if (
    isLowQualityProjectGoal(projectGoal) ||
    projectGoal.length > CONTACT_FIELD_MAX_LENGTHS.projectGoal ||
    timeline.length > CONTACT_FIELD_MAX_LENGTHS.timeline ||
    budgetRange.length > CONTACT_FIELD_MAX_LENGTHS.budgetRange
  ) {
    return error("low_quality_input", "Add more context about the goal, current state, and expected outcome.");
  }

  if (links.length > 3) {
    return error("invalid_link", "At most three public links are supported.");
  }

  for (const link of links) {
    if (link.length > CONTACT_FIELD_MAX_LENGTHS.link) {
      return error("invalid_link", "Links must be shorter than the supported URL limit.");
    }

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
    const activeAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < FIFTEEN_MINUTES
    );
    if (activeAttempts.length === 0) {
      gate.attemptsByIdentity.delete(identityKey);
    } else if (activeAttempts.length !== attempts.length) {
      gate.attemptsByIdentity.set(identityKey, activeAttempts);
    }
  }

  for (const [duplicateKey, reservation] of gate.duplicateByContactGoal) {
    if (now - reservation.timestamp >= ONE_DAY) {
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
):
  | { ok: true; reservation: ContactGateReservation }
  | { ok: false; error: ContactFormError } {
  const now = input.now ?? Date.now();
  const duplicateKey = getContactDuplicateKey(input.contact, input.projectGoal);
  cleanupContactSubmissionGate(gate, now, input.identityKey, duplicateKey);
  const attempts = gate.attemptsByIdentity.get(input.identityKey) ?? [];
  const activeAttempts = attempts.filter(
    (attempt) => now - attempt.timestamp < FIFTEEN_MINUTES
  );

  if (activeAttempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return error("rate_limited", "Too many requests. Please retry later.");
  }

  const previousDuplicate = gate.duplicateByContactGoal.get(duplicateKey);

  if (previousDuplicate && now - previousDuplicate.timestamp < ONE_DAY) {
    activeAttempts.push({ reservationId: randomUUID(), timestamp: now });
    gate.attemptsByIdentity.set(input.identityKey, activeAttempts);
    return error("duplicate_submit", "A similar request was already received.");
  }

  const reservationId = randomUUID();
  activeAttempts.push({ reservationId, timestamp: now });
  gate.attemptsByIdentity.set(input.identityKey, activeAttempts);
  gate.duplicateByContactGoal.set(duplicateKey, { reservationId, timestamp: now });

  return {
    ok: true,
    reservation: {
      reservationId,
      identityKey: input.identityKey,
      duplicateKey
    }
  };
}

export function rollbackContactSubmissionGate(
  gate: ContactSubmissionGate,
  reservation: ContactGateReservation
) {
  const duplicateReservation = gate.duplicateByContactGoal.get(reservation.duplicateKey);
  if (duplicateReservation?.reservationId === reservation.reservationId) {
    gate.duplicateByContactGoal.delete(reservation.duplicateKey);
  }

  const attempts = gate.attemptsByIdentity.get(reservation.identityKey);
  if (!attempts) return;

  const remainingAttempts = attempts.filter(
    (attempt) => attempt.reservationId !== reservation.reservationId
  );
  if (remainingAttempts.length === 0) {
    gate.attemptsByIdentity.delete(reservation.identityKey);
    return;
  }

  gate.attemptsByIdentity.set(reservation.identityKey, remainingAttempts);
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

export function getContactReleaseRoot(currentWorkingDirectory = process.cwd()) {
  const resolvedWorkingDirectory = path.resolve(currentWorkingDirectory);
  const parentDirectory = path.dirname(resolvedWorkingDirectory);

  // Next standalone changes cwd to <release>/apps/website before loading the app.
  // Recover the full release root so sibling paths such as <release>/data are
  // rejected too; they would otherwise disappear during release rotation.
  if (
    path.basename(resolvedWorkingDirectory).toLowerCase() === "website" &&
    path.basename(parentDirectory).toLowerCase() === "apps"
  ) {
    return path.dirname(parentDirectory);
  }

  return resolvedWorkingDirectory;
}

export function getContactSubmissionsDir() {
  const configuredDirectory = process.env.CONTACT_SUBMISSIONS_DIR?.trim();

  if (!configuredDirectory) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("contact_storage_not_configured");
    }

    return path.join(process.cwd(), ".data", "website-contact");
  }

  if (!path.isAbsolute(configuredDirectory)) {
    throw new Error("contact_storage_must_be_absolute");
  }

  const resolvedDirectory = path.resolve(configuredDirectory);
  if (
    process.env.NODE_ENV === "production" &&
    isPathInside(getContactReleaseRoot(), resolvedDirectory)
  ) {
    throw new Error("contact_storage_inside_release");
  }

  return resolvedDirectory;
}

function getContactNotificationConfig():
  | { status: "configured"; url: string }
  | { status: "not_configured" }
  | { status: "invalid" } {
  const configuredValue = process.env.CONTACT_NOTIFICATION_WEBHOOK_URL?.trim();
  if (!configuredValue) return { status: "not_configured" };

  try {
    const url = new URL(configuredValue);
    if (url.protocol !== "https:") {
      return { status: "invalid" };
    }
    return { status: "configured", url: configuredValue };
  } catch {
    return { status: "invalid" };
  }
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

function isMissingPathError(value: unknown): value is NodeJS.ErrnoException {
  return (value as NodeJS.ErrnoException)?.code === "ENOENT";
}

function unsafeStorageError() {
  return new Error("unsafe_storage_directory");
}

async function resolvePathThroughExistingAncestor(candidate: string) {
  let existingPath = path.resolve(candidate);
  const missingSegments: string[] = [];

  while (true) {
    try {
      const resolvedExistingPath = await realpath(existingPath);
      return path.join(resolvedExistingPath, ...missingSegments);
    } catch (error) {
      if (!isMissingPathError(error)) throw error;

      const parentPath = path.dirname(existingPath);
      if (parentPath === existingPath) throw error;
      missingSegments.unshift(path.basename(existingPath));
      existingPath = parentPath;
    }
  }
}

async function assertPathDoesNotResolveInsideProtectedStorage(
  directory: string,
  root = process.cwd()
) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = await resolvePathThroughExistingAncestor(directory);

  if (process.env.NODE_ENV === "production") {
    const resolvedReleaseRoot = await resolvePathThroughExistingAncestor(
      getContactReleaseRoot(resolvedRoot)
    );
    if (isPathInside(resolvedReleaseRoot, resolvedCandidate)) {
      throw unsafeStorageError();
    }
  }

  for (const segment of UNSAFE_CONTACT_STORAGE_SEGMENTS) {
    const protectedDirectory = await resolvePathThroughExistingAncestor(
      path.join(resolvedRoot, ...segment)
    );
    if (isPathInside(protectedDirectory, resolvedCandidate)) {
      throw unsafeStorageError();
    }
  }

  return resolvedCandidate;
}

export async function validateResolvedContactSubmissionsDirectory(
  directory = getContactSubmissionsDir(),
  root = process.cwd()
): Promise<ContactStorageGuardResult> {
  const storageGuard = validateContactSubmissionsDirectory(directory, root);
  if (!storageGuard.ok) return storageGuard;

  try {
    await assertSafeExistingPath(storageGuard.directory, "directory");
    const resolvedDirectory = await assertPathDoesNotResolveInsideProtectedStorage(
      storageGuard.directory,
      root
    );
    return { ok: true, directory: resolvedDirectory };
  } catch (error) {
    if (error instanceof Error && error.message === "unsafe_storage_directory") {
      return {
        ok: false,
        error: {
          code: "unsafe_storage_directory",
          message: "Contact submissions directory must not resolve inside protected storage."
        }
      };
    }
    throw error;
  }
}

async function setPrivateMode(targetPath: string, mode: number) {
  if (process.platform === "win32") return;
  await chmod(targetPath, mode);
}

async function assertSafeExistingPath(targetPath: string, expectedType: "directory" | "file") {
  try {
    const status = await lstat(targetPath);
    if (status.isSymbolicLink()) throw unsafeStorageError();
    if (expectedType === "directory" ? !status.isDirectory() : !status.isFile()) {
      throw unsafeStorageError();
    }
    return true;
  } catch (error) {
    if (isMissingPathError(error)) return false;
    throw error;
  }
}

async function prepareContactSubmissionsDirectory() {
  const directory = getContactSubmissionsDir();
  const storageGuard = await validateResolvedContactSubmissionsDirectory(directory);
  if (!storageGuard.ok) throw unsafeStorageError();

  const existed = await assertSafeExistingPath(storageGuard.directory, "directory");
  if (!existed) {
    await mkdir(storageGuard.directory, { recursive: true, mode: 0o700 });
  }

  await assertSafeExistingPath(storageGuard.directory, "directory");
  const resolvedDirectory = await realpath(storageGuard.directory);
  const finalStorageGuard = await validateResolvedContactSubmissionsDirectory(resolvedDirectory);
  if (!finalStorageGuard.ok) throw unsafeStorageError();
  await setPrivateMode(finalStorageGuard.directory, 0o700);
  return finalStorageGuard.directory;
}

function getNoFollowFlag() {
  if (process.platform === "win32") return 0;
  return typeof fsConstants.O_NOFOLLOW === "number" ? fsConstants.O_NOFOLLOW : 0;
}

async function writePrivateContactFile(
  filePath: string,
  source: string,
  mode: "append" | "replace"
) {
  if (mode === "replace") {
    await replacePrivateContactFile(filePath, source);
    return;
  }

  await assertSafeExistingPath(filePath, "file");
  const flags =
    fsConstants.O_CREAT |
    fsConstants.O_WRONLY |
    getNoFollowFlag() |
    fsConstants.O_APPEND;
  const fileHandle = await open(filePath, flags, 0o600);

  try {
    const status = await fileHandle.stat();
    if (!status.isFile()) throw unsafeStorageError();
    if (process.platform !== "win32") await fileHandle.chmod(0o600);
    await fileHandle.writeFile(source, "utf8");
    await fileHandle.sync();
  } finally {
    await fileHandle.close();
  }
}

async function replacePrivateContactFile(filePath: string, source: string) {
  await assertSafeExistingPath(filePath, "file");
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`
  );
  const flags =
    fsConstants.O_CREAT |
    fsConstants.O_EXCL |
    fsConstants.O_WRONLY |
    getNoFollowFlag();
  let temporaryFileCreated = false;

  try {
    const fileHandle = await open(temporaryPath, flags, 0o600);
    temporaryFileCreated = true;
    try {
      if (process.platform !== "win32") await fileHandle.chmod(0o600);
      await fileHandle.writeFile(source, "utf8");
      await fileHandle.sync();
    } finally {
      await fileHandle.close();
    }

    await rename(temporaryPath, filePath);
    temporaryFileCreated = false;
  } finally {
    if (temporaryFileCreated) {
      await unlink(temporaryPath).catch((error) => {
        if (!isMissingPathError(error)) throw error;
      });
    }
  }
}

export async function getContactServiceReadiness(): Promise<ContactServiceReadiness> {
  const notification = getContactNotificationConfig().status;

  try {
    const directory = await prepareContactSubmissionsDirectory();
    const submissionsFile = path.join(directory, CONTACT_SUBMISSIONS_FILENAME);
    const submissionsFileExists = await assertSafeExistingPath(submissionsFile, "file");

    if (submissionsFileExists) {
      await setPrivateMode(submissionsFile, 0o600);
      await access(submissionsFile, fsConstants.W_OK);
    } else {
      await access(directory, fsConstants.W_OK);
    }

    return {
      ready: notification !== "invalid",
      persistence: "ready",
      notification
    };
  } catch {
    return {
      ready: false,
      persistence: "failed",
      notification
    };
  }
}

export async function appendContactSubmission(submission: ContactSubmission) {
  return withContactStorageLock(async () => {
    const directory = await prepareContactSubmissionsDirectory();
    await writePrivateContactFile(
      path.join(directory, CONTACT_SUBMISSIONS_FILENAME),
      `${JSON.stringify(submission)}\n`,
      "append"
    );
  });
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
  return withContactStorageLock(async () => {
    const storageGuard = await validateResolvedContactSubmissionsDirectory(path.dirname(filePath));
    if (!storageGuard.ok) throw unsafeStorageError();
    const safeFilePath = path.join(storageGuard.directory, path.basename(filePath));
    const cutoffDate = new Date(now.getTime() - retentionDays * ONE_DAY);

    let source = "";
    try {
      const fileExists = await assertSafeExistingPath(safeFilePath, "file");
      if (!fileExists) {
        return {
          filePath: safeFilePath,
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

      source = await readFile(safeFilePath, "utf8");
    } catch (error) {
      if (isMissingPathError(error)) {
        return {
          filePath: safeFilePath,
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
      await writePrivateContactFile(safeFilePath, nextSource, "replace");
    }

    return {
      filePath: safeFilePath,
      dryRun,
      retentionDays,
      cutoff: cutoffDate.toISOString(),
      totalLines: lines.length,
      keptCount,
      expiredCount,
      malformedCount,
      missingFile: false
    };
  });
}

export async function sendContactNotification(
  submission: ContactSubmission,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {}
): Promise<ContactNotificationResult> {
  const notificationConfig = getContactNotificationConfig();
  if (notificationConfig.status === "not_configured") {
    return { ok: true, status: "skipped" };
  }
  if (notificationConfig.status === "invalid") {
    return { ok: false, status: "failed", error: "notification_failure" };
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    options.timeoutMs ?? CONTACT_NOTIFICATION_TIMEOUT_MS
  );

  try {
    const response = await (options.fetcher ?? fetch)(notificationConfig.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: abortController.signal,
      redirect: "error",
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

    try {
      if (!response.ok) {
        return { ok: false, status: "failed", error: "notification_failure" };
      }

      return { ok: true, status: "delivered" };
    } finally {
      if (response.body) {
        try {
          await response.body.cancel();
        } catch {
          // Ignore cleanup failures after the delivery outcome is known.
        }
      }
    }
  } catch {
    return { ok: false, status: "failed", error: "notification_failure" };
  } finally {
    clearTimeout(timeoutId);
  }
}
