"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../../lib/i18n";
import {
  EYEBROW_ACCENT,
  EYEBROW_SECONDARY,
  TEXT_SM_MUTED,
  TEXT_SM_SEMIBOLD_PRIMARY,
  TEXT_XS_SEMIBOLD_MUTED,
  TITLE_XL
} from "../../lib/typography";

type TimestampUnit = "seconds" | "milliseconds";

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  timeLabel: string;
  timezoneLabel: string;
  localLabel: string;
  utcLabel: string;
  showUtcLabel: string;
  hideUtcLabel: string;
  showLocalLabel: string;
  hideLocalLabel: string;
  copyLabel: string;
  copiedLabel: string;
  timeToTimestamp: string;
  timeInputLabel: string;
  secondsLabel: string;
  millisecondsLabel: string;
  secondsUnit: string;
  millisecondsUnit: string;
  timestampToTime: string;
  timestampInputLabel: string;
  unitLabel: string;
  resultLabel: string;
  currentTitle: string;
  empty: string;
};

const copyMap: Record<Locale, Copy> = {
  zh: {
    eyebrow: "实验室工具",
    title: "时间戳转换工具",
    description: "支持时间与时间戳互转，秒级/毫秒级自由切换。",
    timeLabel: "时间",
    timezoneLabel: "时区切换",
    localLabel: "本地",
    utcLabel: "UTC",
    showUtcLabel: "UTC 显示",
    hideUtcLabel: "隐藏 UTC",
    showLocalLabel: "本地显示",
    hideLocalLabel: "隐藏本地",
    copyLabel: "复制",
    copiedLabel: "已复制",
    timeToTimestamp: "时间 → 时间戳",
    timeInputLabel: "输入时间",
    secondsLabel: "秒级时间戳",
    millisecondsLabel: "毫秒级时间戳",
    secondsUnit: "秒",
    millisecondsUnit: "毫秒",
    timestampToTime: "时间戳 → 时间",
    timestampInputLabel: "输入时间戳",
    unitLabel: "单位",
    resultLabel: "转换结果",
    currentTitle: "当前时间戳",
    empty: "—"
  },
  en: {
    eyebrow: "Labs Tool",
    title: "Timestamp Converter",
    description: "Convert between time and timestamps with seconds/milliseconds precision.",
    timeLabel: "Time",
    timezoneLabel: "Timezone",
    localLabel: "Local",
    utcLabel: "UTC",
    showUtcLabel: "Show UTC",
    hideUtcLabel: "Hide UTC",
    showLocalLabel: "Show local",
    hideLocalLabel: "Hide local",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    timeToTimestamp: "Time → Timestamp",
    timeInputLabel: "Input time",
    secondsLabel: "Seconds timestamp",
    millisecondsLabel: "Milliseconds timestamp",
    secondsUnit: "Seconds",
    millisecondsUnit: "Milliseconds",
    timestampToTime: "Timestamp → Time",
    timestampInputLabel: "Input timestamp",
    unitLabel: "Unit",
    resultLabel: "Result",
    currentTitle: "Current timestamp",
    empty: "—"
  }
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateTime = (date: Date, useUtc: boolean) => {
  const year = useUtc ? date.getUTCFullYear() : date.getFullYear();
  const month = pad((useUtc ? date.getUTCMonth() : date.getMonth()) + 1);
  const day = pad(useUtc ? date.getUTCDate() : date.getDate());
  const hour = pad(useUtc ? date.getUTCHours() : date.getHours());
  const minute = pad(useUtc ? date.getUTCMinutes() : date.getMinutes());
  const second = pad(useUtc ? date.getUTCSeconds() : date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const toInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

export function TimestampTool({ locale }: { locale: Locale }) {
  const copy = copyMap[locale];
  const [dateInput, setDateInput] = useState("");
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>("milliseconds");
  const [now, setNow] = useState<Date | null>(null);
  const [timeZoneMode, setTimeZoneMode] = useState<"local" | "utc">("local");
  const [showUtc, setShowUtc] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setDateInput(toInputValue(current));

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (value: string | number | null, key: string) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    const text = String(value);
    const setCopied = () => {
      setCopiedKey(key);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedKey(null);
      }, 1500);
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied();
        return;
      }
    } catch {
      // Fallback below.
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied();
    } catch {
      // Ignore copy failures.
    }
  };

  const handleTimeZoneChange = (mode: "local" | "utc") => {
    setTimeZoneMode(mode);
  };

  const dateTimestamp = useMemo(() => {
    if (!dateInput) {
      return null;
    }

    const parsed = new Date(dateInput);
    return isValidDate(parsed) ? parsed : null;
  }, [dateInput]);

  const timestampFromDate = useMemo(() => {
    if (!dateTimestamp) {
      return { seconds: null as number | null, milliseconds: null as number | null };
    }

    const milliseconds = dateTimestamp.getTime();
    return {
      seconds: Math.floor(milliseconds / 1000),
      milliseconds
    };
  }, [dateTimestamp]);

  const timestampResult = useMemo(() => {
    const trimmed = timestampInput.trim();
    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      return null;
    }

    const milliseconds = timestampUnit === "seconds" ? numeric * 1000 : numeric;
    const parsed = new Date(milliseconds);

    return isValidDate(parsed) ? parsed : null;
  }, [timestampInput, timestampUnit]);

  const currentSeconds = now ? Math.floor(now.getTime() / 1000) : null;
  const currentMilliseconds = now ? now.getTime() : null;
  const isUtc = timeZoneMode === "utc";
  const primaryTimeLabel = isUtc ? copy.utcLabel : copy.localLabel;
  const secondaryTimeLabel = isUtc ? copy.localLabel : copy.utcLabel;
  const showSecondaryLine = showUtc;
  const primaryTimestampText = timestampResult ? formatDateTime(timestampResult, isUtc) : null;
  const secondaryTimestampText = timestampResult ? formatDateTime(timestampResult, !isUtc) : null;
  const currentTimeText = now ? formatDateTime(now, isUtc) : null;
  const currentSecondaryTimeText = now ? formatDateTime(now, !isUtc) : null;
  const copyLabelFor = (key: string) => (copiedKey === key ? copy.copiedLabel : copy.copyLabel);
  const toggleSecondaryLabel = isUtc
    ? showUtc
      ? copy.hideLocalLabel
      : copy.showLocalLabel
    : showUtc
      ? copy.hideUtcLabel
      : copy.showUtcLabel;

  return (
    <section className="rounded-2xl border border-edge bg-surface/70 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none sm:p-8">
      <div className="space-y-2">
        <p className={EYEBROW_ACCENT}>{copy.eyebrow}</p>
        <h2 className={TITLE_XL}>{copy.title}</h2>
        <p className={TEXT_SM_MUTED}>{copy.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className={`flex items-center gap-3 ${EYEBROW_SECONDARY}`}>
          <span>{copy.timezoneLabel}</span>
          <div className="flex rounded-full border border-edge bg-base/60 p-1">
            <button
              type="button"
              onClick={() => handleTimeZoneChange("local")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                !isUtc ? "bg-accent text-white" : "text-muted hover:text-primary"
              }`}
            >
              {copy.localLabel}
            </button>
            <button
              type="button"
              onClick={() => handleTimeZoneChange("utc")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                isUtc ? "bg-accent text-white" : "text-muted hover:text-primary"
              }`}
            >
              {copy.utcLabel}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowUtc((prev) => !prev)}
          className={`rounded-full border border-edge bg-base/60 px-3 py-1 text-xs font-semibold transition ${
            "text-muted hover:text-primary"
          }`}
        >
          {toggleSecondaryLabel}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-edge bg-base/40 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none">
          <p className={TEXT_SM_SEMIBOLD_PRIMARY}>{copy.timeToTimestamp}</p>
          <label className={`mt-4 block ${EYEBROW_SECONDARY}`}>
            {copy.timeInputLabel}
          </label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            className="mt-2 w-full rounded-lg border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-hidden transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>{copy.secondsLabel}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary">
                  {timestampFromDate.seconds ?? copy.empty}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(timestampFromDate.seconds, "time-seconds")}
                  className={`rounded-full border border-edge bg-base/60 px-2.5 py-1 ${TEXT_XS_SEMIBOLD_MUTED} transition hover:text-primary`}
                >
                  {copyLabelFor("time-seconds")}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>{copy.millisecondsLabel}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary">
                  {timestampFromDate.milliseconds ?? copy.empty}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(timestampFromDate.milliseconds, "time-milliseconds")}
                  className={`rounded-full border border-edge bg-base/60 px-2.5 py-1 ${TEXT_XS_SEMIBOLD_MUTED} transition hover:text-primary`}
                >
                  {copyLabelFor("time-milliseconds")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-base/40 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none">
          <p className={TEXT_SM_SEMIBOLD_PRIMARY}>{copy.timestampToTime}</p>
          <label className={`mt-4 block ${EYEBROW_SECONDARY}`}>
            {copy.timestampInputLabel}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              value={timestampInput}
              onChange={(event) => setTimestampInput(event.target.value)}
              className="w-full rounded-lg border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-hidden transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="1700000000"
            />
            <label className={`flex items-center gap-2 ${EYEBROW_SECONDARY}`}>
              {copy.unitLabel}
              <select
                value={timestampUnit}
                onChange={(event) => setTimestampUnit(event.target.value as TimestampUnit)}
                className="rounded-lg border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-hidden transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="seconds">{copy.secondsUnit}</option>
                <option value="milliseconds">{copy.millisecondsUnit}</option>
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>
                {copy.resultLabel} ({primaryTimeLabel})
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary">
                  {primaryTimestampText ?? copy.empty}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(primaryTimestampText, "timestamp-primary")}
                  className={`rounded-full border border-edge bg-base/60 px-2.5 py-1 ${TEXT_XS_SEMIBOLD_MUTED} transition hover:text-primary`}
                >
                  {copyLabelFor("timestamp-primary")}
                </button>
              </div>
            </div>
            {showSecondaryLine ? (
              <div className="flex items-center justify-between text-xs">
                <span>{secondaryTimeLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary">
                    {secondaryTimestampText ?? copy.empty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(secondaryTimestampText, "timestamp-secondary")}
                    className="rounded-full border border-edge bg-base/60 px-2 py-1 text-[11px] font-semibold text-muted transition hover:text-primary"
                  >
                    {copyLabelFor("timestamp-secondary")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-edge bg-base/40 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:bg-base/70 hover:shadow-lg hover:shadow-blue-500/10 motion-reduce:transform-none">
        <p className={TEXT_SM_SEMIBOLD_PRIMARY}>{copy.currentTitle}</p>
        <div className={`mt-3 grid gap-2 ${TEXT_SM_MUTED} sm:grid-cols-2 lg:grid-cols-3`}>
          <div className="flex items-center justify-between gap-3">
            <span>{copy.secondsLabel}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary">
                {currentSeconds ?? copy.empty}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentSeconds, "current-seconds")}
                className={`rounded-full border border-edge bg-base/60 px-2.5 py-1 ${TEXT_XS_SEMIBOLD_MUTED} transition hover:text-primary`}
              >
                {copyLabelFor("current-seconds")}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{copy.millisecondsLabel}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary">
                {currentMilliseconds ?? copy.empty}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentMilliseconds, "current-milliseconds")}
                className={`rounded-full border border-edge bg-base/60 px-2.5 py-1 ${TEXT_XS_SEMIBOLD_MUTED} transition hover:text-primary`}
              >
                {copyLabelFor("current-milliseconds")}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span>
              {copy.timeLabel} ({primaryTimeLabel})
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary">
                {currentTimeText ?? copy.empty}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentTimeText, "current-time-primary")}
                className="rounded-full border border-edge bg-base/60 px-2 py-1 text-[11px] font-semibold text-muted transition hover:text-primary"
              >
                {copyLabelFor("current-time-primary")}
              </button>
            </div>
          </div>
          {showSecondaryLine ? (
            <div className="flex items-center justify-between gap-3 text-xs">
              <span>
                {copy.timeLabel} ({secondaryTimeLabel})
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary">
                  {currentSecondaryTimeText ?? copy.empty}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentSecondaryTimeText, "current-time-secondary")}
                  className="rounded-full border border-edge bg-base/60 px-2 py-1 text-[11px] font-semibold text-muted transition hover:text-primary"
                >
                  {copyLabelFor("current-time-secondary")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
