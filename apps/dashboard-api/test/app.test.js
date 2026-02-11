import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
class MemStore {
    data = new Map();
    async getJson(key) {
        const v = this.data.get(key);
        if (!v)
            throw new Error("not_found");
        return { value: v.json, etag: v.etag };
    }
    async putJson(key, value, opts) {
        const current = this.data.get(key);
        if (opts?.ifMatch) {
            if (!current)
                throw Object.assign(new Error("precondition"), { status: 412 });
            if (current.etag !== opts.ifMatch)
                throw Object.assign(new Error("precondition"), { status: 412 });
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
    assert.equal(typeof addr, "object");
    const base = `http://127.0.0.1:${addr.port}`;
    return { base, close: () => new Promise((r) => server.close(() => r())), store, auth };
}
async function login(base, password = "pw") {
    const res = await fetch(`${base}/api/auth/login`, {
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
        const res2 = await fetch(`${base}/api/tasks`);
        assert.equal(res2.status, 401);
        const res3 = await fetch(`${base}/api/tasks`, {
            headers: { authorization: `Bearer ${body.token}` }
        });
        assert.equal(res3.status, 200);
    }
    finally {
        await close();
    }
});
test("tasks CRUD happy path", async () => {
    const { base, close } = await startServer();
    try {
        const { body } = await login(base);
        const token = body.token;
        const create = await fetch(`${base}/api/tasks`, {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ title: "t1" })
        });
        assert.equal(create.status, 201);
        const created = await create.json();
        assert.ok(created.task?.id);
        const list = await fetch(`${base}/api/tasks`, { headers: { authorization: `Bearer ${token}` } });
        assert.equal(list.status, 200);
        const listed = await list.json();
        assert.equal(listed.value.tasks.length, 1);
        const patch = await fetch(`${base}/api/tasks/${created.task.id}`, {
            method: "PATCH",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ status: "done" })
        });
        assert.equal(patch.status, 200);
    }
    finally {
        await close();
    }
});
test("logs append then read contains entry", async () => {
    const { base, close } = await startServer();
    try {
        const { body } = await login(base);
        const token = body.token;
        const add = await fetch(`${base}/api/logs`, {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ message: "m" })
        });
        assert.equal(add.status, 201);
        const get = await fetch(`${base}/api/logs?days=1&limit=10`, { headers: { authorization: `Bearer ${token}` } });
        assert.equal(get.status, 200);
        const data = await get.json();
        assert.equal(data.entries.length, 1);
        assert.equal(data.entries[0].message, "m");
    }
    finally {
        await close();
    }
});
