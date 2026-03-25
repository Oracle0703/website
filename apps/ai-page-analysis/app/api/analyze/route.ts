import { NextResponse } from "next/server";

import { extractFromUrl } from "../../../lib/extract/from-url";
import { getAnalyzeProvider } from "../../../lib/ai/provider";
import type { DemoMode } from "../../../lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: DemoMode;
    input?: string;
  };

  const mode = body.mode === "url" || body.mode === "screenshot" || body.mode === "brief" ? body.mode : "url";
  const input = typeof body.input === "string" ? body.input : "";

  const extracted = mode === "url" && input.trim() ? await extractFromUrl(input.trim()).catch(() => ({ url: input.trim(), headings: [], ctas: [] })) : undefined;

  const provider = getAnalyzeProvider();
  const data = await provider.analyze({ mode, input, extracted });

  return NextResponse.json({
    code: 0,
    message: "OK",
    data
  });
}
