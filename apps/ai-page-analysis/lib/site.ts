export const appName = "AI 页面需求分析助手";
export const appDescription = "输入 URL、截图说明或业务 Brief，输出产运需求、关键实现点、缺失项与研发拆解建议。";
export const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";

export function toAbsoluteUrl(path: string) {
  return new URL(path, appBaseUrl).toString();
}
