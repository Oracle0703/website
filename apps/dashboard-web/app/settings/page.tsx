"use client";

import { useRouter } from "next/navigation";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken } from "../../lib/auth";
import { useRequireAuth } from "../../lib/useRequireAuth";

const SETTINGS = [
  { label: "Enable realtime refresh", value: "On" },
  { label: "Notify on task failure", value: "On" },
  { label: "Verbose log mode", value: "Off" }
];

export default function SettingsPage() {
  const router = useRouter();
  useRequireAuth();

  return (
    <DashboardShell
      activeTab="settings"
      title="Preferences"
      subtitle="Basic display and notification preferences for dashboard operators."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Profile: Admin</span>}
    >
      <GlassCard title="Feature Flags">
        <div className="space-y-3">
          {SETTINGS.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2 text-sm">
              <span className="text-slate-200">{item.label}</span>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-cyan-300">{item.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </DashboardShell>
  );
}
