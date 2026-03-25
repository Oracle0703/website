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
  planDraft: string;
  specDraft: string;
};

export const modePlaceholders: Record<DemoMode, string> = {
  url: "https://example.com/dashboard/funnel",
  screenshot: "漏斗分析后台截图：顶部在数据看台新增漏斗入口，查询区为动态表单，结果区包含列表和折线图。",
  brief: "目标：新增漏斗分析能力；页面需支持查询配置、结果展示、看板接入和接口设计说明。"
};

export const workflowStages = ["识别页面类型", "拆解产运需求", "定位关键实现点", "生成 plan/spec 草稿"];

export function createMockOutput(mode: DemoMode, input: string): DemoOutput {
  const summary = input.slice(0, 48) || "未提供输入";
  const planDraft = `# plan.md\n\n## 1. 项目背景\n- 当前输入是 ${mode === "url" ? "URL" : mode === "screenshot" ? "页面截图" : "业务 Brief"}，系统需要将页面线索转换成研发可执行的需求解读。\n- 本次识别到的需求类型为：数据分析后台 / 漏斗分析功能新增需求。\n\n## 2. 项目目标\n- 在数据看台中新增漏斗分析能力，承接转化过程分析场景。\n- 支持通过动态查询表单配置漏斗步骤、时间范围和过滤条件。\n- 输出列表与趋势图，并支持后续看板保存与复用。\n\n## 3. 范围\n### In Scope\n- 数据看台新增漏斗入口\n- 查询页面（动态表单）\n- 展示页面（列表 + 折线图）\n- 漏斗分析接口接入\n- 漏斗看板保存 / 编辑\n\n### Out of Scope\n- 高级归因分析\n- 导出能力\n- 复杂权限体系\n\n## 4. 阶段拆分\n### Phase 1\n- 新增漏斗入口\n- 完成动态查询表单\n- 完成列表与折线图展示\n\n### Phase 2\n- 支持漏斗看板保存与编辑\n- 完善空状态、异常状态和查询校验\n\n## 5. 关键里程碑\n1. 查询表单与结果结构对齐\n2. 漏斗接口跑通\n3. 看板接入现有数据看台体系\n\n## 6. 风险与注意事项\n- 需要先确认漏斗统计口径。\n- 需要明确过滤条件组合规则与结果图表口径。\n- 需要验证动态表单复杂度是否在当前前端组件能力范围内。\n`;

  const specDraft = `# spec.md\n\n## 1. 需求类型\n- 数据分析后台 / 漏斗分析功能新增需求\n\n## 2. 页面目标\n- 在数据看台中新增漏斗页面，支持用户按时间、步骤和属性查询转化过程。\n\n## 3. 页面结构\n### 3.1 查询页面\n- 日期范围\n- 时间粒度\n- 漏斗步骤\n- 步骤属性\n\n### 3.2 展示页面\n- 列表结果\n- 折线图趋势\n\n## 4. 必须实现\n- 数据看台新增漏斗入口\n- 动态步骤表单\n- 步骤属性配置\n- 表格结果展示\n- 折线图结果展示\n- 漏斗看板类型接入\n\n## 5. 接口建议\n- GET 事件列表接口\n- GET 属性字段接口\n- POST 漏斗分析接口\n- POST/PUT 看板保存接口\n\n## 6. 关键实现点\n- 明确漏斗统计口径（用户/事件、顺序约束）\n- 动态表单增删改校验\n- 结果结构一次性返回给前端\n- 处理空状态、异常状态、加载态\n\n## 7. 待确认 / 缺失项\n- 最大步骤数\n- 过滤条件组合规则\n- 折线图展示人数还是转化率\n- 看板保存后是否允许编辑\n- 是否支持导出\n\n## 8. 研发拆解\n### 前端\n- 数据看台新增漏斗入口\n- 动态查询表单\n- 列表结果\n- 折线图结果\n- 新建看板弹窗扩展\n\n### 后端\n- 事件列表接口\n- 属性字段接口\n- 漏斗分析接口\n- 看板保存与读取接口\n\n### 测试\n- 步骤增删校验\n- 转化率计算正确性\n- 空状态与异常状态\n- 接口参数边界\n`;

  return {
    analysisId: `APR-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    headline: `已完成${mode === "url" ? "URL" : mode === "screenshot" ? "截图" : "Brief"}需求解读：${summary}`,
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
    ],
    planDraft,
    specDraft
  };
}
