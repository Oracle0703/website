"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "../lib/i18n-core";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

const copy = {
  zh: {
    install: "安装离线应用",
    installing: "正在打开安装提示…",
    installed: "应用已安装。",
    offlineReady: "Tracker 与开发者工具箱已可离线使用。",
    updateReady: "网站新版本已准备好。",
    update: "更新并重新加载",
    updating: "正在应用新版本…",
    unavailable: "离线功能暂时不可用。"
  },
  en: {
    install: "Install offline app",
    installing: "Opening the install prompt…",
    installed: "The app is installed.",
    offlineReady: "Tracker and the developer toolbox are ready offline.",
    updateReady: "A new site version is ready.",
    update: "Update and reload",
    updating: "Applying the new version…",
    unavailable: "Offline support is temporarily unavailable."
  }
} as const;

export function PwaControls({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [status, setStatus] = useState("");
  const reloadForUpdate = useRef(false);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator) ||
      !window.isSecureContext
    ) {
      return;
    }

    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setStatus(t.installed);
    };
    const handleControllerChange = () => {
      if (reloadForUpdate.current) window.location.reload();
    };
    const watchWorker = (worker: ServiceWorker | null) => {
      if (!worker) return;
      const handleStateChange = () => {
        if (disposed || worker.state !== "installed") return;
        if (navigator.serviceWorker.controller) {
          setWaitingWorker(worker);
          setStatus(t.updateReady);
        } else {
          setStatus(t.offlineReady);
        }
      };
      worker.addEventListener("statechange", handleStateChange);
      handleStateChange();
    };
    const handleUpdateFound = () => watchWorker(registration?.installing ?? null);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registered) => {
        if (disposed) return;
        registration = registered;
        if (registered.waiting) {
          setWaitingWorker(registered.waiting);
          setStatus(t.updateReady);
        }
        watchWorker(registered.installing);
        registered.addEventListener("updatefound", handleUpdateFound);
      })
      .catch(() => {
        if (!disposed) setStatus(t.unavailable);
      });

    return () => {
      disposed = true;
      registration?.removeEventListener("updatefound", handleUpdateFound);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, [t]);

  const install = async () => {
    if (!installPrompt) return;
    setStatus(t.installing);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      setStatus(choice.outcome === "accepted" ? t.installed : "");
    } catch {
      setInstallPrompt(null);
      setStatus(t.unavailable);
    }
  };

  const update = () => {
    if (!waitingWorker) return;
    reloadForUpdate.current = true;
    setStatus(t.updating);
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <div className={installPrompt || waitingWorker ? "flex flex-wrap items-center gap-3 md:justify-end" : "contents"}>
      {installPrompt ? (
        <button
          type="button"
          onClick={() => void install()}
          className="min-h-11 rounded-full border border-edge px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:border-edge-strong hover:text-primary"
        >
          {t.install}
        </button>
      ) : null}
      {waitingWorker ? (
        <button
          type="button"
          onClick={update}
          className="min-h-11 rounded-full border border-accent/60 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-on-accent"
        >
          {t.update}
        </button>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}
