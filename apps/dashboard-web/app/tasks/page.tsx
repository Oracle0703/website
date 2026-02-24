"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DashboardShell, GlassCard } from "../../exm";
import { ErrorBox } from "../../components/ErrorBox";
import { createTask, getTasks, updateTaskStatus } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import { formatIso } from "../../lib/format";
import { useRequireAuth } from "../../lib/useRequireAuth";
import type { Task, TaskStatus } from "../../lib/types";

const STATUS_OPTIONS: TaskStatus[] = ["todo", "doing", "done"];

export default function TasksPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const byStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    for (const item of tasks) {
      groups[item.status].push(item);
    }
    return groups;
  }, [tasks]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const doc = await getTasks();
      setTasks(doc.value.tasks);
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
      activeTab="tasks"
      title="Task Pipeline"
      subtitle="Track work items by status and update progress in place."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Total: {tasks.length}</span>}
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
      <div className="space-y-5">
        <GlassCard title="Create Task">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setCreating(true);
              try {
                await createTask(newTitle);
                setNewTitle("");
                await refresh();
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : String(err));
              } finally {
                setCreating(false);
              }
            }}
          >
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
              New task title
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="e.g. Review MR#3"
                required
                className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 placeholder:text-slate-500"
              />
            </label>

            <button
              type="submit"
              disabled={creating}
              className="rounded-md border border-cyan-400/70 bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(56,189,248,0.35)] transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Adding..." : "Add"}
            </button>
          </form>
        </GlassCard>

        {error ? <ErrorBox title="Request failed" message={error} /> : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {STATUS_OPTIONS.map((status) => (
            <GlassCard key={status} title={`${status.toUpperCase()} (${byStatus[status].length})`}>
              <div className="space-y-3">
                {byStatus[status].length === 0 ? <div className="text-sm text-slate-500">No tasks.</div> : null}

                {byStatus[status].map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                    <div className="mb-1 text-sm font-medium text-slate-100">{task.title}</div>
                    <div className="mb-2 text-xs text-slate-500">Updated: {formatIso(task.updatedAt)}</div>

                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Status</span>
                      <select
                        className="min-w-24 rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-slate-100"
                        value={task.status}
                        onChange={async (event) => {
                          const next = event.target.value as TaskStatus;
                          setError(null);
                          try {
                            await updateTaskStatus(task.id, next);
                            await refresh();
                          } catch (err: unknown) {
                            setError(err instanceof Error ? err.message : String(err));
                          }
                        }}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
