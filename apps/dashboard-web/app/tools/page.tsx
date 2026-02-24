"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken } from "../../lib/auth";
import { useRequireAuth } from "../../lib/useRequireAuth";

const TOOL_LINKS = [
  { label: "Open Tasks Board", href: "/tasks", desc: "Create and update task status." },
  { label: "Open Log Stream", href: "/logs", desc: "Inspect runtime logs by time window." },
  { label: "Open Status Editor", href: "/status", desc: "Publish latest system status." }
];

export default function ToolsPage() {
  const router = useRouter();
  useRequireAuth();

  return (
    <DashboardShell
      activeTab="tools"
      title="Ops Tools"
      subtitle="Quick entry points for routine dashboard operations."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Utilities</span>}
    >
      <GlassCard title="Quick Actions">
        <div className="space-y-3">
          {TOOL_LINKS.map((tool) => (
            <Link
              key={tool.label}
              href={tool.href}
              className="block rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2 transition hover:border-cyan-400/70 hover:bg-slate-900/80"
            >
              <div className="text-sm font-medium text-slate-100">{tool.label}</div>
              <div className="text-xs text-slate-500">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </GlassCard>
    </DashboardShell>
  );
}
