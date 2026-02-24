"use client";

import { useEffect, useState } from "react";

import { DashboardHeader } from "../../components/DashboardHeader";
import { ErrorBox } from "../../components/ErrorBox";
import { getStatus, setStatus } from "../../lib/api";
import { formatIso } from "../../lib/format";
import { useRequireAuth } from "../../lib/useRequireAuth";

export default function StatusPage() {
  const { ready } = useRequireAuth();

  const [text, setText] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const doc = await getStatus();
      setText(doc.text);
      setUpdatedAt(doc.updatedAt);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready]);

  return (
    <div className="page-shell">
      <DashboardHeader />

      <div className="page-head">
        <div>
          <h1 className="page-title">Status</h1>
          <p className="page-desc mt-1">{updatedAt ? `Updated: ${formatIso(updatedAt)}` : "No status update yet."}</p>
        </div>

        <button type="button" className="btn-ghost" disabled={loading} onClick={() => void refresh()}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <ErrorBox title="Request failed" message={error} /> : null}

      <form
        className="page-card flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSaving(true);
          try {
            await setStatus(text);
            await refresh();
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setSaving(false);
          }
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-secondary">text</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Write something..."
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <div className="text-xs text-muted">API: GET /status, POST /status</div>
        </div>
      </form>
    </div>
  );
}
