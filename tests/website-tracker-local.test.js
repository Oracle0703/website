const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const sourcePath = path.join(process.cwd(), 'apps/website/lib/tracker-local.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: sourcePath,
  reportDiagnostics: true
});

assert.deepEqual(compiled.diagnostics, []);
const trackerModule = { exports: {} };
new Function('exports', 'module', 'require', compiled.outputText)(
  trackerModule.exports,
  trackerModule,
  require
);

const {
  TRACKER_MAX_HABITS,
  TRACKER_MAX_IMPORT_BYTES,
  createEmptyTrackerState,
  createHabit,
  getCurrentStreak,
  getRecentDateKeys,
  getSevenDayCount,
  isDateKey,
  isValidHabitName,
  parseTrackerState,
  removeHabit,
  serializeTrackerState,
  toggleHabitForDate
} = trackerModule.exports;

test('tracker local schema parses a valid v1 backup and canonicalizes dates', () => {
  const raw = JSON.stringify({
    version: 1,
    habits: [{
      id: 'habit_read',
      name: '  Read   20 minutes  ',
      createdOn: '2026-07-10',
      completedDates: ['2026-07-12', '2026-07-10']
    }]
  });
  const parsed = parseTrackerState(raw);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.empty, false);
  assert.equal(parsed.state.habits[0].name, 'Read 20 minutes');
  assert.deepEqual(parsed.state.habits[0].completedDates, ['2026-07-10', '2026-07-12']);
  assert.deepEqual(parseTrackerState(serializeTrackerState(parsed.state)).state, parsed.state);
});

test('tracker local parser safely rejects malformed, oversized, duplicated, and unsupported data', () => {
  assert.deepEqual(parseTrackerState(null), { ok: true, state: createEmptyTrackerState(), empty: true });
  assert.deepEqual(parseTrackerState('{nope'), { ok: false, reason: 'invalid_json' });
  assert.deepEqual(parseTrackerState('x'.repeat(TRACKER_MAX_IMPORT_BYTES + 1)), { ok: false, reason: 'too_large' });
  assert.equal(parseTrackerState(JSON.stringify({ version: 2, habits: [] })).ok, false);
  assert.equal(parseTrackerState(JSON.stringify({ version: 1, habits: [], extra: true })).ok, false);
  assert.equal(parseTrackerState(JSON.stringify({
    version: 1,
    habits: [
      { id: 'same', name: 'One', createdOn: '2026-07-10', completedDates: [] },
      { id: 'same', name: 'Two', createdOn: '2026-07-10', completedDates: [] }
    ]
  })).ok, false);
  assert.equal(parseTrackerState(JSON.stringify({
    version: 1,
    habits: [{ id: 'one', name: 'One', createdOn: '2026-07-10', completedDates: ['2026-07-09'] }]
  })).ok, false);
  assert.equal(parseTrackerState(JSON.stringify({
    version: 1,
    habits: [{ id: 'future', name: 'Future', createdOn: '9999-01-01', completedDates: [] }]
  })).ok, false);
  assert.equal(parseTrackerState(JSON.stringify({
    version: 1,
    habits: Array.from({ length: TRACKER_MAX_HABITS + 1 }, (_, index) => ({
      id: `habit_${index}`,
      name: `Habit ${index}`,
      createdOn: '2026-07-10',
      completedDates: []
    }))
  })).ok, false);
});

test('tracker date, name, toggle, streak, and seven-day helpers are deterministic', () => {
  assert.equal(isDateKey('2024-02-29'), true);
  assert.equal(isDateKey('2023-02-29'), false);
  assert.equal(isValidHabitName('  阅读 20 分钟  '), true);
  assert.equal(isValidHabitName('bad\u0000name'), false);
  assert.equal(isValidHabitName('spoof\u202ename'), false);
  assert.deepEqual(getRecentDateKeys('2026-07-16'), [
    '2026-07-10', '2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16'
  ]);

  const habit = createHabit('Read', '2026-07-10', 'habit_read');
  let state = { version: 1, habits: [habit] };
  for (const date of ['2026-07-13', '2026-07-14', '2026-07-15']) {
    state = toggleHabitForDate(state, 'habit_read', date);
  }
  assert.equal(getCurrentStreak(state.habits[0].completedDates, '2026-07-16'), 3);
  assert.equal(getSevenDayCount(state.habits[0].completedDates, '2026-07-16'), 3);

  state = toggleHabitForDate(state, 'habit_read', '2026-07-16');
  assert.equal(getCurrentStreak(state.habits[0].completedDates, '2026-07-16'), 4);
  state = toggleHabitForDate(state, 'habit_read', '2026-07-16');
  assert.equal(getCurrentStreak(state.habits[0].completedDates, '2026-07-16'), 3);
  assert.deepEqual(removeHabit(state, 'habit_read').habits, []);
});
