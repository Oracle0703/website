import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    code: 0,
    message: "OK",
    data: {
      status: "ok",
      service: "ai-page-analysis",
      time: new Date().toISOString()
    }
  });
}
