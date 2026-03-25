"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { modePlaceholders, workflowStages, type DemoMode, type DemoOutput } from "../../lib/demo-data";

const modeOptions: { id: DemoMode; label: string; helper: string }[] = [
  { id: "url", label: "URL", helper: "读取网页地址，判断页面目标与承接能力。" },
  { id: "screenshot", label: "截图说明", helper: "基于页面截图和线索识别需求类型与缺失项。" },
  { id: "brief", label: "业务 Brief", helper: "从业务目标和背景出发推导页面需要承载的能力。" }
];

export function LandingClient() {
  const [mode, setMode] = useState<DemoMode>("url");
  const [input, setInput] = useState(modePlaceholders.url);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [completedStages, setCompletedStages] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [output, setOutput] = useState<DemoOutput | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
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

  const flashFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2200);
  };

  const copyDraft = async (content: string, kind: "plan" | "spec") => {
    try {
      await navigator.clipboard.writeText(content);
      flashFeedback(`${kind}.md 已复制`);
    } catch {
      flashFeedback(`复制 ${kind}.md 失败`);
    }
  };

  const downloadDraft = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    flashFeedback(`${filename} 已导出`);
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
    setLogs(["已接收输入，准备启动需求解读流程"]);
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
        setLogs((prev) => [...prev, "已输出研发可执行的需求解读结果"]);
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">独立产品 / requirement-ready</p>
          <h1 className="text-3xl font-semibold text-primary sm:text-4xl">AI 页面需求分析助手</h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            给我一个 URL、页面截图或业务 Brief，我帮你解读这个页面的产运需求、必须实现、关键实现点和缺失项，并直接生成可继续加工的 plan/spec 草稿。
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#demo" className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5">开始完整演示</a>
            <a href="#specs" className="inline-flex items-center rounded-full border border-edge-strong bg-surface/75 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-surface">查看输出结构</a>
          </div>
          {feedback ? <p className="text-sm text-accent">{feedback}</p> : null}
        </div>
        <div className="panel-surface p-6">
          <p className="text-sm text-muted">核心输出</p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">需求类型与页面目标</li>
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">产运需求、必须实现、接口建议</li>
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">关键实现点、PRD 缺失项、研发拆解</li>
            <li className="rounded-lg border border-edge/70 bg-base/35 px-3 py-2">`plan.md` / `spec.md` 草稿</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["需求往往只在图里", "截图、草图和口头描述很多，但真正可开发的信息不足。"],
          ["解读容易偏主观", "产运设计研发对同一页面理解不一致，推动效率低。"],
          ["PRD 缺口经常后补", "很多关键口径、接口和边界没有在早期被指出。"]
        ].map(([title, desc]) => (
          <article key={title} className="panel-surface p-5">
            <h2 className="text-base font-semibold text-primary sm:text-lg">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          </article>
        ))}
      </section>

      <section id="specs" className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">输出结构</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["识别", "需求类型、页面目标、当前主动作"],
            ["拆解", "产品侧、运营侧、页面侧分别要做什么"],
            ["补齐", "必须实现、接口建议、关键实现点"],
            ["预警", "PRD 缺失项、研发拆解和注意事项"]
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
          <span className="text-xs text-muted">截图 / URL / Brief → 需求解读</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
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
              {isGenerating ? "解读中..." : "生成需求解读"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="panel-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">解读流水线</p>
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
                      className={`rounded-lg border px-3 py-2 ${
                        done
                          ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-300"
                          : running
                            ? "border-accent/60 bg-accent/10 text-accent"
                            : "border-edge/70 bg-base/35 text-muted"
                      }`}
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
                  {logs.length === 0 ? (
                    <li>等待输入并启动演示。</li>
                  ) : (
                    logs.map((log, index) => (
                      <li key={`${log}-${index}`} className="rounded border border-edge/50 bg-base/60 px-2 py-1">
                        {log}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="panel-surface p-5">
              <p className="text-sm text-muted">结果区</p>
              {!output ? (
                <div className="mt-3 rounded-xl border border-dashed border-edge-strong bg-base/30 p-4 text-sm text-secondary">
                  完成生成后，将在这里展示需求类型、产运需求、关键点、缺失项和研发拆解建议。
                </div>
              ) : (
                <div className="mt-3 space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{output.headline}</h3>
                    <p className="text-xs text-muted">分析编号 {output.analysisId} · 生成时间 {output.generatedAt}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-4 py-3">
                      <p className="text-xs text-muted">需求类型</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{output.requirementType}</p>
                    </div>
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-4 py-3">
                      <p className="text-xs text-muted">页面目标</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{output.pageGoal}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-secondary">产运需求</p>
                    {output.needs.map((item) => (
                      <article key={item.title} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{item.title}</h4>
                          <span className="rounded-full border border-edge px-2 py-0.5 text-xs text-muted">{item.owner}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">{item.summary}</p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-secondary">必须实现</p>
                    {output.mustHave.map((item) => (
                      <article key={item.title} className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-primary">{item.title}</h4>
                          <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{item.priority}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">{item.reason}</p>
                      </article>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <p className="text-sm text-secondary">接口建议</p>
                      <div className="mt-2 space-y-2">
                        {output.apiSuggestions.map((api) => (
                          <div key={api.name} className="rounded border border-edge/60 bg-base/40 px-2 py-2">
                            <p className="text-sm font-medium text-primary">{api.name}</p>
                            <p className="text-[11px] text-muted">{api.method} · {api.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <p className="text-sm text-secondary">状态与异常</p>
                      <ul className="mt-2 space-y-1 text-xs text-muted">
                        {output.statusAndErrors.map((item) => (
                          <li key={item} className="rounded border border-edge/60 bg-base/40 px-2 py-2">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <p className="text-sm text-secondary">关键实现点</p>
                      <ul className="mt-2 space-y-1 text-xs text-muted">
                        {output.keyPoints.map((point) => (
                          <li key={point} className="rounded border border-edge/60 bg-base/40 px-2 py-2">{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <p className="text-sm text-secondary">边界条件</p>
                      <ul className="mt-2 space-y-1 text-xs text-muted">
                        {output.boundaries.map((item) => (
                          <li key={item} className="rounded border border-edge/60 bg-base/40 px-2 py-2">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <p className="text-sm text-secondary">PRD 缺失项</p>
                      <ul className="mt-2 space-y-1 text-xs text-muted">
                        {output.prdGaps.map((gap) => (
                          <li key={gap} className="rounded border border-edge/60 bg-base/40 px-2 py-2">{gap}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <p className="text-sm text-secondary">研发拆解</p>
                      <div className="mt-2 space-y-2">
                        {output.devSplit.map((group) => (
                          <div key={group.area} className="rounded border border-edge/60 bg-base/40 px-2 py-2">
                            <p className="text-sm font-medium text-primary">{group.area}</p>
                            <ul className="mt-1 space-y-1 text-[11px] text-muted">
                              {group.items.map((item) => (
                                <li key={item}>- {item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-secondary">plan.md 草稿</p>
                        <span className="text-[11px] text-muted">plan-ready</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => copyDraft(output.planDraft, "plan")} className="rounded-full border border-edge px-3 py-1 text-[11px] text-secondary transition hover:border-accent hover:text-accent">复制 plan</button>
                        <button type="button" onClick={() => downloadDraft(output.planDraft, "plan.md")} className="rounded-full border border-edge px-3 py-1 text-[11px] text-secondary transition hover:border-accent hover:text-accent">导出 .md</button>
                      </div>
                      <pre className="mt-2 overflow-x-auto rounded border border-edge/60 bg-base/50 p-3 text-[11px] leading-5 text-muted">{output.planDraft}</pre>
                    </div>
                    <div className="rounded-lg border border-edge/70 bg-base/35 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-secondary">spec.md 草稿</p>
                        <span className="text-[11px] text-muted">spec-ready</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => copyDraft(output.specDraft, "spec")} className="rounded-full border border-edge px-3 py-1 text-[11px] text-secondary transition hover:border-accent hover:text-accent">复制 spec</button>
                        <button type="button" onClick={() => downloadDraft(output.specDraft, "spec.md")} className="rounded-full border border-edge px-3 py-1 text-[11px] text-secondary transition hover:border-accent hover:text-accent">导出 .md</button>
                      </div>
                      <pre className="mt-2 overflow-x-auto rounded border border-edge/60 bg-base/50 p-3 text-[11px] leading-5 text-muted">{output.specDraft}</pre>
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
            "把截图和页面描述翻译成研发可执行语言",
            "提前发现 PRD 缺失项，减少后期返工",
            "统一产品、运营、设计、研发的需求解读口径"
          ].map((item) => (
            <div key={item} className="panel-surface p-5 text-sm text-secondary">{item}</div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">适用场景</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "后台需求评审",
            "页面截图解读",
            "产运协同梳理",
            "PRD 预审",
            "研发任务拆分",
            "提案会前准备"
          ].map((scene) => (
            <span key={scene} className="rounded-full border border-edge-strong bg-surface/70 px-3 py-1.5 text-xs text-secondary">
              {scene}
            </span>
          ))}
        </div>
      </section>

      <section className="panel-surface p-6">
        <h2 className="text-xl font-semibold text-primary">准备开始完整体验？</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">当前版本已经具备结构化需求解读流程，可继续接入真实截图分析与 URL 抓取服务。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#demo" className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            回到 Demo
          </a>
        </div>
      </section>
    </main>
  );
}
