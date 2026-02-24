"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearToken } from "../lib/auth";

function NavLink(props: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={props.href}
      className={
        props.active
          ? "inline-flex items-center rounded-md border border-edge-strong bg-base px-3 py-1.5 text-sm font-medium text-primary"
          : "inline-flex items-center rounded-md border border-transparent px-3 py-1.5 text-sm text-secondary hover:border-edge hover:text-primary"
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-4 z-40 rounded-xl border px-4 py-4 transition-all duration-200 ${
        isScrolled
          ? "border-edge-strong bg-surface/72 shadow-[0_18px_42px_-24px_rgba(56,189,248,0.95)] backdrop-blur-md"
          : "border-edge bg-surface/85 shadow-[0_14px_38px_-26px_rgba(56,189,248,0.85)] backdrop-blur-sm"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg border border-edge-strong bg-base text-xs font-semibold text-subtle sm:flex">
            MI
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Meaningful Ink</div>
            <div className="text-sm font-semibold text-primary">Dashboard Console</div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink href="/" label="Login" active={pathname === "/"} />
            <NavLink href="/tasks" label="Tasks" active={pathname.startsWith("/tasks")} />
            <NavLink href="/logs" label="Logs" active={pathname.startsWith("/logs")} />
            <NavLink href="/status" label="Status" active={pathname.startsWith("/status")} />
          </nav>
        </div>

        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            clearToken();
            router.push("/");
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
