import { createMockOutput, type DemoOutput } from "../demo-data";
import { ANALYZE_OUTPUT_SCHEMA } from "./schema";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import type { AnalyzeInput, AnalyzeProvider, AnalyzeRuntimeConfig } from "./types";

type BaseOutput = Omit<DemoOutput, "analysisId" | "generatedAt" | "headline" | "planDraft" | "specDraft">;

function buildDrafts(base: BaseOutput, input: AnalyzeInput) {
  const planDraft = `# plan.md\n\n## 1. 项目背景\n- 输入类型：${input.mode}\n- 页面目标：${base.pageGoal}\n\n## 2. 项目目标\n- ${base.mustHave.map((item) => item.title).join("\n- ")}\n\n## 3. 风险与依赖\n- ${base.prdGaps.join("\n- ")}\n`;

  const specDraft = `# spec.md\n\n## 1. 需求类型\n- ${base.requirementType}\n\n## 2. 页面目标\n- ${base.pageGoal}\n\n## 3. 必须实现\n- ${base.mustHave.map((item) => item.title).join("\n- ")}\n\n## 4. 接口建议\n- ${base.apiSuggestions.map((item) => `${item.method} ${item.name}`).join("\n- ")}\n`;

  return { planDraft, specDraft };
}

function pickConfiguredValue(overrideValue: string | undefined, envValue: string | undefined, fallbackValue?: string) {
  const override = overrideValue?.trim();
  if (override) return override;

  const env = envValue?.trim();
  if (env) return env;

  return fallbackValue;
}

export class OpenAICompatibleProvider implements AnalyzeProvider {
  private baseUrl: string;
  private apiKey: string | undefined;
  private model: string;

  constructor(runtimeConfig?: AnalyzeRuntimeConfig) {
    this.baseUrl = pickConfiguredValue(runtimeConfig?.baseUrl, process.env.AI_BASE_URL, "https://integrate.api.nvidia.com/v1") ?? "https://integrate.api.nvidia.com/v1";
    this.apiKey = pickConfiguredValue(runtimeConfig?.apiKey, process.env.AI_API_KEY);
    this.model = pickConfiguredValue(runtimeConfig?.model, process.env.AI_MODEL, "z-ai/glm5") ?? "z-ai/glm5";
  }

  private parseJsonContent(content: string) {
    const candidates = new Set<string>();
    const trimmed = content.trim();

    if (trimmed) {
      candidates.add(trimmed);
    }

    const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
      candidates.add(fencedMatch[1].trim());
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      candidates.add(trimmed.slice(firstBrace, lastBrace + 1).trim());
    }

    for (const candidate of candidates) {
      try {
        return JSON.parse(candidate) as BaseOutput;
      } catch {
        // Continue trying other candidates.
      }
    }

    return null;
  }

  private async requestAnalysis(input: AnalyzeInput, useSchema: boolean) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        ...(useSchema
          ? {
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "page_requirement_analysis",
                  strict: true,
                  schema: ANALYZE_OUTPUT_SCHEMA
                }
              }
            }
          : {}),
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: useSchema
              ? buildUserPrompt(input)
              : `${buildUserPrompt(input)}\n\n只输出严格 JSON，不要额外解释或代码块。`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`ai_provider_error_${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("ai_provider_empty_response");
    }

    return content;
  }

  async analyze(input: AnalyzeInput): Promise<DemoOutput> {
    if (!this.apiKey) {
      return createMockOutput(input.mode, input.input, input.extracted);
    }

    let base: BaseOutput | null = null;

    try {
      const content = await this.requestAnalysis(input, true);
      base = this.parseJsonContent(content);
    } catch {
      base = null;
    }

    if (!base) {
      const fallbackContent = await this.requestAnalysis(input, false);
      base = this.parseJsonContent(fallbackContent);
    }

    if (!base) {
      throw new Error("ai_provider_invalid_json");
    }

    const drafts = buildDrafts(base, input);

    return {
      ...base,
      analysisId: `APR-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      headline: `已完成${input.mode}需求解读：${input.input.slice(0, 48) || "未提供输入"}`,
      ...drafts
    };
  }
}

export function getAnalyzeProvider(runtimeConfig?: AnalyzeRuntimeConfig): AnalyzeProvider {
  return new OpenAICompatibleProvider(runtimeConfig);
}
