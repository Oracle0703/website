import { NextResponse } from "next/server";

import { createMockOutput, type DemoMode } from "../../../lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: DemoMode;
    input?: string;
  };

  const mode = body.mode === "url" || body.mode === "screenshot" || body.mode === "brief" ? body.mode : "url";
  const input = typeof body.input === "string" ? body.input : "";

  return NextResponse.json({
    code: 0,
    message: "OK",
    data: createMockOutput(mode, input)
  });
}
