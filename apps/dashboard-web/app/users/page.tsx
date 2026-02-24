"use client";

import { useRouter } from "next/navigation";

import { DashboardShell, GlassCard } from "../../exm";
import { clearToken } from "../../lib/auth";
import { useRequireAuth } from "../../lib/useRequireAuth";

const USERS = [
  { name: "Admin", role: "Owner", status: "Active" },
  { name: "Ops Bot", role: "Automation", status: "Active" },
  { name: "Reviewer", role: "Analyst", status: "Invited" }
];

export default function UsersPage() {
  const router = useRouter();
  useRequireAuth();

  return (
    <DashboardShell
      activeTab="users"
      title="User Directory"
      subtitle="Review dashboard access roles and current account status."
      onLogout={() => {
        clearToken();
        router.push("/");
      }}
      meta={<span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1">Users: {USERS.length}</span>}
    >
      <GlassCard title="Members">
        <div className="space-y-3">
          {USERS.map((user) => (
            <div key={user.name} className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2 text-sm">
              <div>
                <div className="font-medium text-slate-100">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-cyan-300">{user.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </DashboardShell>
  );
}
