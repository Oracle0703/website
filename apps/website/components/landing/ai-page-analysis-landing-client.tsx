"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../../lib/i18n";
import {
  EYEBROW_ACCENT,
  TEXT_BASE_SECONDARY,
  TEXT_SM_MUTED,
  TEXT_SM_SECONDARY,
  TEXT_XS_MUTED,
  TITLE_2XL,
  TITLE_BASE_SM_LG,
  TITLE_LG,
  TITLE_XL
} from "../../lib/typography";

type DemoMode = "url" | "screenshot" | "brief";
type Severity = "High" | "Medium" | "Low";
type Priority = "P0" | "P1" | "P2";
type StageStatus = "pending" | "running" | "done";

type ScoreItem = {
  label: string;
  score: number;
};

type IssueItem = {
  title: string;
  severity: Severity;
  evidence: string;
  impact: string;
};

type RecommendationItem = {
  module: string;
  action: string;
  priority: Priority;
  expectedImpact: string;
};

type ShowcaseCard = {
  module: string;
  before: string;
  after: string;
  metricLift: string;
};

type DeliveryPhase = {
  phase: string;
  focus: string;
  deliverables: string;
  timeline: string;
};

type BacklogTask = {
  task: string;
  owner: string;
  eta: string;
  priority: Priority;
};

type DemoOutput = {
  analysisId: string;
  generatedAt: string;
  headline: string;
  confidence: string;
  scores: ScoreItem[];
  issues: IssueItem[];
  recommendations: RecommendationItem[];
  showcaseCards: ShowcaseCard[];
  deliveryPhases: DeliveryPhase[];
  backlog: BacklogTask[];
};

type PipelineStage = {
  id: string;
  title: string;
  description: string;
  durationMs: number;
};

type AiPageAnalysisCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  demoPathTitle: string;
  demoPathItems: string[];
  workflowTitle: string;
  demoTitle: string;
  demoNote: string;
  inputTitle: string;
  inputHint: string;
  generateIdle: string;
  generateBusy: string;
  pipelineTitle: string;
  logTitle: string;
  emptyLog: string;
  resultTitle: string;
  emptyResult: string;
  issuesTitle: string;
  recommendationsTitle: string;
  showcaseTitle: string;
  deliveryTitle: string;
  backlogTitle: string;
  valueTitle: string;
  scenesTitle: string;
  finalTitle: string;
  finalDescription: string;
  finalDemoCta: string;
  finalContactCta: string;
  acceptedLog: string;
  doneLog: string;
  status: Record<StageStatus, string>;
  labels: {
    evidence: string;
    impact: string;
    action: string;
    expectedImpact: string;
    before: string;
    after: string;
    owner: string;
    eta: string;
    analysisId: string;
    generatedAt: string;
  };
};

const modeOptions: Record<Locale, { id: DemoMode; label: string; helper: string }[]> = {
  zh: [
    { id: "url", label: "URL", helper: "解析公开网页结构、文案与转化路径" },
    { id: "screenshot", label: "截图说明", helper: "根据页面截图线索定位层级与视觉问题" },
    { id: "brief", label: "业务 Brief", helper: "从目标受众与业务目标反推页面方案" }
  ],
  en: [
    { id: "url", label: "URL", helper: "Analyze public page structure, copy, and conversion paths" },
    { id: "screenshot", label: "Screenshot notes", helper: "Use visual clues to find hierarchy and layout issues" },
    { id: "brief", label: "Product brief", helper: "Work backward from audience and business goals" }
  ]
};

const modePlaceholders: Record<Locale, Record<DemoMode, string>> = {
  zh: {
    url: "https://example.com/saas-pricing",
    screenshot: "首页首屏截图：主 CTA 在首屏以下，卖点区与客户背书间隔太大，视觉焦点分散。",
    brief: "目标：2 周内提升试用申请率；受众：中型团队负责人；当前问题：首屏价值表达模糊，表单完成率低。"
  },
  en: {
    url: "https://example.com/saas-pricing",
    screenshot: "Homepage screenshot: the primary CTA sits below the fold, proof points appear late, and the visual focus is scattered.",
    brief: "Goal: improve trial requests within two weeks. Audience: mid-market team leads. Current issue: unclear hero value and weak form completion."
  }
};

const painPoints = {
  zh: [
    {
      title: "讨论偏主观",
      description: "改版讨论往往停留在“感觉不好”，缺少可复核的证据链。"
    },
    {
      title: "执行路径断层",
      description: "诊断和设计提案之间缺少中间层，团队难以快速推进到上线。"
    },
    {
      title: "作品说服力不足",
      description: "缺少完整演示流时，很难让团队或客户直观看到方案价值。"
    }
  ],
  en: [
    {
      title: "Subjective redesign debates",
      description: "Redesign reviews often stop at personal taste instead of a repeatable evidence chain."
    },
    {
      title: "Missing execution path",
      description: "Teams need a middle layer between diagnosis and design work before a redesign can ship."
    },
    {
      title: "Weak portfolio proof",
      description: "A complete demo flow makes the product thinking and delivery value easier to evaluate."
    }
  ]
};

const workflow = {
  zh: [
    {
      title: "输入页面素材",
      description: "选择 URL、截图说明或业务 Brief，提交待分析内容。"
    },
    {
      title: "运行诊断流水线",
      description: "依次完成解析、结构提取、问题诊断、改版方案生成。"
    },
    {
      title: "查看可执行结果",
      description: "输出评分、问题证据、改版蓝图与可交付任务清单。"
    }
  ],
  en: [
    {
      title: "Provide page material",
      description: "Start from a URL, screenshot notes, or a product brief."
    },
    {
      title: "Run the diagnosis pipeline",
      description: "Parse the input, extract structure, diagnose issues, and generate a redesign plan."
    },
    {
      title: "Review actionable output",
      description: "Get scores, evidence, recommendations, delivery phases, and backlog tasks."
    }
  ]
};

const values = {
  zh: [
    "展示“输入到交付”的完整链路，强化作品说服力",
    "统一产品/设计/运营评估口径，减少来回返工",
    "直接输出可排期任务，缩短改版落地周期"
  ],
  en: [
    "Show the full path from input to delivery-ready output",
    "Give product, design, and marketing teams a shared evaluation language",
    "Turn recommendations into backlog items that can be scheduled"
  ]
};

const scenes = {
  zh: [
    "SaaS 官网改版展示",
    "电商活动页体验诊断",
    "品牌官网信息架构重组",
    "B2B 落地页线索增长演示",
    "新品发布页方案评审",
    "代理商提案作品集演示"
  ],
  en: [
    "SaaS website redesign",
    "E-commerce campaign review",
    "Brand site information architecture",
    "B2B landing page conversion work",
    "Product launch page critique",
    "Agency proposal demo"
  ]
};

const pipelineStages: Record<Locale, PipelineStage[]> = {
  zh: [
    {
      id: "parse",
      title: "解析页面素材",
      description: "读取输入并锁定关键信息块",
      durationMs: 900
    },
    {
      id: "extract",
      title: "提取结构与层级",
      description: "识别首屏、卖点、背书、CTA 等区块关系",
      durationMs: 1100
    },
    {
      id: "diagnose",
      title: "诊断问题与影响",
      description: "标记高风险节点并估计转化影响",
      durationMs: 1000
    },
    {
      id: "plan",
      title: "生成改版方案",
      description: "输出优先级、动作清单与交付节奏",
      durationMs: 1100
    }
  ],
  en: [
    {
      id: "parse",
      title: "Parse page material",
      description: "Read the input and identify key content blocks",
      durationMs: 900
    },
    {
      id: "extract",
      title: "Extract structure",
      description: "Map hero, value props, proof, and CTA relationships",
      durationMs: 1100
    },
    {
      id: "diagnose",
      title: "Diagnose impact",
      description: "Flag high-impact issues and estimate conversion risk",
      durationMs: 1000
    },
    {
      id: "plan",
      title: "Generate redesign plan",
      description: "Return priorities, action items, and delivery rhythm",
      durationMs: 1100
    }
  ]
};

export const aiPageAnalysisCopy: Record<Locale, AiPageAnalysisCopy> = {
  zh: {
    eyebrow: "作品展示 / Product Demo",
    title: "AI 页面分析与改版方案助手",
    intro:
      "这是一个用于作品展示的完整演示页：输入页面素材后，系统按阶段完成解析、诊断与方案生成，最终输出可直接用于改版落地的结果集。",
    primaryCta: "开始完整演示",
    secondaryCta: "查看输出样例",
    demoPathTitle: "演示路径",
    demoPathItems: [
      "01 输入 URL / 截图说明 / Brief",
      "02 观察四阶段生成流水线",
      "03 查看诊断、改版蓝图、交付 Backlog"
    ],
    workflowTitle: "工作流",
    demoTitle: "交互 Demo（Mock Pipeline）",
    demoNote: "单页演示，不调用真实模型",
    inputTitle: "输入区",
    inputHint: "本次演示将串行执行 4 个阶段，完成后自动展示改版结果。",
    generateIdle: "生成完整改版演示",
    generateBusy: "生成中...",
    pipelineTitle: "生成流水线",
    logTitle: "过程日志",
    emptyLog: "等待输入并启动演示。",
    resultTitle: "结果区",
    emptyResult: "完成流水线后将在此展示诊断结果、改版蓝图与任务清单。",
    issuesTitle: "核心问题",
    recommendationsTitle: "改版蓝图",
    showcaseTitle: "改版后预期效果展示",
    deliveryTitle: "交付节奏",
    backlogTitle: "可执行 Backlog",
    valueTitle: "价值",
    scenesTitle: "适用场景",
    finalTitle: "准备开始完整作品演示？",
    finalDescription:
      "该页面已覆盖输入、生成流水线、输出蓝图与 Backlog 的完整链路，可直接作为“页面分析与改版方案助手”的展示版本。",
    finalDemoCta: "回到 Demo",
    finalContactCta: "联系沟通需求",
    acceptedLog: "已接收输入，诊断流水线启动",
    doneLog: "结果已生成，可继续切换输入重跑完整演示",
    status: {
      done: "完成",
      running: "进行中",
      pending: "等待"
    },
    labels: {
      evidence: "证据",
      impact: "影响",
      action: "动作",
      expectedImpact: "收益",
      before: "Before",
      after: "After",
      owner: "Owner",
      eta: "ETA",
      analysisId: "分析编号",
      generatedAt: "生成时间"
    }
  },
  en: {
    eyebrow: "Product Demo",
    title: "AI Page Analysis and Redesign Assistant",
    intro:
      "A portfolio-grade demo that turns page material into staged diagnosis, redesign recommendations, and delivery-ready backlog output.",
    primaryCta: "Start the demo",
    secondaryCta: "View sample output",
    demoPathTitle: "Demo path",
    demoPathItems: [
      "01 Provide a URL, screenshot notes, or product brief",
      "02 Watch the four-stage analysis pipeline",
      "03 Review diagnosis, redesign plan, and backlog"
    ],
    workflowTitle: "Workflow",
    demoTitle: "Interactive Demo (Mock Pipeline)",
    demoNote: "Single-page demo, no live model call",
    inputTitle: "Input",
    inputHint: "This demo runs four stages in sequence and then displays the redesign output.",
    generateIdle: "Generate redesign demo",
    generateBusy: "Generating...",
    pipelineTitle: "Generation pipeline",
    logTitle: "Process log",
    emptyLog: "Waiting for input to start the demo.",
    resultTitle: "Output",
    emptyResult: "The diagnosis, redesign plan, and backlog will appear here after the pipeline completes.",
    issuesTitle: "Key issues",
    recommendationsTitle: "Redesign plan",
    showcaseTitle: "Expected redesign impact",
    deliveryTitle: "Delivery phases",
    backlogTitle: "Actionable backlog",
    valueTitle: "Value",
    scenesTitle: "Use cases",
    finalTitle: "Ready to review the full product demo?",
    finalDescription:
      "This page covers the full path from input to pipeline, recommendations, and backlog output for the page analysis assistant.",
    finalDemoCta: "Back to demo",
    finalContactCta: "Discuss a project",
    acceptedLog: "Input received. Diagnosis pipeline started.",
    doneLog: "Output generated. You can change the input and rerun the demo.",
    status: {
      done: "Done",
      running: "Running",
      pending: "Waiting"
    },
    labels: {
      evidence: "Evidence",
      impact: "Impact",
      action: "Action",
      expectedImpact: "Expected impact",
      before: "Before",
      after: "After",
      owner: "Owner",
      eta: "ETA",
      analysisId: "Analysis ID",
      generatedAt: "Generated"
    }
  }
};

function formatTimestamp(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function buildStageLog(stageId: string, mode: DemoMode, locale: Locale): string {
  if (locale === "en") {
    if (stageId === "parse") {
      return mode === "url" ? "Captured main structure and core copy blocks" : "Read the input material and prepared context";
    }

    if (stageId === "extract") {
      return "Mapped hero value, proof, and conversion touchpoints";
    }

    if (stageId === "diagnose") {
      return "Identified high-impact issues and estimated affected scope";
    }

    return "Redesign blueprint and execution backlog are ready";
  }

  if (stageId === "parse") {
    return mode === "url" ? "已抓取页面主结构与核心文案块" : "已读取输入素材并完成上下文预处理";
  }

  if (stageId === "extract") {
    return "识别首屏价值表达、信任背书与转化触点的层级关系";
  }

  if (stageId === "diagnose") {
    return "已定位高影响问题并完成影响范围评估";
  }

  return "改版蓝图与执行 Backlog 已组装完成";
}

function getMockOutput(mode: DemoMode, input: string, locale: Locale): DemoOutput {
  if (locale === "en") {
    const sourceLabel = mode === "url" ? "URL page" : mode === "screenshot" ? "screenshot input" : "product brief";
    const sourceValue = input.trim().length > 0 ? input.trim().slice(0, 52) : "no input provided";

    return {
      analysisId: `APA-${Date.now().toString().slice(-6)}`,
      generatedAt: formatTimestamp(new Date(), locale),
      headline: `Generated redesign output from ${sourceLabel}: ${sourceValue}`,
      confidence: "84% confidence (Mock Pipeline)",
      scores: [
        { label: "Clarity", score: 64 },
        { label: "Visual hierarchy", score: 58 },
        { label: "Conversion path", score: 51 },
        { label: "Execution readiness", score: 79 }
      ],
      issues: [
        {
          title: "Abstract hero value proposition",
          severity: "High",
          evidence: "The headline does not name the audience or outcome, and the subheading lacks a measurable promise.",
          impact: "Visitors may not understand relevance within the first three seconds."
        },
        {
          title: "CTA focus is diluted",
          severity: "High",
          evidence: "The primary button is not visually dominant and secondary actions compete with it.",
          impact: "Key action clicks are likely diluted near the top of the funnel."
        },
        {
          title: "Trust proof appears too late",
          severity: "Medium",
          evidence: "Case studies, customer logos, and proof metrics sit too far down the page.",
          impact: "High-intent users do not see enough evidence before deciding whether to continue."
        }
      ],
      recommendations: [
        {
          module: "Hero",
          action: "Rewrite the headline around audience, result, and time-to-value, then add a scenario-specific subheading.",
          priority: "P0",
          expectedImpact: "Improve first-screen comprehension and scroll depth."
        },
        {
          module: "CTA area",
          action: "Move the primary CTA into the hero focus area and reduce secondary CTA weight.",
          priority: "P0",
          expectedImpact: "Increase exposure and clarity for the key action."
        },
        {
          module: "Trust section",
          action: "Move customer logos, case metrics, and testimonials closer to the hero.",
          priority: "P1",
          expectedImpact: "Reduce uncertainty before the first conversion decision."
        },
        {
          module: "Form flow",
          action: "Reduce the form to three fields and add an expected-time hint.",
          priority: "P1",
          expectedImpact: "Improve submission completion."
        }
      ],
      showcaseCards: [
        {
          module: "Hero information architecture",
          before: "Value proposition and CTA are separated, weakening visual focus.",
          after: "Headline, proof line, and primary CTA form one clear path.",
          metricLift: "Estimated hero CTA lift +18%"
        },
        {
          module: "Trust chain",
          before: "Proof appears late in the page.",
          after: "Customer, metric, and testimonial proof appear below the hero.",
          metricLift: "Estimated form conversion lift +11%"
        },
        {
          module: "Form experience",
          before: "Too many fields and no progress feedback.",
          after: "Three-field form with privacy and time hints.",
          metricLift: "Estimated completion lift +14%"
        }
      ],
      deliveryPhases: [
        {
          phase: "Phase 1",
          focus: "Hero and CTA rebuild",
          deliverables: "Headline rewrite, visual focus, CTA hierarchy",
          timeline: "Day 1-2"
        },
        {
          phase: "Phase 2",
          focus: "Trust module placement",
          deliverables: "Customer logos, proof metrics, testimonial component",
          timeline: "Day 3-4"
        },
        {
          phase: "Phase 3",
          focus: "Form simplification and launch validation",
          deliverables: "Field reduction, interaction hints, tracking validation",
          timeline: "Day 5-7"
        }
      ],
      backlog: [
        {
          task: "Rewrite hero headline and subheading",
          owner: "Product + copy",
          eta: "0.5d",
          priority: "P0"
        },
        {
          task: "Rework hero CTA styling and placement",
          owner: "Design + frontend",
          eta: "1d",
          priority: "P0"
        },
        {
          task: "Add trust proof component",
          owner: "Design + frontend",
          eta: "1.5d",
          priority: "P1"
        },
        {
          task: "Simplify form fields and validate tracking",
          owner: "Frontend + data",
          eta: "1d",
          priority: "P1"
        }
      ]
    };
  }

  const sourceLabel = mode === "url" ? "URL 页面" : mode === "screenshot" ? "截图素材" : "业务 Brief";
  const sourceValue = input.trim().length > 0 ? input.trim().slice(0, 52) : "未提供输入";

  return {
    analysisId: `APA-${Date.now().toString().slice(-6)}`,
    generatedAt: formatTimestamp(new Date(), locale),
    headline: `已完成 ${sourceLabel} 方案生成：${sourceValue}`,
    confidence: "置信度 84%（Mock Pipeline）",
    scores: [
      { label: "信息清晰度", score: 64 },
      { label: "视觉层级", score: 58 },
      { label: "转化路径", score: 51 },
      { label: "执行可落地", score: 79 }
    ],
    issues: [
      {
        title: "首屏价值表达抽象",
        severity: "High",
        evidence: "标题未体现受众与结果，副标题缺少可量化承诺",
        impact: "用户在 3 秒内难以确认页面是否与自身诉求相关"
      },
      {
        title: "CTA 焦点被分散",
        severity: "High",
        evidence: "主按钮不在视觉中心，且与次级按钮样式过于接近",
        impact: "关键行动点击率被稀释，漏斗首段流失偏高"
      },
      {
        title: "信任证据出现过晚",
        severity: "Medium",
        evidence: "案例、客户 Logo 与指标证明集中在页面中后段",
        impact: "高意向用户在关键决策前缺乏充分佐证"
      }
    ],
    recommendations: [
      {
        module: "Hero 首屏",
        action: "采用“对象 + 结果 + 时间”标题公式，并补充一句场景化副标题",
        priority: "P0",
        expectedImpact: "提升首屏理解速度与继续浏览率"
      },
      {
        module: "CTA 与动作区",
        action: "上移主 CTA 到首屏并强化对比度，次级 CTA 降权处理",
        priority: "P0",
        expectedImpact: "提升关键点击率与试用提交入口曝光"
      },
      {
        module: "信任背书区",
        action: "前置客户 Logo、案例数据与行业认证，形成连续证据链",
        priority: "P1",
        expectedImpact: "降低决策不确定性，缩短转化周期"
      },
      {
        module: "表单与收集流程",
        action: "字段压缩为 3 项并提供预计耗时提示，减少阻塞点",
        priority: "P1",
        expectedImpact: "提升提交完成率"
      }
    ],
    showcaseCards: [
      {
        module: "首屏信息架构",
        before: "卖点与按钮位置分离，视觉重心偏移",
        after: "价值标题、证明句与主 CTA 聚焦为单路径",
        metricLift: "预计首屏 CTA 点击率 +18%"
      },
      {
        module: "信任链路",
        before: "背书区块位于页面后段，出现时机偏晚",
        after: "在首屏下方加入“客户 + 指标 + 证言”三联块",
        metricLift: "预计表单转化率 +11%"
      },
      {
        module: "表单体验",
        before: "字段过多、无进度反馈",
        after: "三字段轻量表单 + 隐私与耗时提示",
        metricLift: "预计提交完成率 +14%"
      }
    ],
    deliveryPhases: [
      {
        phase: "Phase 1",
        focus: "首屏与 CTA 重构",
        deliverables: "标题重写、视觉焦点重排、按钮策略调整",
        timeline: "Day 1-2"
      },
      {
        phase: "Phase 2",
        focus: "信任模块前置",
        deliverables: "客户 Logo、案例指标、证言组件",
        timeline: "Day 3-4"
      },
      {
        phase: "Phase 3",
        focus: "表单压缩与上线验证",
        deliverables: "字段裁剪、交互提示、埋点验证",
        timeline: "Day 5-7"
      }
    ],
    backlog: [
      {
        task: "重写 Hero 标题与副标题",
        owner: "产品 + 文案",
        eta: "0.5d",
        priority: "P0"
      },
      {
        task: "首屏 CTA 样式与布局改造",
        owner: "设计 + 前端",
        eta: "1d",
        priority: "P0"
      },
      {
        task: "新增信任三联组件",
        owner: "设计 + 前端",
        eta: "1.5d",
        priority: "P1"
      },
      {
        task: "表单字段压缩与埋点验证",
        owner: "前端 + 数据",
        eta: "1d",
        priority: "P1"
      }
    ]
  };
}

export function AIPageAnalysisLandingClient({ locale }: { locale: Locale }) {
  const copy = aiPageAnalysisCopy[locale];
  const currentModeOptions = modeOptions[locale];
  const currentModePlaceholders = modePlaceholders[locale];
  const currentPainPoints = painPoints[locale];
  const currentWorkflow = workflow[locale];
  const currentValues = values[locale];
  const currentScenes = scenes[locale];
  const currentPipelineStages = pipelineStages[locale];
  const [mode, setMode] = useState<DemoMode>("url");
  const [input, setInput] = useState<string>(currentModePlaceholders.url);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [completedStageCount, setCompletedStageCount] = useState(0);
  const [stageLogs, setStageLogs] = useState<string[]>([]);
  const [output, setOutput] = useState<DemoOutput | null>(null);

  const timersRef = useRef<number[]>([]);

  const modeLabel = useMemo(
    () => currentModeOptions.find((option) => option.id === mode),
    [currentModeOptions, mode]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const progressValue = output ? 100 : Math.round((completedStageCount / currentPipelineStages.length) * 100);

  const getStatus = (index: number): StageStatus => {
    if (index < completedStageCount) {
      return "done";
    }

    if (isGenerating && index === activeStageIndex) {
      return "running";
    }

    return "pending";
  };

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const handleChangeMode = (nextMode: DemoMode) => {
    setMode(nextMode);
    setInput(currentModePlaceholders[nextMode]);
  };

  const handleGenerate = () => {
    const effectiveInput = input.trim().length > 0 ? input.trim() : currentModePlaceholders[mode];

    if (!input.trim()) {
      setInput(effectiveInput);
    }

    clearTimers();
    setIsGenerating(true);
    setActiveStageIndex(0);
    setCompletedStageCount(0);
    setStageLogs([copy.acceptedLog]);
    setOutput(null);

    let elapsed = 0;
    currentPipelineStages.forEach((stage, index) => {
      elapsed += stage.durationMs;
      const timer = window.setTimeout(() => {
        setCompletedStageCount(index + 1);
        setActiveStageIndex(index + 1 < currentPipelineStages.length ? index + 1 : null);
        setStageLogs((prev) => [...prev, `Step ${index + 1} ${stage.title}: ${buildStageLog(stage.id, mode, locale)}`]);
      }, elapsed);
      timersRef.current.push(timer);
    });

    const doneTimer = window.setTimeout(() => {
      setOutput(getMockOutput(mode, effectiveInput, locale));
      setIsGenerating(false);
      setStageLogs((prev) => [...prev, copy.doneLog]);
    }, elapsed + 360);

    timersRef.current.push(doneTimer);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-14 sm:px-6 md:space-y-16 md:py-20">
      <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div className="space-y-5">
          <p className={EYEBROW_ACCENT}>{copy.eyebrow}</p>
          <h1 className={TITLE_2XL}>{copy.title}</h1>
          <p className={`max-w-2xl ${TEXT_BASE_SECONDARY} leading-relaxed`}>
            {copy.intro}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5"
            >
              {copy.primaryCta}
            </a>
            <a
              href="#sample"
              className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface"
            >
              {copy.secondaryCta}
            </a>
          </div>
        </div>

        <div className="panel-surface relative p-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 via-transparent to-cyan-400/10" />
          <div className="relative space-y-4">
            <p className={TEXT_SM_MUTED}>{copy.demoPathTitle}</p>
            <ol className="space-y-2 text-sm text-secondary">
              {copy.demoPathItems.map((item) => (
                <li key={item} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {currentPainPoints.map((item) => (
          <article key={item.title} className="panel-surface p-5">
            <h2 className={TITLE_BASE_SM_LG}>{item.title}</h2>
            <p className={`mt-2 ${TEXT_SM_MUTED} leading-relaxed`}>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className={TITLE_XL}>{copy.workflowTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {currentWorkflow.map((step, index) => (
            <article key={step.title} className="panel-surface p-5">
              <p className={TEXT_XS_MUTED}>Step {index + 1}</p>
              <h3 className={`mt-2 ${TITLE_BASE_SM_LG}`}>{step.title}</h3>
              <p className={`mt-2 ${TEXT_SM_MUTED}`}>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className={TITLE_XL}>{copy.demoTitle}</h2>
          <span className={TEXT_XS_MUTED}>{copy.demoNote}</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]" id="sample">
          <div className="panel-surface p-5">
            <p className={TEXT_SM_MUTED}>{copy.inputTitle}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {currentModeOptions.map((option) => {
                const active = option.id === mode;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleChangeMode(option.id)}
                    disabled={isGenerating}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-edge bg-base/35 text-secondary hover:border-edge-strong"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className={`mt-3 ${TEXT_XS_MUTED}`}>{modeLabel?.helper}</p>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isGenerating}
              className="mt-3 min-h-40 w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-secondary outline-none transition focus:border-accent"
            />

            <div className="mt-4 rounded-xl border border-edge/70 bg-base/35 p-3">
              <p className={TEXT_XS_MUTED}>{copy.inputHint}</p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? copy.generateBusy : copy.generateIdle}
            </button>
          </div>

          <div className="space-y-4">
            <div className="panel-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <p className={TEXT_SM_MUTED}>{copy.pipelineTitle}</p>
                <span className={TEXT_XS_MUTED}>{progressValue}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-base/70">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                />
              </div>

              <div className="mt-4 space-y-2">
                {currentPipelineStages.map((stage, index) => {
                  const status = getStatus(index);
                  const statusClass =
                    status === "done"
                      ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-300"
                      : status === "running"
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-edge/70 bg-base/35 text-muted";

                  return (
                    <div key={stage.id} className={`rounded-lg border px-3 py-2 ${statusClass}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{stage.title}</p>
                        <span className="text-xs">{copy.status[status]}</span>
                      </div>
                      <p className="mt-1 text-xs opacity-90">{stage.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg border border-edge/70 bg-base/40 p-3">
                <p className={TEXT_XS_MUTED}>{copy.logTitle}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {stageLogs.length === 0 ? (
                    <li>{copy.emptyLog}</li>
                  ) : (
                    stageLogs.map((log, index) => (
                      <li key={`${log}-${index}`} className="rounded border border-edge/50 bg-base/60 px-2 py-1">
                        {log}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="panel-surface p-5">
              <p className={TEXT_SM_MUTED}>{copy.resultTitle}</p>

              {!output ? (
                <div className="mt-3 rounded-xl border border-dashed border-edge-strong bg-base/30 p-4">
                  <p className={TEXT_SM_SECONDARY}>{copy.emptyResult}</p>
                </div>
              ) : (
                <div className="mt-2 space-y-5">
                  <div>
                    <h3 className={TITLE_LG}>{output.headline}</h3>
                    <p className={TEXT_XS_MUTED}>
                      {output.confidence} · {copy.labels.analysisId} {output.analysisId} · {copy.labels.generatedAt} {output.generatedAt}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {output.scores.map((score) => (
                      <div key={score.label} className="rounded-lg border border-edge/70 bg-base/40 px-3 py-2">
                        <p className={TEXT_XS_MUTED}>{score.label}</p>
                        <p className="mt-1 text-base font-semibold text-primary">{score.score}/100</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>{copy.issuesTitle}</p>
                    {output.issues.map((issue) => (
                      <article key={issue.title} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{issue.title}</h4>
                          <span className="rounded-full border border-edge px-2 py-0.5 text-xs text-muted">{issue.severity}</span>
                        </div>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>{copy.labels.evidence}: {issue.evidence}</p>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>{copy.labels.impact}: {issue.impact}</p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>{copy.recommendationsTitle}</p>
                    {output.recommendations.map((item) => (
                      <article key={`${item.module}-${item.action}`} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{item.module}</h4>
                          <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                            {item.priority}
                          </span>
                        </div>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>{copy.labels.action}: {item.action}</p>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>{copy.labels.expectedImpact}: {item.expectedImpact}</p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>{copy.showcaseTitle}</p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {output.showcaseCards.map((card) => (
                        <article key={card.module} className="rounded-lg border border-edge/70 bg-base/35 p-3">
                          <h4 className="text-sm font-semibold text-primary">{card.module}</h4>
                          <p className={`mt-1 ${TEXT_XS_MUTED}`}>{copy.labels.before}: {card.before}</p>
                          <p className={`mt-1 ${TEXT_XS_MUTED}`}>{copy.labels.after}: {card.after}</p>
                          <p className="mt-2 text-xs font-semibold text-accent">{card.metricLift}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>{copy.deliveryTitle}</p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {output.deliveryPhases.map((phase) => (
                        <article key={phase.phase} className="rounded-lg border border-edge/70 bg-base/35 p-3">
                          <p className="text-xs text-muted">{phase.phase}</p>
                          <h4 className="mt-1 text-sm font-semibold text-primary">{phase.focus}</h4>
                          <p className={`mt-1 ${TEXT_XS_MUTED}`}>{phase.deliverables}</p>
                          <p className="mt-2 text-xs font-semibold text-accent">{phase.timeline}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                    <p className={TEXT_SM_SECONDARY}>{copy.backlogTitle}</p>
                    <div className="mt-2 space-y-1 text-xs text-muted">
                      {output.backlog.map((task) => (
                        <div key={task.task} className="rounded border border-edge/60 bg-base/40 px-2 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-secondary">{task.task}</p>
                            <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                              {task.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted">
                            {copy.labels.owner}: {task.owner} · {copy.labels.eta}: {task.eta}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={TITLE_XL}>{copy.valueTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {currentValues.map((item) => (
            <div key={item} className="panel-surface p-5 text-sm text-secondary">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={TITLE_XL}>{copy.scenesTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {currentScenes.map((scene) => (
            <span key={scene} className="rounded-full border border-edge-strong bg-surface/70 px-3 py-1.5 text-xs text-secondary">
              {scene}
            </span>
          ))}
        </div>
      </section>

      <section className="panel-surface p-6">
        <h2 className={TITLE_XL}>{copy.finalTitle}</h2>
        <p className={`mt-2 max-w-2xl ${TEXT_SM_MUTED}`}>
          {copy.finalDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="#demo"
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            {copy.finalDemoCta}
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-4 py-2 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface"
          >
            {copy.finalContactCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
