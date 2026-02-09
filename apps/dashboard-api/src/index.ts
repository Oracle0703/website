import { createOssStore } from "./ossStore.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 8787);

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const store = createOssStore({
  region: requireEnv("OSS_REGION"),
  endpoint: requireEnv("OSS_ENDPOINT"),
  bucket: requireEnv("OSS_BUCKET"),
  accessKeyId: requireEnv("OSS_ACCESS_KEY_ID"),
  accessKeySecret: requireEnv("OSS_ACCESS_KEY_SECRET"),
  prefix: process.env.OSS_PREFIX || "dashboard/"
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
