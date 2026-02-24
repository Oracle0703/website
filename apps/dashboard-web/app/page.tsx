"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DashboardLanding from "../exm";
import { loginAdmin } from "../lib/api";
import { clearToken, getToken } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasToken = Boolean(getToken());

  return (
    <DashboardLanding
      password={password}
      submitting={submitting}
      error={error}
      hasToken={hasToken}
      onPasswordChange={setPassword}
      onSubmit={async () => {
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
      onLogout={() => {
        clearToken();
        setError(null);
        setPassword("");
        router.push("/");
      }}
    />
  );
}
