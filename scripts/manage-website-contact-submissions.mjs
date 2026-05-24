#!/usr/bin/env node

import path from "node:path";
import {
  cleanupContactSubmissionsFile,
  CONTACT_RETENTION_DAYS,
  getContactSubmissionsDir,
  validateContactSubmissionsDirectory
} from "../apps/website/lib/contact-form.ts";

function parseArgs(argv) {
  const options = {
    checkStorage: false,
    cleanup: false,
    dryRun: false,
    retentionDays: CONTACT_RETENTION_DAYS
  };

  for (const arg of argv) {
    if (arg === "--check-storage") {
      options.checkStorage = true;
      continue;
    }

    if (arg === "--cleanup") {
      options.cleanup = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--retention-days=")) {
      const value = Number(arg.slice("--retention-days=".length));
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error("--retention-days must be a positive integer");
      }
      options.retentionDays = value;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printJson(summary) {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.checkStorage && !options.cleanup) {
    throw new Error("Use --check-storage and/or --cleanup");
  }

  const directory = getContactSubmissionsDir();
  const storage = validateContactSubmissionsDirectory(directory);

  if (!storage.ok) {
    printJson({
      ok: false,
      command: "contact:ops",
      storageDirectory: path.resolve(directory),
      error: storage.error
    });
    process.exitCode = 1;
    return;
  }

  const summary = {
    ok: true,
    command: "contact:ops",
    storageDirectory: storage.directory,
    storage: {
      ok: true
    }
  };

  if (options.cleanup) {
    summary.cleanup = await cleanupContactSubmissionsFile({
      filePath: path.join(storage.directory, "submissions.jsonl"),
      retentionDays: options.retentionDays,
      dryRun: options.dryRun
    });
  }

  printJson(summary);
}

main().catch((error) => {
  printJson({
    ok: false,
    command: "contact:ops",
    error: {
      code: "contact_ops_failure",
      message: error instanceof Error ? error.message : String(error)
    }
  });
  process.exitCode = 1;
});
