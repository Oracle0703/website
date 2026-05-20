import { createServer } from "node:net";

export function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });
}

export async function findAvailablePort(startPort, options = {}) {
  const { explicitPort = false, maxAttempts = 20 } = options;

  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidate = startPort + offset;
    if (await isPortAvailable(candidate)) {
      return candidate;
    }

    if (explicitPort) {
      throw new Error(
        `Port ${candidate} is already in use (EADDRINUSE). Stop the existing server or choose another NEXT_STATIC_VERIFY_PORT.`
      );
    }
  }

  throw new Error(`Could not find an available port starting at ${startPort}`);
}
