"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { modePlaceholders, workflowStages, type DemoMode, type DemoOutput } from "../../lib/demo-data";

const modeOptions: { id: DemoMode; label: string; helper: string }[] = [
  { id: "url", label: "URL", helper: "解析公开网页结构、文案与转化路径" },
  { id: "screenshot", label: "截图说明", helper: "根据页面截图线索定位层级与视觉问题" },
  { id: "brief", label: "业务 Brief", helper: "从目标受众与业务目标反推页面方案" }
];

export function LandingClient() {
  const [mode, setMode] = useState<DemoMode>("url");
  const [input, setInput] = useState(modePlaceholders.url);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [completedStages, setCompletedStages] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [output, setOutput] = useState<DemoOutput | null>(null);
  const timersRef = useRef<number[]>([]);

  const progressValue = output ? 100 : Math.round((completedStages / workflowStages.length) * 100);
  const modeMeta = useMemo(() => modeOptions.find((item) => item.id === mode), [mode]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const resetTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const handleModeChange = (nextMode: DemoMode) => {
    setMode(nextMode);
    setInput(modePlaceholders[nextMode]);
  };

  const handleGenerate = () => {
    const actualInput = input.trim() || modePlaceholders[mode];
    if (!input.trim()) setInput(actualInput);

    resetTimers();
    setIsGenerating(true);
    setActiveStage(0);
    setCompletedStages(0);
    setLogs(["已接收输入，准备启动页面诊断流程"]);
    setOutput(null);

    let elapsed = 0;
    workflowStages.forEach((stage, index) => {
      elapsed += 900 + index * 120;
      const timer = window.setTimeout(() => {
        setCompletedStages(index + 1);
        setActiveStage(index + 1 < workflowStages.length ? index + 1 : null);
        setLogs((prev) => [...prev, `Step ${index + 1}：${stage}`]);
      }, elapsed);
      timersRef.current.push(timer);
    });

    const doneTimer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/demo", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode, input: actualInput })
        });
        const payload = (await response.json()) as { data?: DemoOutput };
        setOutput(payload.data ?? null);
        setLogs((prev) => [...prev, "已生成结构化改版方案与执行清单"]);
      } catch {
        setLogs((prev) => [...prev, "生成服务暂不可用，请稍后重试"]);
      } finally {
        setIsGenerating(false);
      }
    }, elapsed + 400);
    timersRef.current.push(doneTimer);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-14 sm:px-6 md:space-y-16 md:py-20">
      <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">独立产品 / company-ready</p>
          <h1 className="text-3xl font-semibold text-primary sm:text-4xl">AI 页面分析与改版方案助手</h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            输入 URL、截图说明或业务 Brief，体验完整的页面分析、问题诊断和改版方案生成流程。
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#demo" className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5">开始完整演示</a>
            <a href="#specs" className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface">查看产品结构</a>
          </div>
        </div>
        <div className="panel-surface p-6">
          <p className="text-sm text-muted">核心输出</p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">页面定位与问题证据</li>
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">改版蓝图与优先级建议</li>
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">交付节奏与执行 Backlog</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["讨论偏主观", "缺少统一证据链，改版意见很难收敛。"],
          ["执行路径断层", "从问题诊断到实际设计开发之间缺一个中间层。"],
          ["展示说服力不足", "没有完整演示流，产品价值很难被一眼看懂。"]
        ].map(([title, desc]) => (
          <article key={title} className="panel-surface p-5">
            <h2 className="text-base font-semibold text-primary sm:text-lg">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          </article>
        ))}
      </section>

      <section id="specs" className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">工作流</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["输入页面素材", "URL、截图说明、业务 Brief 三种输入方式。"],
            ["运行分析流水线", "依次完成解析、提取、诊断与方案生成。"],
            ["查看可执行结果", "输出评分、问题、蓝图与交付清单。"]
          ].map(([title, desc], index) => (
            <article key={title} className="panel-surface p-5">
              <p className="text-xs text-muted">Step {index + 1}</p>
              <h3 className="mt-2 text-base font-semibold text-primary sm:text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-primary">交互 Demo</h2>
          <span className="text-xs text-muted">单页 Mock 流程</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="panel-surface p-5">
            <p className="text-sm text-muted">输入区</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modeOptions.map((option) => {
                const active = option.id === mode;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleModeChange(option.id)}
                    disabled={isGenerating}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active ? "border-accent bg-accent/15 text-accent" : "border-edge bg-base/35 text-secondary"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted">{modeMeta?.helper}</p>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isGenerating}
              className="mt-3 min-h-40 w-full rounded-xl border border-edge bg-base/60 px-3 py-2 text-sm text-secondary outline-none transition focus:border-accent"
            />
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
                <p className="text-sm text-muted">生成流水线</p>
                <span className="text-xs text-muted">{progressValue}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-base/70">
                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progressValue}%` }} />
              </div>
              <div className="mt-4 space-y-2">
                {workflowStages.map((stage, index) => {
                  const done = index < completedStages;
                  const running = isGenerating && index === activeStage;
                  return (
                    <div
                      key={stage}
                      className={`rounded-lg border px-3 py-2 ${done ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-300" : running ? "border-accent/60 bg-accent/10 text-accent" : "border-edge/70 bg-base/35 text-muted"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{stage}</p>
                        <span className="text-xs">{done ? "完成" : running ? "进行中" : "等待"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-lg border border-edge/70 bg-base/40 p-3">
                <p className="text-xs text-muted">过程日志</p>
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {logs.length === 0 ? <li>等待输入并启动演示。</li> : logs.map((log, index) => <li key={`${log}-${index}`} className="rounded border border-edge/50 bg-base/60 px-2 py-1">{log}</li>)}
                </ul>
              </div>
            </div>

            <div className="panel-surface p-5">
              <p className="text-sm text-muted">结果区</p>
              {!output ? (
                <div className="mt-3 rounded-xl border border-dashed border-edge-strong bg-base/30 p-4 text-sm text-secondary">完成生成后，将在这里展示诊断结果、改版建议和执行 Backlog。</div>
              ) : (
                <div className="mt-3 space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{output.headline}</h3>
                    <p className="text-xs text-muted">分析编号 {output.analysisId} · 生成时间 {output.generatedAt}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {output.scores.map((score) => (
                      <div key={score.label} className="rounded-lg border border-edge/70 bg-base/40 px-3 py-2">
                        <p className="text-xs text-muted">{score.label}</p>
                        <p className="mt-1 text-base font-semibold text-primary">{score.score}/100</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-secondary">核心问题</p>
                    {output.issues.map((issue) => (
                      <article key={issue.title} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{issue.title}</h4>
                          <span className="rounded-full border border-edge px-2 py-0.5 text-xs text-muted">{issue.severity}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">证据：{issue.evidence}</p>
                        <p className="mt-1 text-xs text-muted">影响：{issue.impact}</p>
                      </article>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-secondary">改版蓝图</p>
                    {output.recommendations.map((item) => (
                      <article key={`${item.module}-${item.action}`} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{item.module}</h4>
                          <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{item.priority}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">动作：{item.action}</p>
                        <p className="mt-1 text-xs text-muted">收益：{item.expectedImpact}</p>
                      </article>
                    ))}
                  </div>
                  <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                    <p className="text-sm text-secondary">执行 Backlog</p>
                    <div className="mt-2 space-y-1 text-xs text-muted">
                      {output.backlog.map((task) => (
                        <div key={task.task} className="rounded border border-edge/60 bg-base/40 px-2 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-secondary">{task.task}</p>
                            <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">{task.priority}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted">Owner: {task.owner} · ETA: {task.eta}</p>
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
        <h2 className="text-xl font-semibold text-primary">价值</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "展示完整输入到交付链路，强化作品说服力",
            "统一产品/设计/运营的评估口径",
            "从建议直接过渡到可执行任务"
          ].map((item) => (
            <div key={item} className="panel-surface p-5 text-sm text-secondary">{item}</div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">适用场景</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "SaaS 官网改版",
            "电商活动页诊断",
            "品牌官网重组",
            "B2B 落地页优化",
            "发布页方案评审",
            "提案作品展示"
          ].map((scene) => (
            <span key={scene} className="rounded-full border border-edge-strong bg-surface/70 px-3 py-1.5 text-xs text-secondary">{scene}</span>
          ))}
        </div>
      </section>

      <section className="panel-surface p-6">
        <h2 className="text-xl font-semibold text-primary">准备开始完整体验？</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">当前版本已经具备独立项目骨架、产品文档和完整 Demo 流程，可继续接入真实分析服务。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#demo" className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">回到 Demo</a>
        </div>
      </section>
    </main>
  );
}
