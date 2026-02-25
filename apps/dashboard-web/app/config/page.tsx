"use client";

import { useRouter } from "next/navigation";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken } from "../../lib/auth";
import { useRequireAuth } from "../../lib/useRequireAuth";

export default function ConfigPage() {
  const router = useRouter();
  useRequireAuth();

  return (
    <DashboardShell
      activeTab="config"
      title="Config Center"
      subtitle="Centralized runtime configuration for dashboard services."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Scope: dashboard</span>}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="console-scroll-area min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <GlassCard title="Environment">
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  NODE_ENV: <span className="text-cyan-300">production</span>
                </p>
                <p>
                  Theme: <span className="text-cyan-300">dark console</span>
                </p>
                <p>
                  Auth: <span className="text-cyan-300">token in localStorage</span>
                </p>
              </div>
            </GlassCard>

            <GlassCard title="API Endpoints">
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="text-slate-500">Auth:</span> /auth/login
                </p>
                <p>
                  <span className="text-slate-500">Tasks:</span> /tasks
                </p>
                <p>
                  <span className="text-slate-500">Logs:</span> /logs
                </p>
                <p>
                  <span className="text-slate-500">Status:</span> /status
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
