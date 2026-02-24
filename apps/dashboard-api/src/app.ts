import express from "express";
import type { Request } from "express";
import type { JsonObjectStore, JsonValue } from "./types.js";
import { requireAuth, signAdminToken, type AuthConfig } from "./auth.js";

type Task = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  updatedAt: string;
};

type TasksDoc = {
  tasks: Task[];
};

type LogEntry = {
  ts: string;
  message: string;
  subtitle?: string;
  meta?: Record<string, JsonValue>;
};

type StatusDoc = {
  updatedAt: string;
  text: string;
};

type IngestCategory = "mr" | "deploy" | "ops" | "content" | "idle" | "cron" | "other";

type IngestEventType =
  | "task.created"
  | "task.started"
  | "task.progress"
  | "task.completed"
  | "task.failed"
  | "note";

type IngestEvent = {
  id: string;
  ts: string;
  type: IngestEventType;
  category: IngestCategory;
  title: string;
  summary?: string;
  details?: Record<string, JsonValue>;
};

type StateDoc = {
  updatedAt: string;
  now: null | {
    title: string;
    summary?: string;
    category: IngestCategory;
    since: string;
    links?: Array<{ label: string; url: string }>;
  };
  next: Array<{ title: string; summary?: string; category: IngestCategory }>;
  recent: {
    done: Array<{ title: string; ts: string; category: IngestCategory; commit?: string }>;
    failed: Array<{ title: string; ts: string; category: IngestCategory; reason?: string }>;
  };
};

function todayYmd(t = new Date()): string {
  // Use server local time; for production you may want Asia/Shanghai forced.
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clampRecent<T>(arr: T[], max = 20) {
  if (arr.length <= max) return arr;
  return arr.slice(0, max);
}

function defaultState(): StateDoc {
  return {
    updatedAt: new Date(0).toISOString(),
    now: null,
    next: [],
    recent: { done: [], failed: [] }
  };
}

function requireIngestToken(reqToken: string | undefined) {
  const token = process.env.INGEST_TOKEN;
  if (!token) return { ok: false as const, status: 503, error: "ingest_token_not_configured" };
  if (!reqToken) return { ok: false as const, status: 401, error: "missing_bearer_token" };
  if (reqToken !== token) return { ok: false as const, status: 403, error: "invalid_token" };
  return { ok: true as const };
}

function normalizeEventId(req: Request, body: any) {
  const headerKey = req.header("idempotency-key")?.trim();
  const bodyId = typeof body?.id === "string" ? body.id.trim() : "";
  return bodyId || headerKey || crypto.randomUUID();
}

function isValidIngestType(v: unknown): v is IngestEventType {
  return (
    v === "task.created" ||
    v === "task.started" ||
    v === "task.progress" ||
    v === "task.completed" ||
    v === "task.failed" ||
    v === "note"
  );
}

function isValidCategory(v: unknown): v is IngestCategory {
  return v === "mr" || v === "deploy" || v === "ops" || v === "content" || v === "idle" || v === "cron" || v === "other";
}

function parseIngestEvent(req: Request): { ok: true; event: IngestEvent } | { ok: false; error: string } {
  const body = req.body ?? {};

  const id = normalizeEventId(req, body);
  const ts = typeof body.ts === "string" && body.ts ? body.ts : new Date().toISOString();

  if (!isValidIngestType(body.type)) return { ok: false, error: "invalid_type" };
  const category = isValidCategory(body.category) ? body.category : "other";

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return { ok: false, error: "missing_title" };

  const summary = typeof body.summary === "string" ? body.summary.trim() : undefined;
  const details = typeof body.details === "object" && body.details ? (body.details as Record<string, JsonValue>) : undefined;

  return { ok: true, event: { id, ts, type: body.type, category, title, summary, details } };
}

async function safeGet<T>(store: JsonObjectStore, key: string, fallback: T): Promise<{ value: T; etag?: string }> {
  try {
    return await store.getJson<T>(key);
  } catch {
    return { value: fallback };
  }
}

export function createApp(params: { store: JsonObjectStore; auth: AuthConfig; prefix?: string }) {
  const { store, auth } = params;

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Allow dashboard-web to talk to this API in local dev (different port => CORS).
  // Configure via `CORS_ORIGINS` (comma-separated). Use `*` to allow any origin.
  const corsOriginsRaw = process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000";
  const corsOrigins = new Set(
    corsOriginsRaw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  );
  const corsAllowAll = corsOrigins.has("*");

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && (corsAllowAll || corsOrigins.has(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }

    if (req.method === "OPTIONS") return res.status(204).end();
    return next();
  });

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.post("/auth/login", (req, res) => {
    const password = String(req.body?.password ?? "");
    if (!password) return res.status(400).json({ error: "missing_password" });
    if (password !== auth.adminPassword) return res.status(401).json({ error: "wrong_password" });
    return res.json({ token: signAdminToken(auth) });
  });

  function readBearerToken(req: Request) {
    const authHeader = String(req.header("authorization") ?? "");
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
  }

  // Jarvis ingest endpoint: protected by separate token, not the admin JWT.
  app.post("/ingest/event", async (req, res) => {
    const tokenCheck = requireIngestToken(readBearerToken(req) ?? undefined);
    if (!tokenCheck.ok) return res.status(tokenCheck.status).json({ error: tokenCheck.error });

    const parsed = parseIngestEvent(req);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const event = parsed.event;
    const d = new Date(event.ts);
    const keyDate = Number.isNaN(d.getTime()) ? todayYmd() : todayYmd(d);

    const eventsKey = `events/${keyDate}.json`;
    const existing = await safeGet<IngestEvent[]>(store, eventsKey, []);
    if (existing.value.some((item) => item.id === event.id)) {
      return res.json({ ok: true, duplicate: true });
    }

    await store.putJson(eventsKey, [...existing.value, event]);

    const currentState = await safeGet<StateDoc>(store, "state.json", defaultState());
    const state: StateDoc = currentState.value;

    const updatedAt = event.ts;

    if (event.type === "task.created") {
      state.next = clampRecent([{ title: event.title, summary: event.summary, category: event.category }, ...state.next], 10);
    }

    if (event.type === "task.started") {
      state.now = {
        title: event.title,
        summary: event.summary,
        category: event.category,
        since: event.ts
      };
    }

    if (event.type === "task.progress") {
      state.now = state.now
        ? { ...state.now, summary: event.summary ?? state.now.summary }
        : { title: event.title, summary: event.summary, category: event.category, since: event.ts };
    }

    if (event.type === "task.completed") {
      state.recent.done = clampRecent(
        [
          {
            title: event.title,
            ts: event.ts,
            category: event.category,
            commit: typeof event.details?.commit === "string" ? (event.details.commit as string) : undefined
          },
          ...state.recent.done
        ],
        20
      );
      state.now = null;
    }

    if (event.type === "task.failed") {
      state.recent.failed = clampRecent(
        [
          {
            title: event.title,
            ts: event.ts,
            category: event.category,
            reason: event.summary
          },
          ...state.recent.failed
        ],
        20
      );
      state.now = null;
    }

    state.updatedAt = updatedAt;

    // Best-effort: keep state.json eventually consistent.
    try {
      await store.putJson("state.json", state, currentState.etag ? { ifMatch: currentState.etag } : undefined);
    } catch (e: any) {
      // If another writer updated state concurrently, accept last-write-wins.
      if (e?.status !== 412) throw e;
      await store.putJson("state.json", state);
    }

    return res.status(201).json({ ok: true, id: event.id });
  });

  app.use(requireAuth(auth));

  // Aggregated state for dashboard homepage.
  app.get("/state", async (_req, res) => {
    const doc = await safeGet<StateDoc>(store, "state.json", defaultState());
    return res.json(doc.value);
  });

  // Event timeline (ingested from Jarvis).
  app.get("/events", async (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days ?? 7), 1), 31);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 200), 1), 1000);

    const out: IngestEvent[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `events/${todayYmd(d)}.json`;
      const part = await safeGet<IngestEvent[]>(store, key, []);
      out.push(...part.value);
    }

    out.sort((a, b) => (a.ts < b.ts ? 1 : -1));
    return res.json({ events: out.slice(0, limit) });
  });

  // Tasks
  app.get("/tasks", async (_req, res) => {
    const doc = await safeGet<TasksDoc>(store, "tasks.json", { tasks: [] });
    return res.json(doc);
  });

  app.post("/tasks", async (req, res) => {
    const title = String(req.body?.title ?? "").trim();
    if (!title) return res.status(400).json({ error: "missing_title" });

    const current = await safeGet<TasksDoc>(store, "tasks.json", { tasks: [] });
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status: "todo",
      updatedAt: now
    };

    const etag = current.etag;
    try {
      await store.putJson("tasks.json", { tasks: [...current.value.tasks, task] }, etag ? { ifMatch: etag } : undefined);
      return res.status(201).json({ task });
    } catch (e: any) {
      // ali-oss throws with status=412 on If-Match mismatch
      if (e?.status === 412) return res.status(409).json({ error: "etag_conflict" });
      throw e;
    }
  });

  app.patch("/tasks/:id", async (req, res) => {
    const id = String(req.params.id);
    const status = req.body?.status as Task["status"] | undefined;
    if (!status || !["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({ error: "invalid_status" });
    }

    const current = await safeGet<TasksDoc>(store, "tasks.json", { tasks: [] });
    const now = new Date().toISOString();
    const tasks = current.value.tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: now } : t));

    const etag = current.etag;
    try {
      await store.putJson("tasks.json", { tasks }, etag ? { ifMatch: etag } : undefined);
      return res.json({ ok: true });
    } catch (e: any) {
      if (e?.status === 412) return res.status(409).json({ error: "etag_conflict" });
      throw e;
    }
  });

  // Logs: append-only in daily partitions
  app.post("/logs", async (req, res) => {
    const message = String(req.body?.message ?? "").trim();
    if (!message) return res.status(400).json({ error: "missing_message" });

    const entry: LogEntry = {
      ts: new Date().toISOString(),
      message,
      subtitle: typeof req.body?.subtitle === "string" ? req.body.subtitle : undefined,
      meta: typeof req.body?.meta === "object" && req.body?.meta ? req.body.meta : undefined
    };

    const key = `logs/${todayYmd()}.json`;
    const current = await safeGet<LogEntry[]>(store, key, []);
    await store.putJson(key, [...current.value, entry]);
    return res.status(201).json({ ok: true });
  });

  app.get("/logs", async (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days ?? 7), 1), 31);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 200), 1), 1000);

    const out: LogEntry[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `logs/${todayYmd(d)}.json`;
      const part = await safeGet<LogEntry[]>(store, key, []);
      out.push(...part.value);
    }

    out.sort((a, b) => (a.ts < b.ts ? 1 : -1));
    return res.json({ entries: out.slice(0, limit) });
  });

  // Status
  app.get("/status", async (_req, res) => {
    const doc = await safeGet<StatusDoc>(store, "status.json", { updatedAt: new Date(0).toISOString(), text: "" });
    return res.json(doc.value);
  });

  app.post("/status", async (req, res) => {
    const text = String(req.body?.text ?? "");
    const doc: StatusDoc = { updatedAt: new Date().toISOString(), text };
    await store.putJson("status.json", doc);
    return res.status(201).json({ ok: true });
  });

  return app;
}
