"use client";

import { useRouter } from "next/navigation";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useI18n } from "./language-provider";
import { getShellMessages } from "../lib/i18n-shell";
import type { SiteSearchEntry } from "../lib/site-search";
import { announceBlockedOfflineNavigation } from "../lib/pwa-navigation";

type SearchEnvelope = {
  version: number;
  entries: SiteSearchEntry[];
};

let indexPromise: Promise<SearchEnvelope> | null = null;

function loadSearchIndex() {
  if (!indexPromise) {
    indexPromise = fetch("/search-index.json", {
      headers: { accept: "application/json" },
      credentials: "same-origin"
    }).then(async (response) => {
      if (!response.ok) throw new Error("search_index_unavailable");
      return (await response.json()) as SearchEnvelope;
    });
  }

  return indexPromise;
}

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}

function rankEntry(entry: SiteSearchEntry, rawQuery: string) {
  const query = normalize(rawQuery);
  if (!query) return 0;
  const terms = query.split(/\s+/).filter(Boolean);
  const title = normalize(entry.title);
  const description = normalize(entry.description);
  const keywords = normalize(entry.keywords.join(" "));
  const text = normalize(entry.text);
  const searchable = `${title} ${description} ${keywords} ${text}`;

  if (!terms.every((term) => searchable.includes(term))) return -1;

  let score = 0;
  for (const term of terms) {
    if (title === term) score += 120;
    else if (title.startsWith(term)) score += 70;
    else if (title.includes(term)) score += 45;
    if (keywords.includes(term)) score += 24;
    if (description.includes(term)) score += 14;
    if (text.includes(term)) score += 4;
  }
  if (entry.kind === "tool") score += 2;
  return score;
}

export function SiteSearch() {
  const { locale } = useI18n();
  const copy = getShellMessages(locale).search;
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SiteSearchEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [activeIndex, setActiveIndex] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateConnectivity = () => {
      const nextOnline = navigator.onLine;
      setOnline(nextOnline);
      if (!nextOnline) {
        setOpen(false);
        setQuery("");
      }
    };

    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        if (!online) {
          announceBlockedOfflineNavigation();
          return;
        }
        if (open) {
          setOpen(false);
          setQuery("");
          window.setTimeout(() => triggerRef.current?.focus(), 0);
        } else {
          setOpen(true);
        }
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        setQuery("");
        window.setTimeout(() => triggerRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [online, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setStatus((current) => (current === "ready" ? current : "loading"));
    void loadSearchIndex()
      .then((payload) => {
        setEntries(payload.entries);
        setStatus("ready");
      })
      .catch(() => {
        indexPromise = null;
        setStatus("error");
      });
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, locale]);

  const localeEntries = useMemo(
    () => entries.filter((entry) => entry.locale === locale),
    [entries, locale]
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      const quickPaths = new Set([
        locale === "en" ? "/en/explore" : "/explore",
        locale === "en" ? "/en/labs/tools" : "/labs/tools",
        locale === "en" ? "/en/tracker" : "/tracker",
        locale === "en" ? "/en/resume" : "/resume",
        locale === "en" ? "/en/now" : "/now"
      ]);
      return localeEntries.filter((entry) => quickPaths.has(entry.href));
    }

    return localeEntries
      .map((entry) => ({ entry, score: rankEntry(entry, query) }))
      .filter((item) => item.score >= 0)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
      .slice(0, 10)
      .map((item) => item.entry);
  }, [locale, localeEntries, query]);

  useEffect(() => {
    if (!open || !results.length) return;
    activeOptionRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, results]);

  const liveStatus = status === "loading"
    ? copy.loading
    : status === "error"
      ? copy.error
      : status === "ready" && results.length
        ? copy.resultCount
            .replace("{count}", String(results.length))
            .replace("{title}", results[activeIndex]?.title ?? results[0].title)
        : status === "ready"
          ? copy.empty
          : "";

  const close = (restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const choose = (entry: SiteSearchEntry) => {
    close(false);
    router.push(entry.href);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href]'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const kindLabel = (kind: SiteSearchEntry["kind"]) => copy.kinds[kind];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.open}
        aria-describedby={!online ? "site-search-offline-hint" : undefined}
        aria-keyshortcuts="Control+K Meta+K"
        disabled={!online}
        title={!online ? copy.offline : undefined}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-edge px-2.5 py-1.5 font-medium text-secondary transition-colors hover:border-edge-strong hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5" />
          <path d="m12.5 12.5 4 4" strokeLinecap="round" />
        </svg>
        <span className="hidden lg:inline">{copy.label}</span>
        <kbd className="hidden rounded border border-edge bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted xl:inline">
          {copy.shortcut}
        </kbd>
      </button>
      {!online ? <span id="site-search-offline-hint" className="sr-only">{copy.offline}</span> : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-3 pt-[8vh] backdrop-blur-sm sm:px-6 sm:pt-[12vh]"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-search-title"
            aria-describedby="site-search-description"
            onKeyDown={trapFocus}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-edge-strong bg-base shadow-2xl shadow-black/40"
          >
            <div className="border-b border-edge p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="site-search-title" className="font-semibold text-primary">
                    {copy.title}
                  </h2>
                  <p id="site-search-description" className="mt-1 text-xs leading-5 text-muted">
                    {copy.description}
                  </p>
                </div>
                <button type="button" onClick={() => close()} className="link-muted text-xs font-semibold">
                  {copy.close}
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-edge bg-surface/70 px-3">
                <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="8.5" cy="8.5" r="5" />
                  <path d="m12.5 12.5 4 4" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value.slice(0, 120))}
                  onKeyDown={onInputKeyDown}
                  placeholder={copy.placeholder}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded="true"
                  aria-autocomplete="list"
                  aria-controls="site-search-results"
                  aria-activedescendant={results[activeIndex] ? `site-search-result-${activeIndex}` : undefined}
                  className="min-w-0 flex-1 bg-transparent py-3 text-base text-primary outline-none placeholder:text-muted"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} className="link-muted text-xs font-semibold">
                    {copy.clear}
                  </button>
                ) : null}
              </div>
            </div>

            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {liveStatus}
            </p>
            <div className="max-h-[58vh] overflow-y-auto p-3 sm:p-4" aria-busy={status === "loading"}>
              {status === "loading" ? <p className="p-4 text-sm text-muted">{copy.loading}</p> : null}
              {status === "error" ? (
                <div className="p-4 text-sm text-secondary">
                  <p>{copy.error}</p>
                  <button
                    type="button"
                    className="link-accent mt-3 font-semibold"
                    onClick={() => {
                      setStatus("loading");
                      void loadSearchIndex()
                        .then((payload) => {
                          setEntries(payload.entries);
                          setStatus("ready");
                        })
                        .catch(() => {
                          indexPromise = null;
                          setStatus("error");
                        });
                    }}
                  >
                    {copy.retry}
                  </button>
                </div>
              ) : null}
              {status === "ready" ? (
                <>
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {query.trim() ? copy.results : copy.quickLinks}
                  </p>
                  {results.length ? (
                    <ul id="site-search-results" role="listbox" className="space-y-1">
                      {results.map((entry, index) => (
                        <li key={entry.id} role="none">
                          <button
                            ref={index === activeIndex ? activeOptionRef : undefined}
                            id={`site-search-result-${index}`}
                            type="button"
                            role="option"
                            aria-selected={index === activeIndex}
                            onMouseEnter={() => setActiveIndex(index)}
                            onFocus={() => setActiveIndex(index)}
                            onClick={() => choose(entry)}
                            className={`block w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                              index === activeIndex
                                ? "border-accent/50 bg-surface text-primary"
                                : "border-transparent text-secondary hover:bg-surface/70 hover:text-primary"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-semibold">{entry.title}</span>
                              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                                {kindLabel(entry.kind)}
                              </span>
                            </span>
                            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">
                              {entry.description}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-sm text-muted">{copy.empty}</p>
                  )}
                </>
              ) : null}
            </div>
            <p className="border-t border-edge px-5 py-3 text-xs text-muted">{copy.keyboardHint}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
