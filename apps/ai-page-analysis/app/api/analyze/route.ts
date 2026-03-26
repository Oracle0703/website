import { NextResponse } from "next/server";

import { getAnalyzeProvider } from "../../../lib/ai/provider";
import type { AnalyzeRuntimeConfig } from "../../../lib/ai/types";
import type { DemoMode } from "../../../lib/demo-data";
import { extractFromUrl } from "../../../lib/extract/from-url";

export const dynamic = "force-dynamic";

function normalizeRuntimeConfig(value: unknown): AnalyzeRuntimeConfig | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const runtimeConfig: AnalyzeRuntimeConfig = {};

  if (typeof source.apiKey === "string" && source.apiKey.trim()) {
    runtimeConfig.apiKey = source.apiKey.trim();
  }
  if (typeof source.baseUrl === "string" && source.baseUrl.trim()) {
    runtimeConfig.baseUrl = source.baseUrl.trim();
  }
  if (typeof source.model === "string" && source.model.trim()) {
    runtimeConfig.model = source.model.trim();
  }

  return Object.keys(runtimeConfig).length > 0 ? runtimeConfig : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: DemoMode;
    input?: string;
    runtimeConfig?: AnalyzeRuntimeConfig;
  };

  const mode = body.mode === "url" || body.mode === "screenshot" || body.mode === "brief" ? body.mode : "url";
  const input = typeof body.input === "string" ? body.input : "";
  const runtimeConfig = normalizeRuntimeConfig(body.runtimeConfig);

  const extracted = mode === "url" && input.trim() ? await extractFromUrl(input.trim()).catch(() => ({ url: input.trim(), headings: [], ctas: [] })) : undefined;

  const provider = getAnalyzeProvider(runtimeConfig);
  const data = await provider.analyze({ mode, input, extracted, runtimeConfig });

  return NextResponse.json({
    code: 0,
    message: "OK",
    data
  });
}
