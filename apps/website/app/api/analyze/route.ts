import { NextResponse, type NextRequest } from "next/server";
import { analyzePageRequest } from "../../../lib/ai-page-analysis";

export const dynamic = "force-dynamic";

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
    version: "d9"
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "failed",
        error: {
          code: "submit_failure",
          message: "Request body must be valid JSON."
        }
      },
      { status: 400 }
    );
  }

  const result = await analyzePageRequest(payload, {
    identityKey: getClientIdentity(request)
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        status: "failed",
        error: result.error
      },
      { status: result.httpStatus }
    );
  }

  return NextResponse.json(result.value, { status: result.httpStatus });
}
