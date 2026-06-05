"use client";

import { useEffect, useState, type ReactNode } from "react";

export function MDXCodeBlock({
  code,
  language,
  children
}: {
  code: string;
  language?: string;
  // Highlighted code nodes (from rehype-highlight) used for display. The raw
  // `code` string is still used for the copy button. Falls back to plain code.
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [isZh, setIsZh] = useState(false);

  useEffect(() => {
    const lang = document.documentElement.lang || "";
    setIsZh(lang.toLowerCase().startsWith("zh"));
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const copyLabel = copied ? (isZh ? "已复制" : "Copied") : isZh ? "复制" : "Copy";
  const languageLabel = language || "text";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-edge bg-base/60">
      <div className="flex items-center justify-between border-b border-edge/70 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-muted">{languageLabel}</span>
        <button
          type="button"
          onClick={onCopy}
          className="cursor-pointer rounded-md border border-edge px-2 py-1 text-xs font-semibold text-secondary transition-colors hover:bg-primary hover-text-base"
        >
          {copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-primary">
        {children ?? <code>{code}</code>}
      </pre>
    </div>
  );
}
