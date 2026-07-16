"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./language-provider";
import {
  getOfflinePagePath,
  isOfflinePagePath,
  OFFLINE_NAVIGATION_BLOCKED_EVENT
} from "../lib/pwa-navigation";

const copy = {
  zh: {
    summary: "当前处于离线模式。仅 Tracker 与开发者工具箱可用；搜索和其他页面需要联网。",
    blocked: "这个页面没有离线副本，请联网后再试。",
    tracker: "Tracker",
    tools: "开发者工具箱"
  },
  en: {
    summary: "You are offline. Only Tracker and Developer Tools are available; search and other pages need a connection.",
    blocked: "This page is not available offline. Reconnect and try again.",
    tracker: "Tracker",
    tools: "Developer Tools"
  }
} as const;

export function PwaOfflineBoundary() {
  const { locale } = useI18n();
  const t = copy[locale];
  const [offline, setOffline] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const updateConnectivity = () => {
      const nextOffline = !navigator.onLine;
      setOffline(nextOffline);
      if (!nextOffline) setBlocked(false);
    };
    const showBlockedMessage = () => {
      setOffline(true);
      setBlocked(true);
      window.setTimeout(() => messageRef.current?.focus(), 0);
    };
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      const isCachedHardNavigation =
        url.search === "" &&
        isOfflinePagePath(url.pathname) &&
        (isOfflinePagePath(window.location.pathname) || !navigator.onLine);
      if (isCachedHardNavigation) {
        event.preventDefault();
        event.stopPropagation();
        window.location.assign(`${url.pathname}${url.hash}`);
        return;
      }
      if (navigator.onLine) return;

      event.preventDefault();
      event.stopPropagation();
      showBlockedMessage();
    };

    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    window.addEventListener(OFFLINE_NAVIGATION_BLOCKED_EVENT, showBlockedMessage);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
      window.removeEventListener(OFFLINE_NAVIGATION_BLOCKED_EVENT, showBlockedMessage);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  if (!offline) return null;

  return (
    <aside
      className="border-b border-accent/30 bg-accent/10 px-4 py-3 text-sm text-secondary sm:px-6"
      data-testid="offline-navigation-status"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <p ref={messageRef} tabIndex={-1} role="status" aria-live="polite">
          {blocked ? t.blocked : t.summary}
        </p>
        <nav aria-label={locale === "en" ? "Offline pages" : "离线页面"} className="flex gap-4">
          <a
            href={getOfflinePagePath("tracker", locale)}
            data-offline-route="tracker"
            className="font-semibold text-accent hover:text-accent-strong"
          >
            {t.tracker}
          </a>
          <a
            href={getOfflinePagePath("tools", locale)}
            data-offline-route="tools"
            className="font-semibold text-accent hover:text-accent-strong"
          >
            {t.tools}
          </a>
        </nav>
      </div>
    </aside>
  );
}
