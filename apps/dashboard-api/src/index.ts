import { createOssStore } from "./ossStore.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 8787);

function requireEnv(name: string, legacyName?: string): string {
  const v = process.env[name] ?? (legacyName ? process.env[legacyName] : undefined);
  if (!v) throw new Error(`Missing env: ${name}${legacyName ? ` (or ${legacyName})` : ""}`);
  return v;
}

function optionalEnv(name: string, legacyName?: string): string | undefined {
  return process.env[name] ?? (legacyName ? process.env[legacyName] : undefined);
}

// Prefer `DASHBOARD_OSS_*` (MR2 naming). Keep `OSS_*` as a backward-compatible fallback.
const store = createOssStore({
  region: requireEnv("DASHBOARD_OSS_REGION", "OSS_REGION"),
  endpoint: requireEnv("DASHBOARD_OSS_ENDPOINT", "OSS_ENDPOINT"),
  bucket: requireEnv("DASHBOARD_OSS_BUCKET", "OSS_BUCKET"),
  accessKeyId: requireEnv("DASHBOARD_OSS_ACCESS_KEY_ID", "OSS_ACCESS_KEY_ID"),
  accessKeySecret: requireEnv("DASHBOARD_OSS_ACCESS_KEY_SECRET", "OSS_ACCESS_KEY_SECRET"),
  prefix: optionalEnv("DASHBOARD_OSS_PREFIX", "OSS_PREFIX") || "dashboard/"
});

const auth = {
  adminPassword: requireEnv("ADMIN_PASSWORD"),
  jwtSecret: requireEnv("JWT_SECRET")
};

const app = createApp({ store, auth });

app.listen(port, "127.0.0.1", () => {
  // Keep startup log minimal; don't print sensitive env.
  console.log(`dashboard-api listening on http://127.0.0.1:${port}`);
});
