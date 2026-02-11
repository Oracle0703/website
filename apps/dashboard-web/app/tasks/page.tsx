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
    <div>
      <DashboardHeader />

      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-primary">Tasks</h1>
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
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-secondary">New task title</span>
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

      {error ? (
        <div className="mb-6">
          <ErrorBox title="Request failed" message={error} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className="rounded-md border border-edge bg-surface">
            <div className="border-b border-edge px-4 py-2 text-sm font-medium text-primary">
              {status.toUpperCase()} ({byStatus[status].length})
            </div>
            <div className="flex flex-col gap-3 p-4">
              {byStatus[status].length === 0 ? (
                <div className="text-sm text-muted">No tasks.</div>
              ) : null}

              {byStatus[status].map((t) => (
                <div key={t.id} className="rounded-md border border-edge bg-base px-3 py-2">
                  <div className="mb-2 text-sm font-medium text-primary">{t.title}</div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-xs text-muted">Updated: {formatIso(t.updatedAt)}</div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-secondary">
                    <span>Status</span>
                    <select
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
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-muted">
        API: GET /tasks, POST /tasks, PATCH /tasks/:id
      </div>
    </div>
  );
}
