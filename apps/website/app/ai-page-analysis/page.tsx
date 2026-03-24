import type { Metadata } from "next";
import { AIPageAnalysisLandingClient } from "../../components/landing/ai-page-analysis-landing-client";
import { toAbsoluteUrl } from "../../lib/site-url";

export const generateMetadata = (): Metadata => {
  const title = "AI 页面分析与改版方案助手";
  const description = "作品展示型 Demo：输入 URL、截图说明或业务 Brief，体验完整的页面诊断与改版方案生成流程。";

  return {
    title,
    description,
    alternates: {
      canonical: toAbsoluteUrl("/ai-page-analysis")
    },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl("/ai-page-analysis"),
      images: [toAbsoluteUrl("/og.png")]
    },
    twitter: {
      title,
      description,
      images: [toAbsoluteUrl("/og.png")]
    }
  };
};

export default function AIPageAnalysisPage() {
  return <AIPageAnalysisLandingClient />;
}
