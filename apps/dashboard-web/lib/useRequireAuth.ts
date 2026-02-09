"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "./auth";

export function useRequireAuth(): { token: string | null; ready: boolean } {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    setReady(true);
    if (!t) router.push("/");
  }, [router]);

  return { token, ready };
}
