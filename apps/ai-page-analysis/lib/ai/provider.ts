import { createMockOutput, type DemoOutput } from "../demo-data";
import { ANALYZE_OUTPUT_SCHEMA } from "./schema";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import type { AnalyzeInput, AnalyzeProvider } from "./types";

function buildDrafts(base: Omit<DemoOutput, "analysisId" | "generatedAt" | "headline" | "planDraft" | "specDraft">, input: AnalyzeInput) {
  const planDraft = `# plan.md\n\n## 1. 项目背景\n- 输入类型：${input.mode}\n- 页面目标：${base.pageGoal}\n\n## 2. 项目目标\n- ${base.mustHave.map((item) => item.title).join("\n- ")}\n\n## 3. 风险与依赖\n- ${base.prdGaps.join("\n- ")}\n`;

  const specDraft = `# spec.md\n\n## 1. 需求类型\n- ${base.requirementType}\n\n## 2. 页面目标\n- ${base.pageGoal}\n\n## 3. 必须实现\n- ${base.mustHave.map((item) => item.title).join("\n- ")}\n\n## 4. 接口建议\n- ${base.apiSuggestions.map((item) => `${item.method} ${item.name}`).join("\n- ")}\n`;

  return { planDraft, specDraft };
}

export class OpenAICompatibleProvider implements AnalyzeProvider {
  private baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  private apiKey = process.env.AI_API_KEY;
  private model = process.env.AI_MODEL || "gpt-4o";

  async analyze(input: AnalyzeInput): Promise<DemoOutput> {
    if (!this.apiKey) {
      return createMockOutput(input.mode, input.input, input.extracted);
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "page_requirement_analysis",
            strict: true,
            schema: ANALYZE_OUTPUT_SCHEMA
          }
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) }
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

    const base = JSON.parse(content) as Omit<DemoOutput, "analysisId" | "generatedAt" | "headline" | "planDraft" | "specDraft">;
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

export function getAnalyzeProvider(): AnalyzeProvider {
  return new OpenAICompatibleProvider();
}
