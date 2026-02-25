"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DashboardShell, GlassCard } from "../../exm";
import { ErrorBox } from "../../components/ErrorBox";
import { getLogs } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import { formatIso } from "../../lib/format";
import { useRequireAuth } from "../../lib/useRequireAuth";
import type { LogEntry } from "../../lib/types";

export default function LogsPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();

  const [days, setDays] = useState(7);
  const [limit, setLimit] = useState(200);

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getLogs({ days, limit });
      setEntries(res.entries);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [days, limit]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  return (
    <DashboardShell
      activeTab="logs"
      title="Log Stream"
      subtitle="Inspect recent system records and tune filters for diagnostics."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Rows: {entries.length}</span>}
      actions={
        <button
          type="button"
          className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400/70 hover:text-cyan-200"
          disabled={loading}
          onClick={() => void refresh()}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <div className="min-h-0 flex-1">
        <div className="console-scroll-area h-full space-y-5 overflow-y-auto pr-1">
          <GlassCard
            title="Filters"
            className="sticky top-0 z-20 border-slate-700/80 bg-slate-950/90 shadow-[0_22px_40px_-28px_rgba(15,23,42,0.95)] backdrop-blur-xl"
          >
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void refresh();
              }}
            >
              <label className="flex flex-col gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
                days
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={days}
                  onChange={(event) => setDays(Number(event.target.value))}
                  className="w-28 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm normal-case tracking-normal text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
                limit
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={limit}
                  onChange={(event) => setLimit(Number(event.target.value))}
                  className="w-32 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm normal-case tracking-normal text-slate-100"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="rounded-md border border-cyan-400/70 bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(56,189,248,0.35)] transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Apply
              </button>
            </form>
          </GlassCard>

          {error ? <ErrorBox title="Request failed" message={error} /> : null}

          <GlassCard title="Recent Logs">
            <div className="space-y-3">
              {entries.length === 0 ? <div className="text-sm text-slate-500">No log entries.</div> : null}

              {entries.map((entry, index) => (
                <article key={`${entry.ts}-${index}`} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-100">{entry.message}</div>
                    <div className="text-xs text-slate-500">{formatIso(entry.ts)}</div>
                  </div>
                  {entry.subtitle ? <div className="text-sm text-slate-300">{entry.subtitle}</div> : null}
                </article>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}
