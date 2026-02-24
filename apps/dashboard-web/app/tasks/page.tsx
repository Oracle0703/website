"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardHeader } from "../../components/DashboardHeader";
import { ErrorBox } from "../../components/ErrorBox";
import { createTask, getTasks, updateTaskStatus } from "../../lib/api";
import { formatIso } from "../../lib/format";
import { useRequireAuth } from "../../lib/useRequireAuth";
import type { Task, TaskStatus } from "../../lib/types";

const STATUS_OPTIONS: TaskStatus[] = ["todo", "doing", "done"];

export default function TasksPage() {
  const { ready } = useRequireAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const byStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    for (const t of tasks) groups[t.status].push(t);
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
    <div className="page-shell">
      <DashboardHeader />

      <div className="page-head">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-desc mt-1">Track work items by status and update progress in place.</p>
        </div>
        <button type="button" className="btn-ghost" disabled={loading} onClick={() => void refresh()}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <form
        className="page-card flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
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
        <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-secondary">New task title</span>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Review MR#3"
            required
          />
        </label>

        <button type="submit" disabled={creating}>
          {creating ? "Adding..." : "Add"}
        </button>
      </form>

      {error ? <ErrorBox title="Request failed" message={error} /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUS_OPTIONS.map((status) => (
          <section key={status} className="page-card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-edge bg-base/80 px-4 py-3 text-sm font-medium text-primary">
              <span>{status.toUpperCase()}</span>
              <span className="rounded-full border border-edge px-2 py-0.5 text-xs text-secondary">{byStatus[status].length}</span>
            </div>

            <div className="flex flex-col gap-3 p-4">
              {byStatus[status].length === 0 ? <div className="text-sm text-muted">No tasks.</div> : null}

              {byStatus[status].map((t) => (
                <div key={t.id} className="rounded-lg border border-edge bg-base/80 px-3 py-3">
                  <div className="mb-2 text-sm font-medium text-primary">{t.title}</div>
                  <div className="mb-2 text-xs text-muted">Updated: {formatIso(t.updatedAt)}</div>
                  <label className="flex items-center gap-2 text-xs text-secondary">
                    <span>Status</span>
                    <select
                      className="min-w-24"
                      value={t.status}
                      onChange={async (e) => {
                        const next = e.target.value as TaskStatus;
                        setError(null);
                        try {
                          await updateTaskStatus(t.id, next);
                          await refresh();
                        } catch (err: unknown) {
                          setError(err instanceof Error ? err.message : String(err));
                        }
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="text-xs text-muted">API: GET /tasks, POST /tasks, PATCH /tasks/:id</div>
    </div>
  );
}
