export type DemoMode = "url" | "screenshot" | "brief";
export type Priority = "P0" | "P1" | "P2";

export type DemoOutput = {
  analysisId: string;
  generatedAt: string;
  headline: string;
  requirementType: string;
  pageGoal: string;
  textSignals: string[];
  visualSignals: string[];
  needs: { title: string; owner: string; summary: string }[];
  mustHave: { title: string; reason: string; priority: Priority }[];
  apiSuggestions: { name: string; method: string; purpose: string }[];
  statusAndErrors: string[];
  keyPoints: string[];
  boundaries: string[];
  prdGaps: string[];
  devSplit: { area: string; items: string[] }[];
  planDraft: string;
  specDraft: string;
};

export type MockContext = {
  title?: string;
  description?: string;
  headings?: string[];
  ctas?: string[];
  ogImage?: string;
  imageCount?: number;
  imageAlts?: string[];
};

export const modePlaceholders: Record<DemoMode, string> = {
  url: "https://example.com/dashboard/funnel",
  screenshot: "漏斗分析后台截图：顶部在数据看台新增漏斗入口，查询区为动态表单，结果区包含列表和折线图。",
  brief: "目标：新增漏斗分析能力；页面需支持查询配置、结果展示、看板接入和接口设计说明。"
};

export const workflowStages = ["识别页面类型", "拆解产运需求", "定位关键实现点", "生成 plan/spec 草稿"];

export function createMockOutput(mode: DemoMode, input: string, context?: MockContext): DemoOutput {
  const summary = input.slice(0, 48) || "未提供输入";
  const headings = context?.headings?.slice(0, 4) ?? [];
  const ctas = context?.ctas?.slice(0, 4) ?? [];
  const imageAlts = context?.imageAlts?.slice(0, 4) ?? [];

  const textSignals = [
    context?.title ? `页面标题：${context.title}` : null,
    context?.description ? `描述：${context.description}` : null,
    headings.length > 0 ? `标题结构：${headings.join(" / ")}` : null,
    ctas.length > 0 ? `CTA 文案：${ctas.join(" / ")}` : null
  ].filter(Boolean) as string[];

  const visualSignals = [
    typeof context?.imageCount === "number" ? `页面包含 ${context.imageCount} 张图片` : null,
    context?.ogImage ? "存在 OG 主图，可作为主视觉线索" : null,
    imageAlts.length > 0 ? `图片说明：${imageAlts.join(" / ")}` : null,
    mode === "screenshot" ? "当前输入为截图说明，需重点关注视觉层级与模块布局" : null
  ].filter(Boolean) as string[];

  const planDraft = `# plan.md

## 1. 项目背景
- 当前输入是 ${mode === "url" ? "URL" : mode === "screenshot" ? "页面截图" : "业务 Brief"}，系统需要将页面线索转换成研发可执行的需求解读。
- 本次识别到的需求类型为：数据分析后台 / 漏斗分析功能新增需求。

## 2. 项目目标
- 在数据看台中新增漏斗分析能力，承接转化过程分析场景。
- 支持通过动态查询表单配置漏斗步骤、时间范围和过滤条件。
- 输出列表与趋势图，并支持后续看板保存与复用。

## 3. 范围
### In Scope
- 数据看台新增漏斗入口
- 查询页面（动态表单）
- 展示页面（列表 + 折线图）
- 漏斗分析接口接入
- 漏斗看板保存 / 编辑

### Out of Scope
- 高级归因分析
- 导出能力
- 复杂权限体系

## 4. 阶段拆分
### Phase 1
- 新增漏斗入口
- 完成动态查询表单
- 完成列表与折线图展示

### Phase 2
- 支持漏斗看板保存与编辑
- 完善空状态、异常状态和查询校验

## 5. 关键里程碑
1. 查询表单与结果结构对齐
2. 漏斗接口跑通
3. 看板接入现有数据看台体系

## 6. 验收标准
- 用户可在数据看台进入漏斗页面。
- 动态表单可完成步骤新增、删除、编辑与校验。
- 查询后可稳定展示列表与折线图。
- 关键错误、空态、加载态可被正确识别。

## 7. 风险与依赖
- 需要先确认漏斗统计口径。
- 需要明确过滤条件组合规则与结果图表口径。
- 依赖事件列表、属性字段和漏斗分析接口按约定返回。

## 8. 埋点与数据口径
- 记录漏斗查询次数、步骤数、成功率、失败率。
- 记录用户是否保存漏斗看板。
- 明确图表与列表共用同一统计口径。
`;

  const specDraft = `# spec.md

## 1. 需求类型
- 数据分析后台 / 漏斗分析功能新增需求

## 2. 页面目标
- 在数据看台中新增漏斗页面，支持用户按时间、步骤和属性查询转化过程。

## 3. 页面结构
### 3.1 查询页面
- 日期范围
- 时间粒度
- 漏斗步骤
- 步骤属性

### 3.2 展示页面
- 列表结果
- 折线图趋势

## 4. 必须实现
- 数据看台新增漏斗入口
- 动态步骤表单
- 步骤属性配置
- 表格结果展示
- 折线图结果展示
- 漏斗看板类型接入

## 5. 接口建议
- GET 事件列表接口
- GET 属性字段接口
- POST 漏斗分析接口
- POST/PUT 看板保存接口

## 6. 状态与异常
- 初始空态
- 查询中 loading
- 无结果空态
- 查询失败错误提示
- 参数非法校验提示

## 7. 关键实现点
- 明确漏斗统计口径（用户/事件、顺序约束）
- 动态表单增删改校验
- 结果结构一次性返回给前端
- 处理空状态、异常状态、加载态

## 8. 边界条件
- 最大步骤数限制
- 空步骤或重复步骤处理
- 时间范围超限处理
- 属性条件为空或冲突时的行为

## 9. 待确认 / 缺失项
- 最大步骤数
- 过滤条件组合规则
- 折线图展示人数还是转化率
- 看板保存后是否允许编辑
- 是否支持导出

## 10. 研发拆解
### 前端
- 数据看台新增漏斗入口
- 动态查询表单
- 列表结果
- 折线图结果
- 新建看板弹窗扩展

### 后端
- 事件列表接口
- 属性字段接口
- 漏斗分析接口
- 看板保存与读取接口

### 测试
- 步骤增删校验
- 转化率计算正确性
- 空状态与异常状态
- 接口参数边界
`;

  return {
    analysisId: `APR-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    headline: `已完成${mode === "url" ? "URL" : mode === "screenshot" ? "截图" : "Brief"}需求解读：${summary}`,
    requirementType: "数据分析后台 / 漏斗分析功能新增需求",
    pageGoal: "在数据看台中新增漏斗分析能力，支持通过动态查询条件查看转化过程，并输出列表与趋势结果。",
    textSignals,
    visualSignals,
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
    statusAndErrors: [
      "初始空态：未配置查询条件时展示引导信息。",
      "查询中：按钮 loading，结果区 skeleton 或 loading 占位。",
      "无结果：明确提示当前条件下无漏斗数据。",
      "查询失败：展示错误原因与重试入口。"
    ],
    keyPoints: [
      "必须先确认漏斗统计口径：按用户还是按事件、是否要求顺序发生。",
      "动态表单要支持步骤新增、删除、校验与属性联动。",
      "后端最好一次性返回表格与图表需要的数据结构，避免前端二次拼装。",
      "结果区必须同时考虑空状态、加载中和查询失败状态。"
    ],
    boundaries: [
      "最大步骤数限制与超限提示。",
      "重复步骤是否允许，若允许如何去重。",
      "日期范围超限时的拦截策略。",
      "属性条件为空、冲突或非法时的处理方式。"
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
