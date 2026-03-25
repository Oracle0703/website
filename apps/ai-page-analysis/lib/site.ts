export const appName = "AI 页面分析与改版方案助手";
export const appDescription = "输入 URL、截图说明或业务 Brief，生成结构化页面诊断与改版方案。";
export const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

export function toAbsoluteUrl(path: string) {
  return new URL(path, appBaseUrl).toString();
}
