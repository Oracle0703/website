import React from "react";

const navItems = ["Dashboard", "Tasks", "Logs", "Status"];

const sideNavItems = [
  "Dashboard",
  "Tasks",
  "Logs",
  "Status",
  "Config",
  "Users",
  "Tools",
  "Settings",
];

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex">
      {/* 粒子/渐变背景层 */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),_transparent_55%)]" />

      {/* 侧边栏 */}
      <aside className="relative z-10 w-64 border-r border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 font-semibold">
            MI
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Dashboard Console
            </span>
            <span className="text-sm font-semibold text-slate-100">
              Meaningful Ink
            </span>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {sideNavItems.map((item) => {
            const active = item === "Dashboard";
            return (
              <button
                key={item}
                className={[
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-cyan-500/10 border border-cyan-400/70 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    active
                      ? "bg-cyan-400"
                      : "bg-slate-500 group-hover:bg-slate-300",
                  ].join(" ")}
                />
                <span>{item}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区域 */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl px-6 h-14">
          <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            {navItems.map((item) => {
              const active = item === "Dashboard";
              return (
                <button
                  key={item}
                  className="relative pb-1 transition hover:text-slate-100"
                >
                  <span className={active ? "text-cyan-300" : ""}>{item}</span>
                  {active && (
                    <span className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <button className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400/70 hover:text-cyan-200 hover:bg-slate-900/90 transition">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span>Admin</span>
            <span className="ml-1 text-[10px] text-slate-500">Logout</span>
          </button>
        </header>

        {/* 内容 */}
        <main className="flex-1 px-6 py-5">
          {/* 顶部标题 + 环境信息 */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-50 tracking-wide">
                Dashboard Overview
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Secure access · System metrics · Tasks · Logs
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">
                ENV: <span className="text-cyan-300 ml-1">production</span>
              </span>
              <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">
                API:{" "}
                <span className="text-slate-300 ml-1">
                  NEXT_PUBLIC_DASHBOARD_API_BASE
                </span>
              </span>
            </div>
          </div>

          {/* 网格布局 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* 概览卡片 */}
            <GlassCard title="Overview">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                  label="System Load"
                  value="1.25"
                  trend="+3.2%"
                  trendType="up"
                />
                <MetricCard
                  label="Memory Usage"
                  value="64%"
                  trend="-1.1%"
                  trendType="down"
                >
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                  </div>
                </MetricCard>
                <MetricCard
                  label="Tasks Running"
                  value="5"
                  trend="+2"
                  trendType="up"
                />
              </div>
            </GlassCard>

            {/* 最近任务 */}
            <GlassCard title="Recent Tasks">
              <RecentTasks />
            </GlassCard>

            {/* 最近日志 */}
            <GlassCard title="Recent Logs">
              <RecentLogs />
            </GlassCard>

            {/* 系统指标图表 */}
            <GlassCard title="System Metrics">
              <SystemMetricsChart />
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

type GlassCardProps = {
  title: string;
  children: React.ReactNode;
};

const GlassCard: React.FC<GlassCardProps> = ({ title, children }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <header className="relative flex items-center justify-between px-4 py-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            {title}
          </h2>
        </div>
        <span className="text-[10px] text-slate-500">LIVE</span>
      </header>
      <div className="relative px-4 py-3">{children}</div>
    </section>
  );
};
type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  trendType: "up" | "down";
  children?: React.ReactNode;
};

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  trendType,
  children,
}) => {
  const isUp = trendType === "up";
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-3 shadow-[0_0_20px_rgba(15,23,42,0.9)]">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-semibold text-slate-50">{value}</span>
        <span
          className={[
            "text-[11px] font-medium",
            isUp ? "text-emerald-400" : "text-rose-400",
          ].join(" ")}
        >
          {isUp ? "▲" : "▼"} {trend}
        </span>
      </div>
      {children}
    </div>
  );
};
const RecentTasks: React.FC = () => {
  const tasks = [
    { name: "Data Backup", status: "success", time: "2h ago" },
    { name: "Report Generation", status: "running", time: "4h ago" },
    { name: "Log Cleanup", status: "running", time: "6h ago" },
    { name: "Email Notifications", status: "failed", time: "8h ago" },
  ];

  const statusColor: Record<string, string> = {
    success: "bg-emerald-400",
    running: "bg-sky-400",
    failed: "bg-rose-400",
  };

  return (
    <div className="space-y-2 text-xs">
      {tasks.map((task) => (
        <div
          key={task.name}
          className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2 hover:border-cyan-400/60 hover:bg-slate-900/80 transition"
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusColor[task.status]} shadow-[0_0_10px_rgba(56,189,248,0.8)]`}
            />
            <span className="text-slate-100">{task.name}</span>
          </div>
          <span className="text-[11px] text-slate-500">{task.time}</span>
        </div>
      ))}
    </div>
  );
};
const RecentLogs: React.FC = () => {
  const logs = [
    {
      level: "INFO",
      msg: "Task completed successfully",
      time: "0m ago",
      color: "bg-sky-400",
    },
    {
      level: "INFO",
      msg: "Report generated",
      time: "2h ago",
      color: "bg-sky-400",
    },
    {
      level: "WARN",
      msg: "Disk space is low",
      time: "5h ago",
      color: "bg-amber-400",
    },
    {
      level: "ERROR",
      msg: "Failed to send email",
      time: "1d ago",
      color: "bg-rose-400",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-900 bg-black/70 font-mono text-[11px] max-h-52 overflow-auto">
      {logs.map((log, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 border-b border-slate-900/80 px-3 py-2 last:border-b-0"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${log.color}`} />
          <span className="text-slate-500">{log.level}</span>
          <span className="text-slate-200">{log.msg}</span>
          <span className="ml-auto text-slate-500">{log.time}</span>
        </div>
      ))}
    </div>
  );
};

const SystemMetricsChart: React.FC = () => {
  const points = [20, 45, 35, 60, 50, 75, 65];

  return (
    <div className="h-48 rounded-xl border border-slate-900 bg-gradient-to-b from-slate-950 to-slate-950/80 px-3 py-3">
      <div className="flex h-full flex-col justify-between">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>CPU</span>
          <span>Memory</span>
          <span>Queue</span>
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-4 gap-0">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-slate-800/60" />
            ))}
          </div>
          <div className="absolute inset-1 flex items-end gap-2">
            {points.map((p, idx) => (
              <div key={idx} className="flex-1 flex items-end justify-center">
                <div
                  className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.9)]"
                  style={{ height: `${p}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>Now</span>
          <span>-30m</span>
          <span>-1h</span>
          <span>-2h</span>
        </div>
      </div>
    </div>
  );
};
