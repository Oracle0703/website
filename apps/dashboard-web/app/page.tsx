"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import DashboardLanding, { DashboardShell, GlassCard } from "../exm";
import { ErrorBox } from "../components/ErrorBox";
import { getEvents, getState, loginAdmin } from "../lib/api";
import { clearToken, getToken } from "../lib/auth";
import { formatIso } from "../lib/format";
import type { IngestEvent, StateDoc } from "../lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  mr: "MR",
  deploy: "Deploy",
  ops: "Ops",
  content: "Content",
  idle: "Idle",
  cron: "Cron",
  other: "Other"
};

function categoryLabel(value?: string) {
  if (!value) return "Other";
  return CATEGORY_LABEL[value] ?? value;
}

function statValue(state: StateDoc | null, events: IngestEvent[]) {
  if (!state) {
    return {
      nextCount: 0,
      doneCount: 0,
      failedCount: 0,
      eventCount: 0
    };
  }
  return {
    nextCount: state.next.length,
    doneCount: state.recent.done.length,
    failedCount: state.recent.failed.length,
    eventCount: events.length
  };
}

function OverviewPage(props: { onLogout: () => void }) {
  const router = useRouter();
  const [state, setState] = useState<StateDoc | null>(null);
  const [events, setEvents] = useState<IngestEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const [nextState, nextEvents] = await Promise.all([getState(), getEvents({ days: 7, limit: 12 })]);
      setState(nextState);
      setEvents(nextEvents.events);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const stats = useMemo(() => statValue(state, events), [state, events]);

  return (
    <DashboardShell
      activeTab="dashboard"
      title="Command Overview"
      subtitle={state?.updatedAt ? `Last updated ${formatIso(state.updatedAt)}` : "Live operational snapshot for current work."}
      onLogout={() => {
        props.onLogout();
        router.push("/");
      }}
      meta={
        <>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Now: {state?.now ? categoryLabel(state.now.category) : "Idle"}</span>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Events: {stats.eventCount}</span>
        </>
      }
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

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          <MetricCard label="Now Running" value={state?.now ? "1" : "0"} detail={state?.now ? categoryLabel(state.now.category) : "No active task"} />
          <MetricCard label="Queued Next" value={String(stats.nextCount)} detail="Pending planned items" />
          <MetricCard label="Recent Done" value={String(stats.doneCount)} detail="Latest successful completions" />
          <MetricCard label="Recent Failed" value={String(stats.failedCount)} detail="Failures requiring attention" tone={stats.failedCount > 0 ? "warn" : "normal"} />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.85fr]">
          <GlassCard title="Current Focus" className="min-h-0" bodyClassName="min-h-0 flex-1">
            <div className="space-y-4">
              {state?.now ? (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/8 px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-cyan-300">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
                    {categoryLabel(state.now.category)} in progress
                  </div>
                  <div className="text-base font-semibold text-slate-50">{state.now.title}</div>
                  {state.now.summary ? <div className="mt-2 text-sm text-slate-300">{state.now.summary}</div> : null}
                  <div className="mt-3 text-xs text-slate-500">Since {formatIso(state.now.since)}</div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-4 py-4 text-sm text-slate-400">No active task right now.</div>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <MiniSection title={`Next Up (${stats.nextCount})`} empty="No queued items.">
                  {state?.next.map((item, index) => (
                    <li key={`${item.title}-${index}`} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                      <div className="mb-1 text-sm font-medium text-slate-100">{item.title}</div>
                      {item.summary ? <div className="mb-2 text-xs text-slate-400">{item.summary}</div> : null}
                      <div className="text-[11px] uppercase tracking-[0.14em] text-cyan-300">{categoryLabel(item.category)}</div>
                    </li>
                  ))}
                </MiniSection>

                <MiniSection title={`Recent Done (${stats.doneCount})`} empty="No recent completions.">
                  {state?.recent.done.map((item) => (
                    <li key={`${item.title}-${item.ts}`} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                      <div className="mb-1 text-sm font-medium text-slate-100">{item.title}</div>
                      <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-emerald-300">{categoryLabel(item.category)}</div>
                      <div className="text-xs text-slate-500">{formatIso(item.ts)}</div>
                      {item.commit ? <div className="mt-1 text-xs text-slate-400">commit: {item.commit}</div> : null}
                    </li>
                  ))}
                </MiniSection>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Recent Event Stream" className="min-h-0" bodyClassName="min-h-0 flex-1">
            <div className="console-scroll-area h-full space-y-3 overflow-y-auto pr-1">
              {events.length === 0 ? <div className="text-sm text-slate-500">No recent events.</div> : null}
              {events.map((event) => (
                <article key={`${event.id}-${event.ts}`} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-100">{event.title}</div>
                    <div className="text-xs text-slate-500">{formatIso(event.ts)}</div>
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">{event.type}</span>
                    <span className="rounded-full border border-cyan-500/40 px-2 py-0.5 text-cyan-300">{categoryLabel(event.category)}</span>
                  </div>
                  {event.summary ? <div className="text-sm text-slate-300">{event.summary}</div> : null}
                </article>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardShell>
  );
}

function MetricCard(props: { label: string; value: string; detail: string; tone?: "normal" | "warn" }) {
  const toneClass = props.tone === "warn" ? "text-amber-300" : "text-cyan-300";
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-4 shadow-[0_0_32px_rgba(15,23,42,0.85)]">
      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">{props.label}</div>
      <div className={`text-3xl font-semibold ${toneClass}`}>{props.value}</div>
      <div className="mt-2 text-xs text-slate-400">{props.detail}</div>
    </div>
  );
}

function MiniSection(props: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(props.children) ? props.children.length > 0 : Boolean(props.children);
  return (
    <section>
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-slate-400">{props.title}</div>
      <ul className="space-y-3">{hasChildren ? props.children : <li className="text-sm text-slate-500">{props.empty}</li>}</ul>
    </section>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  if (token) {
    return (
      <OverviewPage
        onLogout={() => {
          clearToken();
          setTokenState(null);
          setError(null);
          setPassword("");
        }}
      />
    );
  }

  return (
    <DashboardLanding
      password={password}
      submitting={submitting}
      error={error}
      hasToken={Boolean(token)}
      onPasswordChange={setPassword}
      onSubmit={async () => {
        setError(null);
        setSubmitting(true);
        try {
          await loginAdmin(password);
          setTokenState(getToken());
          router.push("/");
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setSubmitting(false);
        }
      }}
      onLogout={() => {
        clearToken();
        setTokenState(null);
        setError(null);
        setPassword("");
        router.push("/");
      }}
    />
  );
}
