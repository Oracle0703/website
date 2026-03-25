import type { DemoMode, DemoOutput } from "../demo-data";

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
};

export type AnalyzeOutput = DemoOutput;

export type AnalyzeProvider = {
  analyze(input: AnalyzeInput): Promise<AnalyzeOutput>;
};
