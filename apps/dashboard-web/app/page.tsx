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
    <div className="page-shell">
      <DashboardHeader />

      <section className="page-card mx-auto mt-6 w-full max-w-md px-6 py-7">
        <div className="mb-5">
          <div className="mb-2 inline-flex rounded-full border border-edge bg-base px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
            Secure Access
          </div>
          <h1 className="page-title">Login</h1>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Enter <code className="code-pill">ADMIN_PASSWORD</code> to get an
            admin token.
          </p>
        </div>

        {existingToken ? (
          <div className="mb-4 rounded-md border border-edge bg-base/85 px-4 py-3 text-sm text-secondary">
            You already have a token in{" "}
            <code className="code-pill">localStorage</code>. You can go to{" "}
            <Link href="/tasks">/tasks</Link>.
          </div>
        ) : null}

        <form
          className="flex flex-col gap-4"
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
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-secondary">
              ADMIN_PASSWORD
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>

          {error ? <ErrorBox title="Login failed" message={error} /> : null}
        </form>

        <div className="mt-6 rounded-md border border-edge bg-base/80 px-3 py-2 text-xs text-muted">
          Tip: configure API base via{" "}
          <code className="code-pill">NEXT_PUBLIC_DASHBOARD_API_BASE</code>.
        </div>
      </section>
    </div>
  );
}
