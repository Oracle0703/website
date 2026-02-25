"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardShell, GlassCard } from "../../exm";
import { ErrorBox } from "../../components/ErrorBox";
import { getStatus, setStatus } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import { formatIso } from "../../lib/format";
import { useRequireAuth } from "../../lib/useRequireAuth";

export default function StatusPage() {
  const router = useRouter();
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
    <DashboardShell
      activeTab="status"
      title="Runtime Status"
      subtitle={updatedAt ? `Updated: ${formatIso(updatedAt)}` : "No status update yet."}
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">API: /status</span>}
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
      <div className="flex h-full min-h-0 flex-col gap-5">
        {error ? <ErrorBox title="Request failed" message={error} /> : null}

        <div className="min-h-0 flex-1">
          <GlassCard title="Status Editor">
          <form
            className="flex h-full min-h-0 flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
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
            <label className="flex min-h-0 flex-1 flex-col gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
              text
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={10}
                placeholder="Write something..."
                className="console-scroll-area min-h-[220px] flex-1 resize-none overflow-y-auto rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 placeholder:text-slate-500"
              />
            </label>

            <div className="sticky bottom-0 z-10 -mx-4 mt-auto border-t border-slate-800/70 bg-slate-950/85 px-4 pt-3 pb-1 backdrop-blur-sm">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md border border-cyan-400/70 bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(56,189,248,0.35)] transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}
