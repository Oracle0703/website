"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
type Severity = "高" | "中" | "低";
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

const modeOptions: { id: DemoMode; label: string; helper: string }[] = [
  { id: "url", label: "URL", helper: "解析公开网页结构、文案与转化路径" },
  { id: "screenshot", label: "截图说明", helper: "根据页面截图线索定位层级与视觉问题" },
  { id: "brief", label: "业务 Brief", helper: "从目标受众与业务目标反推页面方案" }
];

const modePlaceholders: Record<DemoMode, string> = {
  url: "https://example.com/saas-pricing",
  screenshot: "首页首屏截图：主 CTA 在首屏以下，卖点区与客户背书间隔太大，视觉焦点分散。",
  brief: "目标：2 周内提升试用申请率；受众：中型团队负责人；当前问题：首屏价值表达模糊，表单完成率低。"
};

const painPoints = [
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
];

const workflow = [
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
];

const values = [
  "展示“输入到交付”的完整链路，强化作品说服力",
  "统一产品/设计/运营评估口径，减少来回返工",
  "直接输出可排期任务，缩短改版落地周期"
];

const scenes = [
  "SaaS 官网改版展示",
  "电商活动页体验诊断",
  "品牌官网信息架构重组",
  "B2B 落地页线索增长演示",
  "新品发布页方案评审",
  "代理商提案作品集演示"
];

const pipelineStages: PipelineStage[] = [
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
];

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function buildStageLog(stageId: string, mode: DemoMode): string {
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

function getMockOutput(mode: DemoMode, input: string): DemoOutput {
  const sourceLabel = mode === "url" ? "URL 页面" : mode === "screenshot" ? "截图素材" : "业务 Brief";
  const sourceValue = input.trim().length > 0 ? input.trim().slice(0, 52) : "未提供输入";

  return {
    analysisId: `APA-${Date.now().toString().slice(-6)}`,
    generatedAt: formatTimestamp(new Date()),
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
        severity: "高",
        evidence: "标题未体现受众与结果，副标题缺少可量化承诺",
        impact: "用户在 3 秒内难以确认页面是否与自身诉求相关"
      },
      {
        title: "CTA 焦点被分散",
        severity: "高",
        evidence: "主按钮不在视觉中心，且与次级按钮样式过于接近",
        impact: "关键行动点击率被稀释，漏斗首段流失偏高"
      },
      {
        title: "信任证据出现过晚",
        severity: "中",
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

export function AIPageAnalysisLandingClient() {
  const [mode, setMode] = useState<DemoMode>("url");
  const [input, setInput] = useState<string>(modePlaceholders.url);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [completedStageCount, setCompletedStageCount] = useState(0);
  const [stageLogs, setStageLogs] = useState<string[]>([]);
  const [output, setOutput] = useState<DemoOutput | null>(null);

  const timersRef = useRef<number[]>([]);

  const modeLabel = useMemo(() => modeOptions.find((option) => option.id === mode), [mode]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const progressValue = output ? 100 : Math.round((completedStageCount / pipelineStages.length) * 100);

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
    setInput(modePlaceholders[nextMode]);
  };

  const handleGenerate = () => {
    const effectiveInput = input.trim().length > 0 ? input.trim() : modePlaceholders[mode];

    if (!input.trim()) {
      setInput(effectiveInput);
    }

    clearTimers();
    setIsGenerating(true);
    setActiveStageIndex(0);
    setCompletedStageCount(0);
    setStageLogs(["已接收输入，诊断流水线启动"]);
    setOutput(null);

    let elapsed = 0;
    pipelineStages.forEach((stage, index) => {
      elapsed += stage.durationMs;
      const timer = window.setTimeout(() => {
        setCompletedStageCount(index + 1);
        setActiveStageIndex(index + 1 < pipelineStages.length ? index + 1 : null);
        setStageLogs((prev) => [...prev, `Step ${index + 1} ${stage.title}：${buildStageLog(stage.id, mode)}`]);
      }, elapsed);
      timersRef.current.push(timer);
    });

    const doneTimer = window.setTimeout(() => {
      setOutput(getMockOutput(mode, effectiveInput));
      setIsGenerating(false);
      setStageLogs((prev) => [...prev, "结果已生成，可继续切换输入重跑完整演示"]);
    }, elapsed + 360);

    timersRef.current.push(doneTimer);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-14 sm:px-6 md:space-y-16 md:py-20">
      <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div className="space-y-5">
          <p className={EYEBROW_ACCENT}>作品展示 / Product Demo</p>
          <h1 className={TITLE_2XL}>AI 页面分析与改版方案助手</h1>
          <p className={`max-w-2xl ${TEXT_BASE_SECONDARY} leading-relaxed`}>
            这是一个用于作品展示的完整演示页：输入页面素材后，系统按阶段完成解析、诊断与方案生成，最终输出可直接用于改版落地的结果集。
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5"
            >
              开始完整演示
            </a>
            <a
              href="#sample"
              className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface"
            >
              查看输出样例
            </a>
          </div>
        </div>

        <div className="panel-surface relative p-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 via-transparent to-cyan-400/10" />
          <div className="relative space-y-4">
            <p className={TEXT_SM_MUTED}>演示路径</p>
            <ol className="space-y-2 text-sm text-secondary">
              <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">01 输入 URL / 截图说明 / Brief</li>
              <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">02 观察四阶段生成流水线</li>
              <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">03 查看诊断、改版蓝图、交付 Backlog</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {painPoints.map((item) => (
          <article key={item.title} className="panel-surface p-5">
            <h2 className={TITLE_BASE_SM_LG}>{item.title}</h2>
            <p className={`mt-2 ${TEXT_SM_MUTED} leading-relaxed`}>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className={TITLE_XL}>工作流</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {workflow.map((step, index) => (
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
          <h2 className={TITLE_XL}>交互 Demo（Mock Pipeline）</h2>
          <span className={TEXT_XS_MUTED}>单页演示，不调用真实模型</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]" id="sample">
          <div className="panel-surface p-5">
            <p className={TEXT_SM_MUTED}>输入区</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modeOptions.map((option) => {
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
              <p className={TEXT_XS_MUTED}>本次演示将串行执行 4 个阶段，完成后自动展示改版结果。</p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? "生成中..." : "生成完整改版演示"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="panel-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <p className={TEXT_SM_MUTED}>生成流水线</p>
                <span className={TEXT_XS_MUTED}>{progressValue}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-base/70">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                />
              </div>

              <div className="mt-4 space-y-2">
                {pipelineStages.map((stage, index) => {
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
                        <span className="text-xs">{status === "done" ? "完成" : status === "running" ? "进行中" : "等待"}</span>
                      </div>
                      <p className="mt-1 text-xs opacity-90">{stage.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg border border-edge/70 bg-base/40 p-3">
                <p className={TEXT_XS_MUTED}>过程日志</p>
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {stageLogs.length === 0 ? (
                    <li>等待输入并启动演示。</li>
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
              <p className={TEXT_SM_MUTED}>结果区</p>

              {!output ? (
                <div className="mt-3 rounded-xl border border-dashed border-edge-strong bg-base/30 p-4">
                  <p className={TEXT_SM_SECONDARY}>完成流水线后将在此展示诊断结果、改版蓝图与任务清单。</p>
                </div>
              ) : (
                <div className="mt-2 space-y-5">
                  <div>
                    <h3 className={TITLE_LG}>{output.headline}</h3>
                    <p className={TEXT_XS_MUTED}>
                      {output.confidence} · 分析编号 {output.analysisId} · 生成时间 {output.generatedAt}
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
                    <p className={TEXT_SM_SECONDARY}>核心问题</p>
                    {output.issues.map((issue) => (
                      <article key={issue.title} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{issue.title}</h4>
                          <span className="rounded-full border border-edge px-2 py-0.5 text-xs text-muted">{issue.severity}</span>
                        </div>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>证据：{issue.evidence}</p>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>影响：{issue.impact}</p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>改版蓝图</p>
                    {output.recommendations.map((item) => (
                      <article key={`${item.module}-${item.action}`} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{item.module}</h4>
                          <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                            {item.priority}
                          </span>
                        </div>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>动作：{item.action}</p>
                        <p className={`mt-1 ${TEXT_XS_MUTED}`}>收益：{item.expectedImpact}</p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>改版后预期效果展示</p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {output.showcaseCards.map((card) => (
                        <article key={card.module} className="rounded-lg border border-edge/70 bg-base/35 p-3">
                          <h4 className="text-sm font-semibold text-primary">{card.module}</h4>
                          <p className={`mt-1 ${TEXT_XS_MUTED}`}>Before：{card.before}</p>
                          <p className={`mt-1 ${TEXT_XS_MUTED}`}>After：{card.after}</p>
                          <p className="mt-2 text-xs font-semibold text-accent">{card.metricLift}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className={TEXT_SM_SECONDARY}>交付节奏</p>
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
                    <p className={TEXT_SM_SECONDARY}>可执行 Backlog</p>
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
                            Owner: {task.owner} · ETA: {task.eta}
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
        <h2 className={TITLE_XL}>价值</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {values.map((item) => (
            <div key={item} className="panel-surface p-5 text-sm text-secondary">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={TITLE_XL}>适用场景</h2>
        <div className="flex flex-wrap gap-2">
          {scenes.map((scene) => (
            <span key={scene} className="rounded-full border border-edge-strong bg-surface/70 px-3 py-1.5 text-xs text-secondary">
              {scene}
            </span>
          ))}
        </div>
      </section>

      <section className="panel-surface p-6">
        <h2 className={TITLE_XL}>准备开始完整作品演示？</h2>
        <p className={`mt-2 max-w-2xl ${TEXT_SM_MUTED}`}>
          该页面已覆盖输入、生成流水线、输出蓝图与 Backlog 的完整链路，可直接作为“页面分析与改版方案助手”的展示版本。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="#demo"
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            回到 Demo
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-4 py-2 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface"
          >
            联系沟通需求
          </Link>
        </div>
      </section>
    </main>
  );
}
