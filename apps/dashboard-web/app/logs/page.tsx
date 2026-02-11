"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardHeader } from "../../components/DashboardHeader";
import { ErrorBox } from "../../components/ErrorBox";
import { getLogs } from "../../lib/api";
import { formatIso } from "../../lib/format";
import { useRequireAuth } from "../../lib/useRequireAuth";
import type { LogEntry } from "../../lib/types";

export default function LogsPage() {
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
    <div>
      <DashboardHeader />

      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-primary">Logs</h1>
        <button
          type="button"
          className="bg-surface text-secondary border border-edge hover:text-primary"
          disabled={loading}
          onClick={() => void refresh()}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void refresh();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm text-secondary">days</span>
          <input
            type="number"
            min={1}
            max={31}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-secondary">limit</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </label>

        <button type="submit" disabled={loading}>
          Apply
        </button>
      </form>

      {error ? (
        <div className="mb-6">
          <ErrorBox title="Request failed" message={error} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {entries.length === 0 ? <div className="text-sm text-muted">No log entries.</div> : null}

        {entries.map((e, idx) => (
          <div key={`${e.ts}-${idx}`} className="rounded-md border border-edge bg-surface px-4 py-3">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-primary">{e.message}</div>
              <div className="text-xs text-muted">{formatIso(e.ts)}</div>
            </div>
            {e.subtitle ? <div className="text-sm text-secondary">{e.subtitle}</div> : null}
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-muted">API: GET /logs?days=7&amp;limit=200</div>
    </div>
  );
}
