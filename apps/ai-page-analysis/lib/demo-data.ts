export type DemoMode = "url" | "screenshot" | "brief";
export type Priority = "P0" | "P1" | "P2";
export type Severity = "高" | "中" | "低";

export type DemoOutput = {
  analysisId: string;
  generatedAt: string;
  headline: string;
  scores: { label: string; score: number }[];
  issues: { title: string; severity: Severity; evidence: string; impact: string }[];
  recommendations: { module: string; action: string; priority: Priority; expectedImpact: string }[];
  backlog: { task: string; owner: string; eta: string; priority: Priority }[];
};

export const modePlaceholders: Record<DemoMode, string> = {
  url: "https://example.com/landing-page",
  screenshot: "首页截图：主 CTA 过低，价值表达抽象，信任背书偏后。",
  brief: "目标：提升试用转化；受众：企业决策者；问题：首屏理解成本高。"
};

export const workflowStages = [
  "解析页面素材",
  "提取结构与层级",
  "诊断问题与影响",
  "生成改版方案"
];

export function createMockOutput(mode: DemoMode, input: string): DemoOutput {
  return {
    analysisId: `APA-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    headline: `已完成${mode === "url" ? "URL" : mode === "screenshot" ? "截图" : "Brief"}分析：${input.slice(0, 28) || "未提供输入"}`,
    scores: [
      { label: "信息清晰度", score: 64 },
      { label: "视觉层级", score: 58 },
      { label: "转化路径", score: 51 },
      { label: "执行可落地", score: 79 }
    ],
    issues: [
      {
        title: "首屏价值表达偏弱",
        severity: "高",
        evidence: "标题无法快速说明对象与收益",
        impact: "首屏停留和继续浏览率偏低"
      },
      {
        title: "CTA 焦点不集中",
        severity: "高",
        evidence: "主次按钮权重接近，且视觉中心不突出",
        impact: "点击率被稀释"
      },
      {
        title: "信任背书出现过晚",
        severity: "中",
        evidence: "客户、案例和数据集中在中后段",
        impact: "影响转化决策"
      }
    ],
    recommendations: [
      {
        module: "Hero 首屏",
        action: "重写标题为对象+结果型表达，并强化副标题场景说明",
        priority: "P0",
        expectedImpact: "提升首屏理解速度"
      },
      {
        module: "CTA 区域",
        action: "将主 CTA 上移并增强按钮对比度",
        priority: "P0",
        expectedImpact: "提高关键点击率"
      },
      {
        module: "信任模块",
        action: "前置客户 Logo、案例与关键指标",
        priority: "P1",
        expectedImpact: "增强说服力"
      }
    ],
    backlog: [
      { task: "重写 Hero 标题与副标题", owner: "产品/文案", eta: "0.5d", priority: "P0" },
      { task: "重排 CTA 与首屏视觉焦点", owner: "设计/前端", eta: "1d", priority: "P0" },
      { task: "新增信任背书模块", owner: "设计/前端", eta: "1.5d", priority: "P1" }
    ]
  };
}
