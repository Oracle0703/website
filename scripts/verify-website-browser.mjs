import { spawn } from "node:child_process";
import { findAvailablePort } from "./lib/static-verifier-port.mjs";

const explicitPort = process.env.WEBSITE_BROWSER_VERIFY_PORT !== undefined;
const requestedPort = Number(
  process.env.WEBSITE_BROWSER_VERIFY_PORT ?? process.env.WEBSITE_BROWSER_VERIFY_START_PORT ?? 4323
);
const playwrightCliPath = "node_modules/@playwright/test/cli.js";

async function main() {
  const port = await findAvailablePort(requestedPort, { explicitPort });
  const passthroughArgs = process.argv.slice(2).filter((arg) => arg !== "--print-port");

  if (process.argv.includes("--print-port")) {
    console.log(port);
    return;
  }

  const args = [playwrightCliPath, "test", "-c", "playwright.website.config.ts", ...passthroughArgs];

  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      WEBSITE_BROWSER_VERIFY_PORT: String(port)
    },
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exitCode = code ?? 1;
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
