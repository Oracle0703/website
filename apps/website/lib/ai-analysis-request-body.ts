import type { AnalysisError } from "./ai-page-analysis";

export const ANALYSIS_REQUEST_MAX_BYTES = 16 * 1024;

type RequestBodySource = {
  body: ReadableStream<Uint8Array> | null;
  headers: Headers;
};

type LimitedJsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; httpStatus: 400 | 413; error: AnalysisError };

function bodyFailure(
  httpStatus: 400 | 413,
  code: "submit_failure" | "request_too_large",
  message: string
): LimitedJsonBodyResult {
  return {
    ok: false,
    httpStatus,
    error: { code, message }
  };
}

export async function readLimitedAnalysisJsonBody(
  request: RequestBodySource,
  maxBytes = ANALYSIS_REQUEST_MAX_BYTES
): Promise<LimitedJsonBodyResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    if (request.body) {
      void request.body
        .cancel("analysis request body exceeded declared byte limit")
        .catch(() => undefined);
    }
    return bodyFailure(413, "request_too_large", `Request body must not exceed ${maxBytes} bytes.`);
  }

  if (!request.body) {
    return bodyFailure(400, "submit_failure", "Request body must be valid JSON.");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let json = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel("analysis request body exceeded byte limit");
        } catch {
          // The hard byte limit remains authoritative if cancellation races a close.
        }
        return bodyFailure(413, "request_too_large", `Request body must not exceed ${maxBytes} bytes.`);
      }

      json += decoder.decode(value, { stream: true });
    }

    json += decoder.decode();
  } catch {
    return bodyFailure(400, "submit_failure", "Request body could not be read.");
  } finally {
    reader.releaseLock();
  }

  try {
    return { ok: true, value: JSON.parse(json) };
  } catch {
    return bodyFailure(400, "submit_failure", "Request body must be valid JSON.");
  }
}
