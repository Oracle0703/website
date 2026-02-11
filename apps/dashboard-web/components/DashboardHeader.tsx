"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearToken } from "../lib/auth";

function NavLink(props: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={props.href}
      className={
        props.active
          ? "text-primary font-medium"
          : "text-secondary hover:text-primary"
      }
    >
      {props.label}
    </Link>
  );
}

export function DashboardHeader() {
  const router = useRouter();
  const rawPathname = usePathname() || "";
  const pathname = rawPathname.startsWith("/dashboard") ? rawPathname.slice("/dashboard".length) || "/" : rawPathname;

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-primary">Dashboard</div>
        <nav className="flex items-center gap-3 text-sm">
          <NavLink href="/" label="Login" active={pathname === "/"} />
          <span className="text-muted">/</span>
          <NavLink href="/tasks" label="Tasks" active={pathname.startsWith("/tasks")} />
          <span className="text-muted">/</span>
          <NavLink href="/logs" label="Logs" active={pathname.startsWith("/logs")} />
          <span className="text-muted">/</span>
          <NavLink href="/status" label="Status" active={pathname.startsWith("/status")} />
        </nav>
      </div>

      <button
        type="button"
        className="bg-surface text-secondary border border-edge hover:text-primary"
        onClick={() => {
          clearToken();
          router.push("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}
