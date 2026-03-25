export type DemoMode = "url" | "screenshot" | "brief";
export type Priority = "P0" | "P1" | "P2";

export type DemoOutput = {
  analysisId: string;
  generatedAt: string;
  headline: string;
  requirementType: string;
  pageGoal: string;
  needs: { title: string; owner: string; summary: string }[];
  mustHave: { title: string; reason: string; priority: Priority }[];
  apiSuggestions: { name: string; method: string; purpose: string }[];
  keyPoints: string[];
  prdGaps: string[];
  devSplit: { area: string; items: string[] }[];
};

export const modePlaceholders: Record<DemoMode, string> = {
  url: "https://example.com/dashboard/funnel",
  screenshot: "漏斗分析后台截图：顶部在数据看台新增漏斗入口，查询区为动态表单，结果区包含列表和折线图。",
  brief: "目标：新增漏斗分析能力；页面需支持查询配置、结果展示、看板接入和接口设计说明。"
};

export const workflowStages = ["识别页面类型", "拆解产运需求", "定位关键实现点", "生成研发解读"];

export function createMockOutput(mode: DemoMode, input: string): DemoOutput {
  return {
    analysisId: `APR-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    headline: `已完成${mode === "url" ? "URL" : mode === "screenshot" ? "截图" : "Brief"}需求解读：${input.slice(0, 24) || "未提供输入"}`,
    requirementType: "数据分析后台 / 漏斗分析功能新增需求",
    pageGoal: "在数据看台中新增漏斗分析能力，支持通过动态查询条件查看转化过程，并输出列表与趋势结果。",
    needs: [
      {
        title: "页面与入口",
        owner: "产品 / 前端",
        summary: "在数据看台新增漏斗入口，并在新建看板时支持漏斗类型。"
      },
      {
        title: "查询配置区",
        owner: "产品 / 前后端",
        summary: "用动态表单承接日期范围、时间粒度、漏斗步骤与步骤属性。"
      },
      {
        title: "结果展示区",
        owner: "前端 / 后端",
        summary: "结果页至少包含表格与折线图，承接人数、转化率与时间趋势。"
      }
    ],
    mustHave: [
      { title: "数据看台新增漏斗入口", reason: "这是用户进入漏斗能力的主入口", priority: "P0" },
      { title: "动态步骤表单", reason: "漏斗步骤和属性配置是查询能力核心", priority: "P0" },
      { title: "表格 + 折线图结果", reason: "结果展示是该需求的主要交付物", priority: "P0" },
      { title: "看板保存 / 编辑能力", reason: "漏斗需纳入原有看板体系，支持复用", priority: "P1" }
    ],
    apiSuggestions: [
      { name: "事件列表接口", method: "GET", purpose: "供动态步骤选择事件名称" },
      { name: "属性字段接口", method: "GET", purpose: "供每一步配置属性过滤条件" },
      { name: "漏斗分析接口", method: "POST", purpose: "返回人数、转化率、时间维度结果" },
      { name: "看板保存接口", method: "POST/PUT", purpose: "保存漏斗看板配置并支持后续编辑" }
    ],
    keyPoints: [
      "必须先确认漏斗统计口径：按用户还是按事件、是否要求顺序发生。",
      "动态表单要支持步骤新增、删除、校验与属性联动。",
      "后端最好一次性返回表格与图表需要的数据结构，避免前端二次拼装。",
      "结果区必须同时考虑空状态、加载中和查询失败状态。"
    ],
    prdGaps: [
      "漏斗最大步骤数是否固定。",
      "步骤属性过滤是 AND 还是 OR。",
      "折线图展示人数还是转化率。",
      "是否支持导出、分页和权限控制。",
      "看板保存后是否允许再次编辑。"
    ],
    devSplit: [
      {
        area: "前端",
        items: ["数据看台新增漏斗入口", "动态查询表单", "列表结果", "折线图结果", "新建看板弹窗扩展"]
      },
      {
        area: "后端",
        items: ["事件列表接口", "属性字段接口", "漏斗分析接口", "看板保存与读取接口"]
      },
      {
        area: "测试",
        items: ["步骤增删校验", "转化率计算正确性", "空状态与异常状态", "接口参数边界"]
      }
    ]
  };
}
