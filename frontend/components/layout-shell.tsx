"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const CHROME_HIDDEN_ROUTES = new Set(["/enter"]);

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = CHROME_HIDDEN_ROUTES.has(pathname);

  return (
    <div className="min-h-screen bg-base">
      {!hideChrome && <SiteHeader />}
      {children}
      {!hideChrome && <SiteFooter />}
    </div>
  );
}
