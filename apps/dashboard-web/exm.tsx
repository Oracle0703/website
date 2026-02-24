import Link from "next/link";
import type { ReactNode } from "react";

type DashboardTab = "dashboard" | "tasks" | "logs" | "status" | "config" | "users" | "tools" | "settings";

type DashboardLandingProps = {
  password: string;
  submitting: boolean;
  error: string | null;
  hasToken: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onLogout: () => void;
};

type DashboardShellProps = {
  activeTab: DashboardTab;
  title: string;
  subtitle: string;
  onLogout: () => void;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

type NavItem = {
  id?: DashboardTab;
  label: string;
  href?: string;
};

const coreNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/" },
  { id: "tasks", label: "Tasks", href: "/tasks" },
  { id: "logs", label: "Logs", href: "/logs" },
  { id: "status", label: "Status", href: "/status" }
];

const sideNavItems: NavItem[] = [
  ...coreNavItems,
  { id: "config", label: "Config", href: "/config" },
  { id: "users", label: "Users", href: "/users" },
  { id: "tools", label: "Tools", href: "/tools" },
  { id: "settings", label: "Settings", href: "/settings" }
];

export default function DashboardLanding(props: DashboardLandingProps) {
  return (
    <DashboardShell
      activeTab="dashboard"
      title="Dashboard Overview"
      subtitle="Secure access · System metrics · Tasks · Logs"
      onLogout={props.onLogout}
      meta={
        <>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">
            ENV: <span className="ml-1 text-cyan-300">production</span>
          </span>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">
            API: <span className="ml-1 text-slate-300">NEXT_PUBLIC_DASHBOARD_API_BASE</span>
          </span>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <GlassCard title="Secure Access">
          <LoginCard {...props} />
        </GlassCard>

        <GlassCard title="Overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard label="System Load" value="1.25" trend="+3.2%" trendType="up" />
            <MetricCard label="Memory Usage" value="64%" trend="-1.1%" trendType="down">
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
              </div>
            </MetricCard>
            <MetricCard label="Tasks Running" value="5" trend="+2" trendType="up" />
          </div>
        </GlassCard>

        <GlassCard title="Recent Tasks">
          <RecentTasks />
        </GlassCard>

        <GlassCard title="System Metrics">
          <SystemMetricsChart />
        </GlassCard>

        <div className="xl:col-span-2">
          <GlassCard title="Recent Logs">
            <RecentLogs />
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-2 md:px-4">
      <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-slate-800/70 bg-[#050814] text-slate-100 shadow-[0_30px_80px_-42px_rgba(34,211,238,0.45)] md:min-h-[calc(100vh-3rem)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(168,85,247,0.16),_transparent_52%)]" />

        <div className="relative z-10 flex min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)]">
          <aside className="hidden w-64 border-r border-slate-800/60 bg-slate-950/65 backdrop-blur-xl lg:block">
            <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/60 bg-cyan-500/20 text-cyan-300 font-semibold">
                MI
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Dashboard Console</span>
                <span className="text-sm font-semibold text-slate-100">Meaningful Ink</span>
              </div>
            </div>

            <nav className="mt-4 space-y-1 px-3">
              {sideNavItems.map((item) => {
                const active = item.id === props.activeTab;
                const className = [
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "border border-cyan-400/70 bg-cyan-500/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                ].join(" ");

                const dotClassName = [
                  "h-1.5 w-1.5 rounded-full",
                  active ? "bg-cyan-400" : "bg-slate-500 group-hover:bg-slate-300"
                ].join(" ");

                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={className}>
                      <span className={dotClassName} />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <span key={item.label} className={`${className} cursor-not-allowed opacity-55`}>
                    <span className={dotClassName} />
                    <span>{item.label}</span>
                  </span>
                );
              })}
            </nav>
          </aside>

          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center justify-between border-b border-slate-800/60 bg-slate-950/65 px-4 backdrop-blur-xl md:px-6">
              <nav className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 md:gap-6 md:text-xs md:tracking-[0.25em]">
                {coreNavItems.map((item) => {
                  const active = item.id === props.activeTab;
                  return (
                    <Link key={item.label} href={item.href ?? "#"} className="relative pb-1 transition hover:text-slate-100">
                      <span className={active ? "text-cyan-300" : ""}>{item.label}</span>
                      {active ? (
                        <span className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={props.onLogout}
                className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/70 hover:bg-slate-900/90 hover:text-cyan-200"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                <span>Admin</span>
                <span className="ml-1 text-[10px] text-slate-500">Logout</span>
              </button>
            </header>

            <main className="flex-1 px-4 py-5 md:px-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold tracking-wide text-slate-50">{props.title}</h1>
                  <p className="mt-1 text-xs text-slate-400">{props.subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  {props.meta}
                  {props.actions}
                </div>
              </div>

              {props.children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginCard(props: DashboardLandingProps) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-slate-300">
        Enter <code className="rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-cyan-200">ADMIN_PASSWORD</code> to get an admin token.
      </p>

      {props.hasToken ? (
        <div className="rounded-lg border border-cyan-500/45 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
          Token already exists in <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-200">localStorage</code>. Jump to{" "}
          <Link href="/tasks" className="text-cyan-300 hover:text-cyan-100">
            /tasks
          </Link>
        </div>
      ) : null}

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void props.onSubmit();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-400">ADMIN_PASSWORD</span>
          <input
            type="password"
            value={props.password}
            onChange={(event) => props.onPasswordChange(event.target.value)}
            autoComplete="current-password"
            placeholder="********"
            required
            className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder:text-slate-500"
          />
        </label>

        <button
          type="submit"
          disabled={props.submitting}
          className="w-full rounded-md border border-cyan-400/70 bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(56,189,248,0.35)] transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      {props.error ? (
        <div className="rounded-lg border border-rose-500/45 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{props.error}</div>
      ) : null}
    </div>
  );
}

type GlassCardProps = {
  title: string;
  children: ReactNode;
};

export function GlassCard(props: GlassCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <header className="relative flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{props.title}</h2>
        </div>
        <span className="text-[10px] text-slate-500">LIVE</span>
      </header>
      <div className="relative px-4 py-3">{props.children}</div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  trendType: "up" | "down";
  children?: ReactNode;
};

function MetricCard(props: MetricCardProps) {
  const isUp = props.trendType === "up";

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-3 shadow-[0_0_20px_rgba(15,23,42,0.9)]">
      <p className="mb-1 text-[11px] text-slate-400">{props.label}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-semibold text-slate-50">{props.value}</span>
        <span className={["text-[11px] font-medium", isUp ? "text-emerald-400" : "text-rose-400"].join(" ")}>
          {isUp ? "▲" : "▼"} {props.trend}
        </span>
      </div>
      {props.children}
    </div>
  );
}

function RecentTasks() {
  const tasks = [
    { name: "Data Backup", status: "success", time: "2h ago" },
    { name: "Report Generation", status: "running", time: "4h ago" },
    { name: "Log Cleanup", status: "running", time: "6h ago" },
    { name: "Email Notifications", status: "failed", time: "8h ago" }
  ];

  const statusColor: Record<string, string> = {
    success: "bg-emerald-400",
    running: "bg-sky-400",
    failed: "bg-rose-400"
  };

  return (
    <div className="space-y-2 text-xs">
      {tasks.map((task) => (
        <div
          key={task.name}
          className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2 transition hover:border-cyan-400/60 hover:bg-slate-900/80"
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${statusColor[task.status]} shadow-[0_0_10px_rgba(56,189,248,0.8)]`} />
            <span className="text-slate-100">{task.name}</span>
          </div>
          <span className="text-[11px] text-slate-500">{task.time}</span>
        </div>
      ))}
    </div>
  );
}

function RecentLogs() {
  const logs = [
    { level: "INFO", msg: "Task completed successfully", time: "0m ago", color: "bg-sky-400" },
    { level: "INFO", msg: "Report generated", time: "2h ago", color: "bg-sky-400" },
    { level: "WARN", msg: "Disk space is low", time: "5h ago", color: "bg-amber-400" },
    { level: "ERROR", msg: "Failed to send email", time: "1d ago", color: "bg-rose-400" }
  ];

  return (
    <div className="max-h-52 overflow-auto rounded-xl border border-slate-900 bg-black/70 font-mono text-[11px]">
      {logs.map((log) => (
        <div
          key={`${log.level}-${log.time}-${log.msg}`}
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
}

function SystemMetricsChart() {
  const points = [20, 45, 35, 60, 50, 75, 65];

  return (
    <div className="h-48 rounded-xl border border-slate-900 bg-gradient-to-b from-slate-950 to-slate-950/80 px-3 py-3">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-1 flex justify-between text-[10px] text-slate-500">
          <span>CPU</span>
          <span>Memory</span>
          <span>Queue</span>
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-4 gap-0">
            {Array.from({ length: 28 }).map((_, index) => (
              <div key={index} className="border-[0.5px] border-slate-800/60" />
            ))}
          </div>
          <div className="absolute inset-1 flex items-end gap-2">
            {points.map((point, index) => (
              <div key={index} className="flex flex-1 items-end justify-center">
                <div
                  className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.9)]"
                  style={{ height: `${point}%` }}
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
}
