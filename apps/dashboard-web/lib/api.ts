import { clearToken, getToken, setToken } from "./auth";
import type { EventsGetResponse, LogsGetResponse, StateDoc, StatusDoc, TaskStatus, TasksGetResponse } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_DASHBOARD_API_BASE ?? "https://ms.meaningful.ink/api/dashboard";

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, params: { status: number; body: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = params.status;
    this.body = params.body;
  }
}

async function readBodySafe(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = joinUrl(API_BASE, path);

  const headers = new Headers(init?.headers);
  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    const body = await readBodySafe(res);
    throw new ApiError(`API ${res.status} ${res.statusText}`, { status: res.status, body });
  }

  return res;
}

export async function loginAdmin(password: string): Promise<{ token: string }> {
  const url = joinUrl(API_BASE, "/auth/login");
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await readBodySafe(res);
    throw new ApiError(`Login failed (${res.status})`, { status: res.status, body });
  }

  const data = (await res.json()) as { token?: string };
  if (!data?.token) throw new ApiError("Login response missing token", { status: 500, body: data });

  setToken(data.token);
  return { token: data.token };
}

export async function getState(): Promise<StateDoc> {
  const res = await apiFetch("/state");
  return (await res.json()) as StateDoc;
}

export async function getEvents(params?: { days?: number; limit?: number }): Promise<EventsGetResponse> {
  const days = params?.days ?? 7;
  const limit = params?.limit ?? 50;
  const qs = new URLSearchParams({ days: String(days), limit: String(limit) });
  const res = await apiFetch(`/events?${qs.toString()}`);
  return (await res.json()) as EventsGetResponse;
}

export async function getTasks(): Promise<TasksGetResponse> {
  const res = await apiFetch("/tasks");
  return (await res.json()) as TasksGetResponse;
}

export async function createTask(title: string) {
  const res = await apiFetch("/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title })
  });
  return (await res.json()) as { task: { id: string } };
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const res = await apiFetch(`/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status })
  });
  return (await res.json()) as { ok: boolean };
}

export async function getLogs(params?: { days?: number; limit?: number }): Promise<LogsGetResponse> {
  const days = params?.days ?? 7;
  const limit = params?.limit ?? 200;
  const qs = new URLSearchParams({ days: String(days), limit: String(limit) });
  const res = await apiFetch(`/logs?${qs.toString()}`);
  return (await res.json()) as LogsGetResponse;
}

export async function getStatus(): Promise<StatusDoc> {
  const res = await apiFetch("/status");
  return (await res.json()) as StatusDoc;
}

export async function setStatus(text: string) {
  const res = await apiFetch("/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text })
  });
  return (await res.json()) as { ok: boolean };
}
