"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardHeader } from "../components/DashboardHeader";
import { ErrorBox } from "../components/ErrorBox";
import { loginAdmin } from "../lib/api";
import { getToken } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingToken = getToken();

  return (
    <div>
      <DashboardHeader />

      <h1 className="mb-2 text-xl font-semibold text-primary">Login</h1>
      <p className="mb-6 text-sm text-secondary">
        Enter <code className="rounded bg-surface px-1 py-0.5">ADMIN_PASSWORD</code> to get an admin token.
      </p>

      {existingToken ? (
        <div className="mb-4 rounded-md border border-edge bg-surface px-4 py-3 text-sm text-secondary">
          You already have a token in <code className="rounded bg-base px-1 py-0.5">localStorage</code>. You can go to{" "}
          <Link href="/tasks">/tasks</Link>.
        </div>
      ) : null}

      <form
        className="flex max-w-md flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            await loginAdmin(password);
            router.push("/tasks");
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm text-secondary">ADMIN_PASSWORD</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        {error ? <ErrorBox title="Login failed" message={error} /> : null}
      </form>

      <div className="mt-8 text-xs text-muted">
        Tip: configure API base via <code className="rounded bg-surface px-1 py-0.5">NEXT_PUBLIC_DASHBOARD_API_BASE</code>.
      </div>
    </div>
  );
}
