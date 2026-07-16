export const TRACKER_STORAGE_KEY = "meaningful-ink:tracker:v1";
export const TRACKER_SCHEMA_VERSION = 1 as const;
export const TRACKER_MAX_HABITS = 20;
export const TRACKER_MAX_NAME_LENGTH = 48;
export const TRACKER_MAX_COMPLETIONS_PER_HABIT = 730;
export const TRACKER_MAX_IMPORT_BYTES = 512 * 1024;

export type TrackerHabit = {
  id: string;
  name: string;
  createdOn: string;
  completedDates: string[];
};

export type TrackerState = {
  version: typeof TRACKER_SCHEMA_VERSION;
  habits: TrackerHabit[];
};

export type TrackerParseResult =
  | { ok: true; state: TrackerState; empty: boolean }
  | { ok: false; reason: "too_large" | "invalid_json" | "invalid_schema" };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HABIT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/u;
const BIDI_CONTROL_CHARACTERS = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]) {
  const actualKeys = Object.keys(value);
  return actualKeys.length === keys.length && actualKeys.every((key) => keys.includes(key));
}

export function createEmptyTrackerState(): TrackerState {
  return { version: TRACKER_SCHEMA_VERSION, habits: [] };
}

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function shiftDateKey(dateKey: string, offset: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + offset);
  return toLocalDateKey(date);
}

export function getRecentDateKeys(todayKey: string, days = 7) {
  if (!isDateKey(todayKey) || !Number.isInteger(days) || days < 1 || days > 31) return [];
  return Array.from({ length: days }, (_, index) => shiftDateKey(todayKey, index - days + 1));
}

export function normalizeHabitName(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

export function isValidHabitName(value: string) {
  const normalized = normalizeHabitName(value);
  return (
    normalized.length > 0 &&
    Array.from(normalized).length <= TRACKER_MAX_NAME_LENGTH &&
    !CONTROL_CHARACTERS.test(normalized) &&
    !BIDI_CONTROL_CHARACTERS.test(normalized)
  );
}

export function createHabit(name: string, todayKey: string, id: string): TrackerHabit | null {
  const normalizedName = normalizeHabitName(name);
  if (!isValidHabitName(normalizedName) || !isDateKey(todayKey) || !HABIT_ID_PATTERN.test(id)) {
    return null;
  }

  return { id, name: normalizedName, createdOn: todayKey, completedDates: [] };
}

export function parseTrackerState(raw: string | null): TrackerParseResult {
  if (raw === null) return { ok: true, state: createEmptyTrackerState(), empty: true };
  if (raw.length === 0) return { ok: false, reason: "invalid_json" };
  if (new TextEncoder().encode(raw).byteLength > TRACKER_MAX_IMPORT_BYTES) {
    return { ok: false, reason: "too_large" };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["version", "habits"]) ||
    value.version !== TRACKER_SCHEMA_VERSION ||
    !Array.isArray(value.habits) ||
    value.habits.length > TRACKER_MAX_HABITS
  ) {
    return { ok: false, reason: "invalid_schema" };
  }

  const habits: TrackerHabit[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  const todayKey = toLocalDateKey();

  for (const candidate of value.habits) {
    if (
      !isRecord(candidate) ||
      !hasOnlyKeys(candidate, ["id", "name", "createdOn", "completedDates"]) ||
      typeof candidate.id !== "string" ||
      !HABIT_ID_PATTERN.test(candidate.id) ||
      typeof candidate.name !== "string" ||
      !isValidHabitName(candidate.name) ||
      !isDateKey(candidate.createdOn) ||
      candidate.createdOn > todayKey ||
      !Array.isArray(candidate.completedDates) ||
      candidate.completedDates.length > TRACKER_MAX_COMPLETIONS_PER_HABIT
    ) {
      return { ok: false, reason: "invalid_schema" };
    }

    const name = normalizeHabitName(candidate.name);
    const comparableName = name.toLowerCase();
    if (ids.has(candidate.id) || names.has(comparableName)) {
      return { ok: false, reason: "invalid_schema" };
    }

    const completedDates = new Set<string>();
    for (const date of candidate.completedDates) {
      if (!isDateKey(date) || date < candidate.createdOn || date > todayKey || completedDates.has(date)) {
        return { ok: false, reason: "invalid_schema" };
      }
      completedDates.add(date);
    }

    ids.add(candidate.id);
    names.add(comparableName);
    habits.push({
      id: candidate.id,
      name,
      createdOn: candidate.createdOn,
      completedDates: [...completedDates].sort()
    });
  }

  return { ok: true, state: { version: TRACKER_SCHEMA_VERSION, habits }, empty: false };
}

export function serializeTrackerState(state: TrackerState) {
  return JSON.stringify(state, null, 2);
}

export function toggleHabitForDate(state: TrackerState, habitId: string, dateKey: string): TrackerState {
  if (!isDateKey(dateKey)) return state;

  let changed = false;
  const habits = state.habits.map((habit) => {
    if (habit.id !== habitId || dateKey < habit.createdOn) return habit;
    changed = true;
    const completed = new Set(habit.completedDates);
    if (completed.has(dateKey)) completed.delete(dateKey);
    else completed.add(dateKey);

    const completedDates = [...completed]
      .sort()
      .slice(-TRACKER_MAX_COMPLETIONS_PER_HABIT);
    return { ...habit, completedDates };
  });

  return changed ? { ...state, habits } : state;
}

export function removeHabit(state: TrackerState, habitId: string): TrackerState {
  const habits = state.habits.filter((habit) => habit.id !== habitId);
  return habits.length === state.habits.length ? state : { ...state, habits };
}

export function getCurrentStreak(completedDates: string[], todayKey: string) {
  if (!isDateKey(todayKey)) return 0;
  const completed = new Set(completedDates);
  let cursor = completed.has(todayKey) ? todayKey : shiftDateKey(todayKey, -1);
  let streak = 0;

  while (completed.has(cursor) && streak < TRACKER_MAX_COMPLETIONS_PER_HABIT) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function getSevenDayCount(completedDates: string[], todayKey: string) {
  const completed = new Set(completedDates);
  return getRecentDateKeys(todayKey).reduce(
    (total, dateKey) => total + (completed.has(dateKey) ? 1 : 0),
    0
  );
}
