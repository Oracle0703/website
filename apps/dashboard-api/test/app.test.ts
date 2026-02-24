import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import type { JsonObjectStore } from "../src/types.js";

class MemStore implements JsonObjectStore {
  private data = new Map<string, { json: any; etag: string }>();

  async getJson<T>(key: string): Promise<{ value: T; etag?: string }> {
    const v = this.data.get(key);
    if (!v) throw new Error("not_found");
    return { value: v.json as T, etag: v.etag };
  }

  async putJson<T>(key: string, value: T, opts?: { ifMatch?: string }): Promise<{ etag?: string }> {
    const current = this.data.get(key);
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
