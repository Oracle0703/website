"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

type DemoOutput = {
  headline: string;
  confidence: string;
  scores: ScoreItem[];
  issues: IssueItem[];
  recommendations: RecommendationItem[];
  backlog: string[];
};

const modeOptions: { id: DemoMode; label: string; helper: string }[] = [
  { id: "url", label: "URL", helper: "抓取公开页面结构与内容" },
  { id: "screenshot", label: "截图说明", helper: "基于截图定位布局与视觉问题" },
  { id: "brief", label: "业务 Brief", helper: "从目标与人群反推页面结构" }
];

const modePlaceholders: Record<DemoMode, string> = {
  url: "https://example.com/saas-pricing",
  screenshot: "上传首页首屏截图，当前 CTA 在首屏以下，首屏缺少信任背书。",
  brief: "目标：提升试用转化率；受众：中小团队；现状：跳出率高、表单完成率低。"
};

const painPoints = [
  {
    title: "评估标准不统一",
    description: "设计、运营、产品各自有判断，但缺少统一的页面评估框架。"
  },
  {
    title: "改版优先级难排序",
    description: "问题很多但资源有限，难以确定先做什么最有收益。"
  },
  {
    title: "输出难以直接执行",
    description: "建议停留在方向层面，无法直接拆分到设计和开发任务。"
  }
];

const workflow = [
  {
    title: "输入页面素材",
    description: "支持 URL、截图描述、业务 Brief 三种输入。"
  },
  {
    title: "自动分析关键问题",
    description: "输出信息架构、文案、视觉层级与转化路径诊断。"
  },
  {
    title: "生成结构化改版建议",
    description: "给出优先级、动作建议与预期收益，直接进入执行。"
  }
];

const values = [
  "统一跨角色评估语言，减少无效讨论",
  "明确 P0/P1/P2 改版优先级，提升迭代效率",
  "从问题识别到任务输出，缩短决策链路"
];

const scenes = [
  "SaaS 官网转化优化",
  "电商活动页改版",
  "品牌官网信息重组",
  "B2B 落地页线索提升",
  "产品发布页快速评估",
  "多版本页面 AB 评审"
];

const getMockOutput = (mode: DemoMode, input: string): DemoOutput => {
  const sourceLabel = mode === "url" ? "URL 页面" : mode === "screenshot" ? "页面截图" : "业务 Brief";
  const sourceValue = input.trim().length > 0 ? input.trim().slice(0, 42) : "未提供输入";

  return {
    headline: `已完成 ${sourceLabel} 分析：${sourceValue}`,
    confidence: "诊断置信度 81%（Mock）",
    scores: [
      { label: "信息清晰度", score: 62 },
      { label: "视觉层级", score: 57 },
      { label: "转化路径", score: 49 }
    ],
    issues: [
      {
        title: "首屏价值表达偏弱",
        severity: "高",
        evidence: "主标题偏抽象，用户 3 秒内难以理解核心收益",
        impact: "降低继续浏览意愿与首屏停留时长"
      },
      {
        title: "CTA 位置与文案不聚焦",
        severity: "高",
        evidence: "主要行动按钮不在首屏视觉中心，按钮文案泛化",
        impact: "点击率与转化率显著受限"
      },
      {
        title: "信任背书缺失",
        severity: "中",
        evidence: "缺少客户标识、案例数据与第三方认证信息",
        impact: "高意向用户决策周期延长"
      }
    ],
    recommendations: [
      {
        module: "Hero 首屏",
        action: "重写主标题为“对象 + 结果 + 时间”的利益型表达，并补充副标题场景化说明",
        priority: "P0",
        expectedImpact: "提升首屏理解速度与继续浏览率"
      },
      {
        module: "CTA 区域",
        action: "将主 CTA 上移至首屏可见区，文案改为“立即获取改版建议”",
        priority: "P0",
        expectedImpact: "提升 CTA 点击率"
      },
      {
        module: "信任模块",
        action: "在首屏下新增“客户/案例/数据”三栏背书区块",
        priority: "P1",
        expectedImpact: "降低决策疑虑，提升提交表单转化"
      },
      {
        module: "表单流程",
        action: "将表单字段由 6 项压缩为 3 项，补充进度与隐私提示",
        priority: "P1",
        expectedImpact: "降低填写负担，提升完成率"
      }
    ],
    backlog: [
      "任务 1（P0）：重构 Hero 标题 + 副标题文案",
      "任务 2（P0）：首屏内重排 CTA 与视觉焦点",
      "任务 3（P1）：新增客户背书模块与指标文案",
      "任务 4（P1）：精简表单字段并优化交互提示"
    ]
  };
};

export function AIPageAnalysisLandingClient() {
  const [mode, setMode] = useState<DemoMode>("url");
  const [input, setInput] = useState<string>(modePlaceholders.url);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<DemoOutput>(() => getMockOutput("url", modePlaceholders.url));

  const modeLabel = useMemo(() => modeOptions.find((option) => option.id === mode), [mode]);

  const handleChangeMode = (nextMode: DemoMode) => {
    setMode(nextMode);
    setInput(modePlaceholders[nextMode]);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setOutput(getMockOutput(mode, input));
      setIsGenerating(false);
    }, 900);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-14 sm:px-6 md:space-y-16 md:py-20">
      <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div className="space-y-5">
          <p className={EYEBROW_ACCENT}>Landing Project</p>
          <h1 className={TITLE_2XL}>AI 页面分析与改版方案助手</h1>
          <p className={`max-w-2xl ${TEXT_BASE_SECONDARY} leading-relaxed`}>
            输入 URL、截图说明或业务 Brief，即可生成结构化页面诊断与改版建议，让改版讨论从“感受”转向“可执行动作”。
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5"
            >
              立即体验 Demo
            </a>
            <a
              href="#sample"
              className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface"
            >
              查看分析样例
            </a>
          </div>
        </div>

        <div className="panel-surface relative p-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/15" />
          <div className="relative space-y-4">
            <p className={TEXT_SM_MUTED}>核心能力</p>
            <ul className="space-y-2 text-sm text-secondary">
              <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">多输入分析：URL / 截图 / Brief</li>
              <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">问题证据化：定位问题 + 影响说明</li>
              <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">结构化建议：优先级 + 改版动作 + 预期收益</li>
            </ul>
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
          <h2 className={TITLE_XL}>交互 Demo（Mock）</h2>
          <span className={TEXT_XS_MUTED}>无真实模型调用</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]" id="sample">
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
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-edge bg-base/35 text-secondary hover:border-edge-strong"
                    }`}
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
              className="mt-3 min-h-40 w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-secondary outline-none transition focus:border-accent"
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? "分析中..." : "生成分析建议"}
            </button>
          </div>

          <div className="panel-surface p-5">
            <p className={TEXT_SM_MUTED}>输出区</p>
            <h3 className={`mt-2 ${TITLE_LG}`}>{output.headline}</h3>
            <p className={TEXT_XS_MUTED}>{output.confidence}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {output.scores.map((score) => (
                <div key={score.label} className="rounded-lg border border-edge/70 bg-base/40 px-3 py-2">
                  <p className={TEXT_XS_MUTED}>{score.label}</p>
                  <p className="mt-1 text-base font-semibold text-primary">{score.score}/100</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2">
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

            <div className="mt-5 space-y-2">
              <p className={TEXT_SM_SECONDARY}>改版建议</p>
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

            <div className="mt-5 rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
              <p className={TEXT_SM_SECONDARY}>可执行 Backlog</p>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {output.backlog.map((task) => (
                  <li key={task} className="rounded border border-edge/60 bg-base/40 px-2 py-1">
                    {task}
                  </li>
                ))}
              </ul>
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
        <h2 className={TITLE_XL}>准备开始页面改版评估？</h2>
        <p className={`mt-2 max-w-2xl ${TEXT_SM_MUTED}`}>
          先用 Demo 验证分析结构，再进入真实项目评估流程，输出可执行的改版任务清单。
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
