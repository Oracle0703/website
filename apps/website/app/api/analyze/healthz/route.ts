import { NextResponse } from "next/server";
import { isAnalysisPublicCaptureEnabled } from "../../../../lib/ai-page-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ai-page-analysis",
    version: "d9",
    public_capture_enabled: isAnalysisPublicCaptureEnabled()
  });
}
