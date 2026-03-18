"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken, getToken } from "../../lib/auth";
import { API_BASE } from "../../lib/api";
import { useRequireAuth } from "../../lib/useRequireAuth";

function getRuntimeSummary() {
  return {
    basePath: "/dashboard",
    apiBase: API_BASE,
    authStorage: "localStorage.dashboard_admin_token",
    clientRendering: "Next.js app router (static shell + client fetch)",
    refreshMode: "manual refresh",
    tokenPresent: Boolean(getToken())
  };
}

export default function ConfigPage() {
  const router = useRouter();
  useRequireAuth();

  const summary = useMemo(() => getRuntimeSummary(), []);

  return (
    <DashboardShell
      activeTab="config"
      title="Config Center"
      subtitle="Real runtime wiring for the dashboard client, not placeholder settings."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Scope: dashboard-web</span>}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="console-scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <GlassCard title="Runtime Summary">
              <div className="space-y-3 text-sm text-slate-300">
                <Row label="Base path" value={summary.basePath} />
                <Row label="API base" value={summary.apiBase} mono />
                <Row label="Auth storage" value={summary.authStorage} mono />
                <Row label="Render mode" value={summary.clientRendering} />
                <Row label="Refresh mode" value={summary.refreshMode} />
                <Row label="Admin token" value={summary.tokenPresent ? "present" : "missing"} tone={summary.tokenPresent ? "good" : "warn"} />
              </div>
            </GlassCard>

            <GlassCard title="Current Constraints">
              <div className="space-y-3 text-sm text-slate-300">
                <Constraint title="No server-side session model">
                  Client auth currently depends on a bearer token stored in localStorage.
                </Constraint>
                <Constraint title="No live settings API yet">
                  Config shown here is inferred from runtime wiring, not fetched from a dedicated config service.
                </Constraint>
                <Constraint title="Manual refresh first">
                  Current pages intentionally prioritize explicit refresh over silent polling.
                </Constraint>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Row(props: { label: string; value: string; mono?: boolean; tone?: "good" | "warn" }) {
  const toneClass = props.tone === "good" ? "text-emerald-300" : props.tone === "warn" ? "text-amber-300" : "text-cyan-300";
  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
      <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">{props.label}</div>
      <div className={["text-sm", toneClass, props.mono ? "font-mono break-all" : ""].join(" ")}>{props.value}</div>
    </div>
  );
}

function Constraint(props: { title: string; children: string }) {
  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
      <div className="mb-1 text-sm font-medium text-slate-100">{props.title}</div>
      <div className="text-xs text-slate-400">{props.children}</div>
    </div>
  );
}
