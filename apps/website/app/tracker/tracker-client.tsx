"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale, Messages } from "../../lib/i18n";
import { getLocalePath } from "../../lib/locale-routing";
import {
  TRACKER_MAX_HABITS,
  TRACKER_MAX_IMPORT_BYTES,
  TRACKER_MAX_NAME_LENGTH,
  TRACKER_STORAGE_KEY,
  createEmptyTrackerState,
  createHabit,
  getCurrentStreak,
  getRecentDateKeys,
  getSevenDayCount,
  isValidHabitName,
  normalizeHabitName,
  parseTrackerState,
  removeHabit,
  serializeTrackerState,
  toLocalDateKey,
  toggleHabitForDate,
  type TrackerState
} from "../../lib/tracker-local";
import {
  EYEBROW_ACCENT,
  TEXT_SM_MUTED,
  TEXT_XS_MUTED,
  TITLE_2XL,
  TITLE_LG,
  TITLE_XL
} from "../../lib/typography";

type TrackerContent = {
  privacy: { label: string; title: string; description: string; backup: string };
  add: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    button: string;
    limit: string;
  };
  summary: {
    title: string;
    today: string;
    sevenDays: string;
    activeStreak: string;
    todayHelper: string;
    sevenDaysHelper: string;
    streakHelper: string;
  };
  habits: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    checked: string;
    unchecked: string;
    checkIn: string;
    undo: string;
    delete: string;
    confirmDelete: string;
    streak: string;
    days: string;
    sevenDayTotal: string;
    doneOn: string;
    notDoneOn: string;
    beforeCreation: string;
  };
  data: {
    title: string;
    description: string;
    export: string;
    import: string;
    importConfirm: string;
    importHint: string;
    reset: string;
    resetConfirm: string;
  };
  status: {
    added: string;
    duplicate: string;
    invalidName: string;
    habitLimit: string;
    checked: string;
    unchecked: string;
    deleted: string;
    exported: string;
    imported: string;
    reset: string;
    invalidFile: string;
    fileTooLarge: string;
    storageReadError: string;
    storageWriteError: string;
    synced: string;
  };
  loading: string;
};

const trackerContent: Record<Locale, TrackerContent> = {
  zh: {
    privacy: {
      label: "本地优先 · 无需登录",
      title: "你的习惯数据只留在这台设备",
      description: "打卡记录以明文保存在当前浏览器的 localStorage 中；Tracker 本身不会主动上传记录。",
      backup: "同源脚本、浏览器扩展或可访问本机的人可能读取；清理数据或换设备前请导出并妥善保管 JSON 备份。"
    },
    add: {
      title: "添加习惯",
      description: "给习惯起一个清晰、可执行的名字，然后每天回来完成一次打卡。",
      label: "习惯名称",
      placeholder: "例如：阅读 20 分钟",
      button: "添加习惯",
      limit: `最多 ${TRACKER_MAX_HABITS} 个习惯，每个名称不超过 ${TRACKER_MAX_NAME_LENGTH} 个字符。`
    },
    summary: {
      title: "最近进度",
      today: "今日完成",
      sevenDays: "近 7 天完成率",
      activeStreak: "最长当前连续",
      todayHelper: "按习惯计算",
      sevenDaysHelper: "仅统计习惯创建后的日期",
      streakHelper: "今天或昨天仍连续的记录"
    },
    habits: {
      title: "我的习惯",
      description: "可打卡或撤销今天的记录；下方方格展示最近 7 天。",
      emptyTitle: "还没有习惯",
      emptyDescription: "从一个足够小、今天就能完成的目标开始。",
      checked: "今天已完成",
      unchecked: "今天未完成",
      checkIn: "完成今日打卡",
      undo: "撤销今日打卡",
      delete: "删除习惯",
      confirmDelete: "确定删除“{name}”及其全部打卡记录吗？此操作无法撤销。",
      streak: "当前连续",
      days: "天",
      sevenDayTotal: "近 7 天",
      doneOn: "已完成",
      notDoneOn: "未完成",
      beforeCreation: "尚未创建"
    },
    data: {
      title: "备份与迁移",
      description: "导出的 v1 JSON 可在另一台设备或浏览器中导入。导入会替换当前全部数据。",
      export: "导出 JSON",
      import: "导入 JSON",
      importConfirm: "导入会用 {incoming} 个习惯替换当前 {current} 个习惯及全部记录。建议先导出备份，确定继续吗？",
      importHint: "仅接受本站导出的 v1 JSON，最大 512 KB。",
      reset: "重置全部数据",
      resetConfirm: "确定删除这台浏览器中的全部习惯和打卡记录吗？此操作无法撤销。"
    },
    status: {
      added: "习惯已添加并保存在本机。",
      duplicate: "已经存在同名习惯。",
      invalidName: "请输入有效的习惯名称。",
      habitLimit: `最多只能创建 ${TRACKER_MAX_HABITS} 个习惯。`,
      checked: "今日打卡已保存。",
      unchecked: "已撤销今日打卡。",
      deleted: "习惯及其记录已删除。",
      exported: "备份文件已导出。",
      imported: "备份已导入，并替换当前数据。",
      reset: "本地 Tracker 数据已重置。",
      invalidFile: "文件不是有效的 Tracker v1 备份，未修改当前数据。",
      fileTooLarge: "文件超过 512 KB，未进行导入。",
      storageReadError: "本地数据无法安全读取，原始内容未被覆盖。请导入备份或重置后继续。",
      storageWriteError: "浏览器拒绝保存数据，请检查隐私模式或存储空间。",
      synced: "已同步此网站在另一个标签页中的更改。"
    },
    loading: "正在读取本地记录…"
  },
  en: {
    privacy: {
      label: "Local-first · No account",
      title: "Your habit data stays on this device",
      description: "Check-ins are stored as plain text in this browser's localStorage. Tracker itself does not upload them.",
      backup: "Same-origin scripts, browser extensions, or someone with device access may read them. Export and protect the plain-text JSON before clearing data or changing devices."
    },
    add: {
      title: "Add a habit",
      description: "Give it a clear, actionable name, then return once a day to check in.",
      label: "Habit name",
      placeholder: "For example: Read for 20 minutes",
      button: "Add habit",
      limit: `Up to ${TRACKER_MAX_HABITS} habits and ${TRACKER_MAX_NAME_LENGTH} characters per name.`
    },
    summary: {
      title: "Recent progress",
      today: "Done today",
      sevenDays: "7-day completion",
      activeStreak: "Best active streak",
      todayHelper: "Counted by habit",
      sevenDaysHelper: "Only dates after each habit was created",
      streakHelper: "A run still active today or yesterday"
    },
    habits: {
      title: "My habits",
      description: "Check in or undo today. The row of squares shows the latest seven days.",
      emptyTitle: "No habits yet",
      emptyDescription: "Start with one small goal you can finish today.",
      checked: "Completed today",
      unchecked: "Not completed today",
      checkIn: "Complete today's check-in",
      undo: "Undo today's check-in",
      delete: "Delete habit",
      confirmDelete: "Delete “{name}” and all of its check-ins? This cannot be undone.",
      streak: "Active streak",
      days: "days",
      sevenDayTotal: "Last 7 days",
      doneOn: "completed",
      notDoneOn: "not completed",
      beforeCreation: "not created yet"
    },
    data: {
      title: "Backup and migration",
      description: "Import the exported v1 JSON in another browser or device. Importing replaces all current data.",
      export: "Export JSON",
      import: "Import JSON",
      importConfirm: "Importing replaces the current {current} habits and all check-ins with {incoming} habits. Export a backup first if needed. Continue?",
      importHint: "Only Tracker v1 JSON is accepted, up to 512 KB.",
      reset: "Reset all data",
      resetConfirm: "Delete every habit and check-in stored in this browser? This cannot be undone."
    },
    status: {
      added: "Habit added and saved on this device.",
      duplicate: "A habit with that name already exists.",
      invalidName: "Enter a valid habit name.",
      habitLimit: `You can create up to ${TRACKER_MAX_HABITS} habits.`,
      checked: "Today's check-in was saved.",
      unchecked: "Today's check-in was undone.",
      deleted: "The habit and its records were deleted.",
      exported: "Backup file exported.",
      imported: "Backup imported and current data replaced.",
      reset: "Local Tracker data reset.",
      invalidFile: "This is not a valid Tracker v1 backup. Current data was not changed.",
      fileTooLarge: "The file is larger than 512 KB and was not imported.",
      storageReadError: "Local data could not be read safely and was not overwritten. Import a backup or reset before continuing.",
      storageWriteError: "The browser refused to save. Check private browsing settings or available storage.",
      synced: "Changes from another tab on this site were synced."
    },
    loading: "Reading local records…"
  }
};

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-edge bg-surface/70 p-5 sm:p-6">
      <h2 className={TITLE_LG}>{title}</h2>
      {description ? <p className={`mt-2 ${TEXT_SM_MUTED}`}>{description}</p> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function makeHabitId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `habit_${crypto.randomUUID()}`;
  }
  return `habit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

type TrackerClientProps = {
  locale: Locale;
  copy: Messages["pages"]["tracker"];
  common: Messages["pages"]["common"];
};

export function TrackerClient({ locale, copy, common }: TrackerClientProps) {
  const content = trackerContent[locale];
  const inputId = useId();
  const [tracker, setTracker] = useState<TrackerState>(() => createEmptyTrackerState());
  const [habitName, setHabitName] = useState("");
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    const refreshToday = () => setTodayKey(toLocalDateKey());
    refreshToday();

    try {
      const parsed = parseTrackerState(window.localStorage.getItem(TRACKER_STORAGE_KEY));
      if (parsed.ok) {
        setTracker(parsed.state);
        setCanPersist(true);
      } else {
        setNeedsRecovery(true);
        setStatus({ tone: "error", text: content.status.storageReadError });
      }
    } catch {
      setNeedsRecovery(true);
      setStatus({ tone: "error", text: content.status.storageReadError });
    } finally {
      setIsHydrated(true);
    }

    const interval = window.setInterval(refreshToday, 60_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshToday();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [content.status.storageReadError]);

  useEffect(() => {
    if (!isHydrated || !canPersist) return;
    try {
      window.localStorage.setItem(TRACKER_STORAGE_KEY, serializeTrackerState(tracker));
    } catch {
      setStatus({ tone: "error", text: content.status.storageWriteError });
    }
  }, [canPersist, content.status.storageWriteError, isHydrated, tracker]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TRACKER_STORAGE_KEY) return;
      const parsed = parseTrackerState(event.newValue);
      if (!parsed.ok) {
        setCanPersist(false);
        setNeedsRecovery(true);
        setStatus({ tone: "error", text: content.status.storageReadError });
        return;
      }
      setTracker(parsed.state);
      setCanPersist(true);
      setNeedsRecovery(false);
      setStatus({ tone: "info", text: content.status.synced });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [content.status.storageReadError, content.status.synced]);

  const recentDates = useMemo(() => (todayKey ? getRecentDateKeys(todayKey) : []), [todayKey]);
  const summary = useMemo(() => {
    if (!todayKey) return { todayDone: 0, possible: 0, completed: 0, bestStreak: 0 };
    let possible = 0;
    let completed = 0;
    let bestStreak = 0;
    let todayDone = 0;
    for (const habit of tracker.habits) {
      if (habit.completedDates.includes(todayKey)) todayDone += 1;
      completed += getSevenDayCount(habit.completedDates, todayKey);
      possible += recentDates.filter((dateKey) => dateKey >= habit.createdOn).length;
      bestStreak = Math.max(bestStreak, getCurrentStreak(habit.completedDates, todayKey));
    }
    return { todayDone, possible, completed, bestStreak };
  }, [recentDates, todayKey, tracker.habits]);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", weekday: "short" }),
    [locale]
  );
  const formatDate = (dateKey: string) => dateFormatter.format(new Date(`${dateKey}T12:00:00`));

  const addHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPersist) {
      setStatus({ tone: "error", text: content.status.storageReadError });
      return;
    }
    if (!todayKey || !isValidHabitName(habitName)) {
      setStatus({ tone: "error", text: content.status.invalidName });
      return;
    }
    if (tracker.habits.length >= TRACKER_MAX_HABITS) {
      setStatus({ tone: "error", text: content.status.habitLimit });
      return;
    }
    const normalized = normalizeHabitName(habitName);
    if (tracker.habits.some((habit) => habit.name.toLowerCase() === normalized.toLowerCase())) {
      setStatus({ tone: "error", text: content.status.duplicate });
      return;
    }
    const habit = createHabit(normalized, todayKey, makeHabitId());
    if (!habit) {
      setStatus({ tone: "error", text: content.status.invalidName });
      return;
    }
    setTracker((current) => ({ ...current, habits: [...current.habits, habit] }));
    setHabitName("");
    setStatus({ tone: "success", text: content.status.added });
  };

  const toggleToday = (habitId: string, wasCompleted: boolean) => {
    if (!canPersist) {
      setStatus({ tone: "error", text: content.status.storageReadError });
      return;
    }
    if (!todayKey) return;
    setTracker((current) => toggleHabitForDate(current, habitId, todayKey));
    setStatus({ tone: "success", text: wasCompleted ? content.status.unchecked : content.status.checked });
  };

  const deleteHabit = (habitId: string, name: string) => {
    if (!canPersist) {
      setStatus({ tone: "error", text: content.status.storageReadError });
      return;
    }
    if (!window.confirm(content.habits.confirmDelete.replace("{name}", name))) return;
    setTracker((current) => removeHabit(current, habitId));
    setStatus({ tone: "success", text: content.status.deleted });
  };

  const exportData = () => {
    if (!canPersist) {
      setStatus({ tone: "error", text: content.status.storageReadError });
      return;
    }
    if (!todayKey) return;
    const blob = new Blob([serializeTrackerState(tracker)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `meaningful-ink-tracker-${todayKey}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus({ tone: "success", text: content.status.exported });
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > TRACKER_MAX_IMPORT_BYTES) {
      setStatus({ tone: "error", text: content.status.fileTooLarge });
      return;
    }
    try {
      const parsed = parseTrackerState(await file.text());
      if (!parsed.ok) {
        setStatus({ tone: "error", text: parsed.reason === "too_large" ? content.status.fileTooLarge : content.status.invalidFile });
        return;
      }
      const confirmation = content.data.importConfirm
        .replace("{incoming}", String(parsed.state.habits.length))
        .replace("{current}", String(tracker.habits.length));
      if (!window.confirm(confirmation)) return;
      setCanPersist(true);
      setNeedsRecovery(false);
      setTracker(parsed.state);
      setStatus({ tone: "success", text: content.status.imported });
    } catch {
      setStatus({ tone: "error", text: content.status.invalidFile });
    }
  };

  const resetData = () => {
    if (!window.confirm(content.data.resetConfirm)) return;
    setCanPersist(true);
    setNeedsRecovery(false);
    setTracker(createEmptyTrackerState());
    setStatus({ tone: "success", text: content.status.reset });
  };

  const completionRate = summary.possible > 0 ? Math.round((summary.completed / summary.possible) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 sm:px-6 md:space-y-12 md:py-16" aria-busy={!isHydrated}>
      <header className="space-y-3">
        <p className={TEXT_SM_MUTED}>{copy.eyebrow}</p>
        <h1 className={TITLE_2XL}>{copy.title}</h1>
        <p className={TEXT_SM_MUTED}>{copy.description}</p>
        <div className="max-w-3xl rounded-xl border border-accent/35 bg-accent/10 px-4 py-3">
          <p className={EYEBROW_ACCENT}>{content.privacy.label}</p>
          <p className="mt-2 font-semibold text-primary">{content.privacy.title}</p>
          <p className={`mt-1 ${TEXT_SM_MUTED}`}>{content.privacy.description}</p>
          <p className={`mt-1 ${TEXT_XS_MUTED}`}>{content.privacy.backup}</p>
        </div>
      </header>

      <div className="min-h-6" aria-live="polite" aria-atomic="true">
        {!isHydrated ? <p className={TEXT_SM_MUTED}>{content.loading}</p> : null}
        {status ? (
          <p className={status.tone === "error" ? "text-sm font-semibold text-accent-strong" : status.tone === "success" ? "text-sm font-semibold text-accent-secondary" : TEXT_SM_MUTED}>
            {status.text}
          </p>
        ) : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title={content.add.title} description={content.add.description}>
          <form className="space-y-3" onSubmit={addHabit}>
            <label htmlFor={inputId} className="block text-sm font-semibold text-primary">{content.add.label}</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id={inputId}
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
                maxLength={TRACKER_MAX_NAME_LENGTH}
                autoComplete="off"
                placeholder={content.add.placeholder}
                disabled={!isHydrated || !canPersist || tracker.habits.length >= TRACKER_MAX_HABITS}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-edge bg-base px-4 py-2 text-base text-primary outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 motion-reduce:transition-none"
              />
              <button
                type="submit"
                disabled={!isHydrated || !canPersist || tracker.habits.length >= TRACKER_MAX_HABITS}
                className="min-h-11 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
              >
                {content.add.button}
              </button>
            </div>
            <p className={TEXT_XS_MUTED}>{content.add.limit}</p>
          </form>
        </Card>

        <Card title={content.summary.title}>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-edge bg-base/50 p-4">
              <dt className={TEXT_XS_MUTED}>{content.summary.today}</dt>
              <dd className={`mt-2 ${TITLE_XL}`}>{summary.todayDone} / {tracker.habits.length}</dd>
              <p className={`mt-1 ${TEXT_XS_MUTED}`}>{content.summary.todayHelper}</p>
            </div>
            <div className="rounded-xl border border-edge bg-base/50 p-4">
              <dt className={TEXT_XS_MUTED}>{content.summary.sevenDays}</dt>
              <dd className={`mt-2 ${TITLE_XL}`}>{completionRate}%</dd>
              <p className={`mt-1 ${TEXT_XS_MUTED}`}>{content.summary.sevenDaysHelper}</p>
            </div>
            <div className="rounded-xl border border-edge bg-base/50 p-4">
              <dt className={TEXT_XS_MUTED}>{content.summary.activeStreak}</dt>
              <dd className={`mt-2 ${TITLE_XL}`}>{summary.bestStreak} {content.habits.days}</dd>
              <p className={`mt-1 ${TEXT_XS_MUTED}`}>{content.summary.streakHelper}</p>
            </div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="tracker-habits-title">
        <div className="mb-5">
          <h2 id="tracker-habits-title" className={TITLE_XL}>{content.habits.title}</h2>
          <p className={`mt-2 ${TEXT_SM_MUTED}`}>{content.habits.description}</p>
        </div>

        {isHydrated && tracker.habits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-edge bg-surface/40 px-5 py-10 text-center">
            <p className="font-semibold text-primary">{content.habits.emptyTitle}</p>
            <p className={`mt-2 ${TEXT_SM_MUTED}`}>{content.habits.emptyDescription}</p>
          </div>
        ) : null}

        <ul className="grid gap-4 lg:grid-cols-2">
          {todayKey ? tracker.habits.map((habit) => {
            const completedToday = habit.completedDates.includes(todayKey);
            const streak = getCurrentStreak(habit.completedDates, todayKey);
            const eligibleDates = recentDates.filter((dateKey) => dateKey >= habit.createdOn);
            const sevenDayCount = getSevenDayCount(habit.completedDates, todayKey);
            return (
              <li key={habit.id} className="rounded-2xl border border-edge bg-surface/70 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={TITLE_LG}>{habit.name}</h3>
                    <p className={`mt-1 ${completedToday ? "text-sm font-semibold text-accent-secondary" : TEXT_SM_MUTED}`}>
                      {completedToday ? content.habits.checked : content.habits.unchecked}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteHabit(habit.id, habit.name)}
                    disabled={!canPersist}
                    className="min-h-11 rounded-lg px-3 py-2 text-xs font-semibold text-accent-strong transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                    aria-label={`${content.habits.delete}: ${habit.name}`}
                  >
                    {content.habits.delete}
                  </button>
                </div>

                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <dt className={TEXT_XS_MUTED}>{content.habits.streak}</dt>
                    <dd className="mt-1 font-semibold text-primary">{streak} {content.habits.days}</dd>
                  </div>
                  <div>
                    <dt className={TEXT_XS_MUTED}>{content.habits.sevenDayTotal}</dt>
                    <dd className="mt-1 font-semibold text-primary">{sevenDayCount} / {eligibleDates.length}</dd>
                  </div>
                </dl>

                <div className="mt-5 grid grid-cols-7 gap-1.5" aria-label={content.habits.sevenDayTotal}>
                  {recentDates.map((dateKey) => {
                    const isBeforeCreation = dateKey < habit.createdOn;
                    const isDone = habit.completedDates.includes(dateKey);
                    const stateLabel = isBeforeCreation ? content.habits.beforeCreation : isDone ? content.habits.doneOn : content.habits.notDoneOn;
                    return (
                      <div key={dateKey} className="text-center">
                        <span
                          className={`block h-8 rounded-md border ${isBeforeCreation ? "border-edge/40 bg-edge/20" : isDone ? "border-emerald-500/60 bg-emerald-500/30" : "border-edge bg-base/60"}`}
                          title={`${formatDate(dateKey)} · ${stateLabel}`}
                        >
                          <span className="sr-only">{formatDate(dateKey)}: {stateLabel}</span>
                        </span>
                        <span className="mt-1 block text-[0.65rem] text-muted" aria-hidden="true">{dateKey.slice(8)}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  aria-pressed={completedToday}
                  onClick={() => toggleToday(habit.id, completedToday)}
                  disabled={!canPersist}
                  className={`mt-5 min-h-11 w-full rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${completedToday ? "border border-edge bg-base text-primary hover:border-edge-strong" : "bg-accent text-white hover:bg-accent-strong"}`}
                >
                  {completedToday ? content.habits.undo : content.habits.checkIn}
                </button>
              </li>
            );
          }) : null}
        </ul>
      </section>

      <Card title={content.data.title} description={content.data.description}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportData}
            disabled={!isHydrated || !canPersist}
            className="min-h-11 rounded-xl border border-edge bg-base px-4 py-2 text-sm font-semibold text-primary transition hover:border-edge-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 motion-reduce:transition-none"
          >
            {content.data.export}
          </button>
          <label className="relative min-h-11 cursor-pointer rounded-xl border border-edge bg-base px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-edge-strong focus-within:ring-2 focus-within:ring-accent motion-reduce:transition-none">
            {content.data.import}
            <input
              type="file"
              accept="application/json,.json"
              onChange={importData}
              disabled={!isHydrated}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-describedby={`${inputId}-import-hint`}
            />
          </label>
          <button
            type="button"
            onClick={resetData}
            disabled={!isHydrated || (!needsRecovery && tracker.habits.length === 0)}
            className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-accent-strong transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          >
            {content.data.reset}
          </button>
        </div>
        <p id={`${inputId}-import-hint`} className={`mt-3 ${TEXT_XS_MUTED}`}>{content.data.importHint}</p>
      </Card>

      <footer className={`flex flex-wrap gap-4 ${TEXT_SM_MUTED}`}>
        <Link href={getLocalePath("/enter", locale)} prefetch={false} className="text-accent hover:text-accent-strong">{common.backToEnter}</Link>
        <Link href={getLocalePath("/", locale)} prefetch={false} className="text-muted hover:text-primary">{common.backToHome}</Link>
      </footer>
    </main>
  );
}
