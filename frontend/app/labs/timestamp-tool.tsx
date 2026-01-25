"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../lib/i18n";

type TimestampUnit = "seconds" | "milliseconds";

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
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
  currentTimeLabel: string;
  empty: string;
};

const copyMap: Record<Locale, Copy> = {
  zh: {
    eyebrow: "实验室工具",
    title: "时间戳转换工具",
    description: "支持时间与时间戳互转，秒级/毫秒级自由切换。",
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
    currentTimeLabel: "本地时间",
    empty: "—"
  },
  en: {
    eyebrow: "Labs Tool",
    title: "Timestamp Converter",
    description: "Convert between time and timestamps with seconds/milliseconds precision.",
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
    currentTimeLabel: "Local time",
    empty: "—"
  }
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

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

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setDateInput(toInputValue(current));

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

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

  return (
    <section className="rounded-2xl border border-edge bg-surface/70 p-5 sm:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{copy.eyebrow}</p>
        <h2 className="text-xl font-semibold text-primary">{copy.title}</h2>
        <p className="text-sm text-muted">{copy.description}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-edge bg-base/40 p-4">
          <p className="text-sm font-semibold text-primary">{copy.timeToTimestamp}</p>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            {copy.timeInputLabel}
          </label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            className="mt-2 w-full rounded-lg border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>{copy.secondsLabel}</span>
              <span className="font-mono text-primary">
                {timestampFromDate.seconds ?? copy.empty}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>{copy.millisecondsLabel}</span>
              <span className="font-mono text-primary">
                {timestampFromDate.milliseconds ?? copy.empty}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-base/40 p-4">
          <p className="text-sm font-semibold text-primary">{copy.timestampToTime}</p>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            {copy.timestampInputLabel}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              value={timestampInput}
              onChange={(event) => setTimestampInput(event.target.value)}
              className="w-full rounded-lg border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="1700000000"
            />
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
              {copy.unitLabel}
              <select
                value={timestampUnit}
                onChange={(event) => setTimestampUnit(event.target.value as TimestampUnit)}
                className="rounded-lg border border-edge bg-base/60 px-3 py-2 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="seconds">{copy.secondsUnit}</option>
                <option value="milliseconds">{copy.millisecondsUnit}</option>
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>{copy.resultLabel}</span>
              <span className="font-mono text-primary">
                {timestampResult ? formatDateTime(timestampResult) : copy.empty}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>{copy.currentTimeLabel}</span>
              <span className="font-mono text-primary">
                {timestampResult ? timestampResult.toLocaleString() : copy.empty}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-edge bg-base/40 p-4">
        <p className="text-sm font-semibold text-primary">{copy.currentTitle}</p>
        <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-3">
          <div className="flex items-center justify-between gap-3">
            <span>{copy.secondsLabel}</span>
            <span className="font-mono text-primary">
              {currentSeconds ?? copy.empty}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{copy.millisecondsLabel}</span>
            <span className="font-mono text-primary">
              {currentMilliseconds ?? copy.empty}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span>{copy.currentTimeLabel}</span>
            <span className="font-mono text-primary">
              {now ? formatDateTime(now) : copy.empty}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
