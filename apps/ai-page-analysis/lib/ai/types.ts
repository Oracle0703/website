import type { DemoMode, DemoOutput } from "../demo-data";

export type AnalyzeRuntimeConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

export type AnalyzeInput = {
  mode: DemoMode;
  input: string;
  extracted?: {
    url?: string;
    title?: string;
    description?: string;
    headings?: string[];
    ctas?: string[];
    ogImage?: string;
    imageCount?: number;
    imageAlts?: string[];
    screenshotSummary?: string;
  };
  runtimeConfig?: AnalyzeRuntimeConfig;
};

export type AnalyzeOutput = DemoOutput;

export type AnalyzeProvider = {
  analyze(input: AnalyzeInput): Promise<AnalyzeOutput>;
};
