"use client";

import { useRouter } from "next/navigation";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken } from "../../lib/auth";
import { useRequireAuth } from "../../lib/useRequireAuth";

const ACCESS_MODEL = [
  {
    title: "Current access mode",
    value: "Single shared admin password",
    detail: "Login currently mints one admin JWT and does not expose a multi-user directory API."
  },
  {
    title: "Role model",
    value: "admin only",
    detail: "There is no real RBAC or per-user permission matrix in the current dashboard API."
  },
  {
    title: "What this page does now",
    value: "Honest access review",
    detail: "This replaces the previous fake member list, so operators do not mistake placeholders for real users."
  }
];

const NEXT_STEPS = [
  "Add a dedicated users endpoint before showing member rows.",
  "Introduce per-user accounts and role scopes if the dashboard becomes multi-operator.",
  "Move from shared password login to auditable identities when this leaves MVP mode."
];

export default function UsersPage() {
  const router = useRouter();
  useRequireAuth();

  return (
    <DashboardShell
      activeTab="users"
      title="Access Model"
      subtitle="Real access posture for the current dashboard, without pretend user data."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Mode: single-admin</span>}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="console-scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <GlassCard title="Current Access Posture">
              <div className="space-y-3">
                {ACCESS_MODEL.map((item) => (
                  <div key={item.title} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3 text-sm">
                    <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.title}</div>
                    <div className="mb-1 font-medium text-cyan-300">{item.value}</div>
                    <div className="text-xs text-slate-400">{item.detail}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="What To Build Next">
              <ol className="space-y-3 text-sm text-slate-300">
                {NEXT_STEPS.map((item, index) => (
                  <li key={item} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                    <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">step {index + 1}</div>
                    <div>{item}</div>
                  </li>
                ))}
              </ol>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
