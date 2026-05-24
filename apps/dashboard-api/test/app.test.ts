import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import type { JsonObjectStore } from "../src/types.js";

class MemStore implements JsonObjectStore {
  private data = new Map<string, { json: any; etag: string }>();
  putCalls: Array<{ key: string; opts?: { ifMatch?: string; ifNoneMatch?: "*" } }> = [];
  failGetKeys = new Set<string>();
  conflictOnceKeys = new Set<string>();

  seed<T>(key: string, value: T, etag = "seed-etag") {
    this.data.set(key, { json: value, etag });
  }

  getRaw<T>(key: string): T | undefined {
    return this.data.get(key)?.json as T | undefined;
  }

  async getJson<T>(key: string): Promise<{ value: T; etag?: string }> {
    if (this.failGetKeys.has(key)) {
      throw Object.assign(new Error("store_down"), { status: 503 });
    }
    const v = this.data.get(key);
    if (!v) throw Object.assign(new Error("not_found"), { status: 404 });
    return { value: v.json as T, etag: v.etag };
  }

  async putJson<T>(key: string, value: T, opts?: { ifMatch?: string; ifNoneMatch?: "*" }): Promise<{ etag?: string }> {
    this.putCalls.push({ key, opts });
    if (this.conflictOnceKeys.has(key)) {
      this.conflictOnceKeys.delete(key);
      throw Object.assign(new Error("precondition"), { status: 412 });
    }

    const current = this.data.get(key);
    if (opts?.ifNoneMatch === "*" && current) {
      throw Object.assign(new Error("precondition"), { status: 412 });
    }

    if (opts?.ifMatch) {
      if (!current) throw Object.assign(new Error("precondition"), { status: 412 });
      if (current.etag !== opts.ifMatch) throw Object.assign(new Error("precondition"), { status: 412 });
    }

    const etag = `etag-${Math.random().toString(16).slice(2)}`;
    this.data.set(key, { json: value, etag });
    return { etag };
  }
}

async function startServer() {
  const store = new MemStore();
  const auth = { adminPassword: "pw", jwtSecret: "secret" };
  const app = createApp({ store, auth });
  const server = app.listen(0);
  const addr = server.address();
  assert.ok(addr && typeof addr === "object" && "port" in addr);
  const base = `http://127.0.0.1:${addr.port}`;
  return { base, close: () => new Promise<void>((r) => server.close(() => r())), store, auth };
}

async function login(base: string, password = "pw") {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password })
  });
  const body = await res.json();
  return { res, body };
}

function localYmd(t = new Date()): string {
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

test("login success and auth required", async () => {
  const { base, close } = await startServer();
  try {
    const { res, body } = await login(base);
    assert.equal(res.status, 200);
    assert.ok(body.token);

    const res2 = await fetch(`${base}/tasks`);
    assert.equal(res2.status, 401);

    const res3 = await fetch(`${base}/tasks`, {
      headers: { authorization: `Bearer ${body.token}` }
    });
    assert.equal(res3.status, 200);
  } finally {
    await close();
  }
});

test("tasks CRUD happy path", async () => {
  const { base, close } = await startServer();
  try {
    const { body } = await login(base);
    const token = body.token as string;

    const create = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "t1" })
    });
    assert.equal(create.status, 201);
    const created = await create.json();
    assert.ok(created.task?.id);

    const list = await fetch(`${base}/tasks`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(list.status, 200);
    const listed = await list.json();
    assert.equal(listed.value.tasks.length, 1);

    const patch = await fetch(`${base}/tasks/${created.task.id}`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ status: "done" })
    });
    assert.equal(patch.status, 200);
  } finally {
    await close();
  }
});

test("patching a missing task returns 404", async () => {
  const { base, close } = await startServer();
  try {
    const { body } = await login(base);
    const token = body.token as string;

    const patch = await fetch(`${base}/tasks/missing`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ status: "done" })
    });
    assert.equal(patch.status, 404);
    const data = await patch.json();
    assert.equal(data.error, "task_not_found");
  } finally {
    await close();
  }
});

test("store read failures are not treated as empty documents", async () => {
  const { base, close, store } = await startServer();
  try {
    const { body } = await login(base);
    const token = body.token as string;
    store.failGetKeys.add("tasks.json");

    const res = await fetch(`${base}/tasks`, {
      headers: { authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 500);
    const data = await res.json();
    assert.equal(data.error, "internal_error");
  } finally {
    await close();
  }
});

test("logs append then read contains entry", async () => {
  const { base, close } = await startServer();
  try {
    const { body } = await login(base);
    const token = body.token as string;

    const add = await fetch(`${base}/logs`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ message: "m" })
    });
    assert.equal(add.status, 201);

    const get = await fetch(`${base}/logs?days=1&limit=10`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(get.status, 200);
    const data = await get.json();
    assert.equal(data.entries.length, 1);
    assert.equal(data.entries[0].message, "m");
  } finally {
    await close();
  }
});

test("logs append uses conditional writes and retries etag conflicts", async () => {
  const { base, close, store } = await startServer();
  try {
    const { body } = await login(base);
    const token = body.token as string;
    const key = `logs/${localYmd()}.json`;
    store.seed(key, [{ ts: "2026-01-01T00:00:00.000Z", message: "existing" }], "etag-old");
    store.conflictOnceKeys.add(key);

    const add = await fetch(`${base}/logs`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ message: "new" })
    });

    assert.equal(add.status, 201);
    assert.ok(store.putCalls.some((call) => call.key === key && call.opts?.ifMatch));
    const stored = store.getRaw<Array<{ message: string }>>(key) ?? [];
    assert.deepEqual(stored.map((entry) => entry.message), ["existing", "new"]);
  } finally {
    await close();
  }
});

test("state and status endpoints return stable authenticated documents", async () => {
  const { base, close } = await startServer();
  try {
    const stateWithoutAuth = await fetch(`${base}/state`);
    assert.equal(stateWithoutAuth.status, 401);

    const { body } = await login(base);
    const token = body.token as string;

    const stateRes = await fetch(`${base}/state`, {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(stateRes.status, 200);
    assert.deepEqual(await stateRes.json(), {
      updatedAt: "1970-01-01T00:00:00.000Z",
      now: null,
      next: [],
      recent: { done: [], failed: [] }
    });

    const statusGet1 = await fetch(`${base}/status`, {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(statusGet1.status, 200);
    assert.deepEqual(await statusGet1.json(), {
      updatedAt: "1970-01-01T00:00:00.000Z",
      text: ""
    });

    const statusPost = await fetch(`${base}/status`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ text: "dashboard is green" })
    });
    assert.equal(statusPost.status, 201);

    const statusGet2 = await fetch(`${base}/status`, {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(statusGet2.status, 200);
    const status = await statusGet2.json();
    assert.equal(status.text, "dashboard is green");
    assert.match(status.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    await close();
  }
});

test("ingest lifecycle updates next, now, progress, completion, and failure state", async () => {
  process.env.INGEST_TOKEN = "it";

  const { base, close } = await startServer();
  try {
    const { body } = await login(base);
    const token = body.token as string;

    async function ingest(idempotencyKey: string, body: Record<string, unknown>) {
      const res = await fetch(`${base}/ingest/event`, {
        method: "POST",
        headers: {
          authorization: "Bearer it",
          "idempotency-key": idempotencyKey,
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });
      assert.equal(res.status, 201);
      return res;
    }

    const createdTs = new Date().toISOString();
    await ingest("created-1", {
      ts: createdTs,
      type: "task.created",
      category: "content",
      title: "Write next note",
      summary: "queued item"
    });

    const startedTs = new Date().toISOString();
    await ingest("started-1", {
      ts: startedTs,
      type: "task.started",
      category: "ops",
      title: "Ship ingest API",
      summary: "starting"
    });

    const progressTs = new Date().toISOString();
    await ingest("progress-1", {
      ts: progressTs,
      type: "task.progress",
      category: "ops",
      title: "Ship ingest API",
      summary: "tests are running"
    });

    const progressStateRes = await fetch(`${base}/state`, {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(progressStateRes.status, 200);
    const progressState = await progressStateRes.json();
    assert.equal(progressState.now.title, "Ship ingest API");
    assert.equal(progressState.now.summary, "tests are running");
    assert.equal(progressState.now.since, startedTs);
    assert.equal(progressState.next[0].title, "Write next note");

    const completedTs = new Date().toISOString();
    await ingest("completed-1", {
      ts: completedTs,
      type: "task.completed",
      category: "ops",
      title: "Ship ingest API",
      summary: "done",
      details: { commit: "abcd123" }
    });

    const failedTs = new Date().toISOString();
    await ingest("failed-1", {
      ts: failedTs,
      type: "task.failed",
      category: "deploy",
      title: "Deploy dashboard",
      summary: "health check failed"
    });

    const finalStateRes = await fetch(`${base}/state`, {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(finalStateRes.status, 200);
    const finalState = await finalStateRes.json();
    assert.equal(finalState.now, null);
    assert.equal(finalState.recent.done[0].title, "Ship ingest API");
    assert.equal(finalState.recent.done[0].commit, "abcd123");
    assert.equal(finalState.recent.failed[0].title, "Deploy dashboard");
    assert.equal(finalState.recent.failed[0].reason, "health check failed");
  } finally {
    await close();
  }
});

test("ingest event writes timeline and updates state", async () => {
  process.env.INGEST_TOKEN = "it";

  const { base, close } = await startServer();
  try {
    const ts = new Date().toISOString();

    const ingest1 = await fetch(`${base}/ingest/event`, {
      method: "POST",
      headers: {
        authorization: "Bearer it",
        "idempotency-key": "k1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        ts,
        type: "task.started",
        category: "ops",
        title: "Start something",
        summary: "working"
      })
    });
    assert.equal(ingest1.status, 201);

    const { body } = await login(base);
    const token = body.token as string;

    const stateRes = await fetch(`${base}/state`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(stateRes.status, 200);
    const state = await stateRes.json();
    assert.equal(state.now.title, "Start something");

    const eventsRes1 = await fetch(`${base}/events?days=1&limit=10`, {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(eventsRes1.status, 200);
    const events1 = await eventsRes1.json();
    assert.equal(events1.events.length, 1);

    const ingest2 = await fetch(`${base}/ingest/event`, {
      method: "POST",
      headers: {
        authorization: "Bearer it",
        "idempotency-key": "k1",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        ts,
        type: "task.started",
        category: "ops",
        title: "Start something",
        summary: "working"
      })
    });
    assert.equal(ingest2.status, 200);
    const ingest2Body = await ingest2.json();
    assert.equal(ingest2Body.duplicate, true);

    const eventsRes2 = await fetch(`${base}/events?days=1&limit=10`, {
      headers: { authorization: `Bearer ${token}` }
    });
    const events2 = await eventsRes2.json();
    assert.equal(events2.events.length, 1);
  } finally {
    await close();
  }
});

test("ingest idempotency key is the stored event id and deduplicates replays", async () => {
  process.env.INGEST_TOKEN = "it";

  const { base, close, store } = await startServer();
  try {
    const ts = "2026-02-24T06:20:00.000Z";

    const first = await fetch(`${base}/ingest/event`, {
      method: "POST",
      headers: {
        authorization: "Bearer it",
        "idempotency-key": "stable-key",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: "body-id-1",
        ts,
        type: "task.started",
        category: "ops",
        title: "Start with explicit body id",
        summary: "first write"
      })
    });
    assert.equal(first.status, 201);
    const firstBody = await first.json();
    assert.equal(firstBody.id, "stable-key");

    const replay = await fetch(`${base}/ingest/event`, {
      method: "POST",
      headers: {
        authorization: "Bearer it",
        "idempotency-key": "stable-key",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: "body-id-2",
        ts,
        type: "task.started",
        category: "ops",
        title: "Replay with a different body id",
        summary: "second write"
      })
    });
    assert.equal(replay.status, 200);
    const replayBody = await replay.json();
    assert.equal(replayBody.duplicate, true);

    const stored = store.getRaw<Array<{ id: string; title: string }>>("events/2026-02-24.json") ?? [];
    assert.equal(stored.length, 1);
    assert.equal(stored[0]?.id, "stable-key");
    assert.equal(stored[0]?.title, "Start with explicit body id");
  } finally {
    await close();
  }
});
