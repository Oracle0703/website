import express from "express";
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

function todayYmd(t = new Date()): string {
  // Use server local time; for production you may want Asia/Shanghai forced.
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

  app.use(requireAuth(auth));

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
