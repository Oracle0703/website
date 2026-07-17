import { NextResponse, type NextRequest } from "next/server";
import { readLimitedAnalysisJsonBody } from "../../../lib/ai-analysis-request-body";
import {
  analyzePageRequest,
  isAnalysisPublicCaptureEnabled
} from "../../../lib/ai-page-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getClientIdentity(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ai-page-analysis",
    version: "d9",
    public_capture_enabled: isAnalysisPublicCaptureEnabled()
  });
}

export async function POST(request: NextRequest) {
  const body = await readLimitedAnalysisJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      {
        status: "failed",
        error: body.error
      },
      { status: body.httpStatus }
    );
  }

  const result = await analyzePageRequest(body.value, {
    identityKey: getClientIdentity(request),
    capture: isAnalysisPublicCaptureEnabled()
  });

  if (!result.ok) {
    const headers = result.error.code === "rate_limited"
      ? { "retry-after": "60" }
      : result.error.code === "server_busy"
        ? { "retry-after": "2" }
        : undefined;

    return NextResponse.json(
      {
        status: "failed",
        error: result.error
      },
      { status: result.httpStatus, headers }
    );
  }

  return NextResponse.json(result.value, { status: result.httpStatus });
}
