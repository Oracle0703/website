"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken } from "../../lib/auth";
import { useRequireAuth } from "../../lib/useRequireAuth";

const STORAGE_KEYS = {
  autoRefresh: "dashboard_auto_refresh_enabled",
  refreshMs: "dashboard_refresh_ms",
  compactTimeline: "dashboard_compact_timeline"
} as const;

export default function SettingsPage() {
  const router = useRouter();
  useRequireAuth();

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshMs, setRefreshMs] = useState(15000);
  const [compactTimeline, setCompactTimeline] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const rawAuto = window.localStorage.getItem(STORAGE_KEYS.autoRefresh);
    const rawMs = window.localStorage.getItem(STORAGE_KEYS.refreshMs);
    const rawCompact = window.localStorage.getItem(STORAGE_KEYS.compactTimeline);

    setAutoRefresh(rawAuto === "true");
    setCompactTimeline(rawCompact === "true");
    if (rawMs) {
      const n = Number(rawMs);
      if (Number.isFinite(n) && n >= 5000 && n <= 120000) setRefreshMs(n);
    }
  }, []);

  function persist() {
    window.localStorage.setItem(STORAGE_KEYS.autoRefresh, String(autoRefresh));
    window.localStorage.setItem(STORAGE_KEYS.refreshMs, String(refreshMs));
    window.localStorage.setItem(STORAGE_KEYS.compactTimeline, String(compactTimeline));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <DashboardShell
      activeTab="settings"
      title="Preferences"
      subtitle="Lightweight client-side preferences for operators using this dashboard today."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Stored in browser</span>}
      actions={
        <button
          type="button"
          className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400/70 hover:text-cyan-200"
          onClick={persist}
        >
          {saved ? "Saved" : "Save"}
        </button>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="console-scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <GlassCard title="Refresh Behavior">
              <div className="space-y-4 text-sm text-slate-300">
                <label className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                  <span>Enable client auto refresh</span>
                  <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
                </label>

                <label className="flex flex-col gap-2 rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Refresh interval (ms)</span>
                  <input
                    type="number"
                    min={5000}
                    max={120000}
                    step={1000}
                    value={refreshMs}
                    onChange={(event) => setRefreshMs(Number(event.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
              </div>
            </GlassCard>

            <GlassCard title="Display Preferences">
              <div className="space-y-4 text-sm text-slate-300">
                <label className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                  <span>Compact event timeline</span>
                  <input type="checkbox" checked={compactTimeline} onChange={(event) => setCompactTimeline(event.target.checked)} />
                </label>

                <div className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3 text-xs text-slate-400">
                  These settings are client-side only for now. They are meant to make the dashboard more usable before a real user-preferences API exists.
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
