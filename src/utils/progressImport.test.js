import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEYS, importAllData } from './storage.js';
import { mergeProgressImport, validateProgressImport } from './progressImport.js';

test('rejects empty and non-object backups', () => {
  assert.equal(validateProgressImport({}).success, false);
  assert.equal(validateProgressImport(null).success, false);
  assert.equal(validateProgressImport([]).success, false);
});

test('accepts legacy aliases and validates task IDs', () => {
  const result = validateProgressImport({ tasks: { 'day-001-task-01': true } });
  assert.equal(result.success, true);
  assert.deepEqual(result.updates[STORAGE_KEYS.tasks], { 'day-001-task-01': true });
});

test('rejects invalid IDs, values, and conflicting aliases', () => {
  assert.equal(validateProgressImport({ tasks: { 'missing-task': true } }).success, false);
  assert.equal(validateProgressImport({ revision: { 'missing-topic': { status: 'completed' } } }).success, false);
  assert.equal(validateProgressImport({ practice: { 'practice-exercism-python': { status: 'yes' } } }).success, false);
  assert.equal(validateProgressImport({ tasks: {}, [STORAGE_KEYS.tasks]: { 'day-001-task-01': true } }).success, false);
});

test('validates supported practice and revision formats', () => {
  const result = validateProgressImport({
    practice: { 'practice-exercism-python': { status: true, timesPracticed: 2, lastPracticed: '2026-09-27' } },
    revision: { 'topic-html': { status: 'completed', lastUpdated: '2026-09-27' } },
  });
  assert.equal(result.success, true);
});

test('writes known fields atomically and rolls back failed writes', () => {
  const values = new Map([[STORAGE_KEYS.tasks, '{"day-001-task-01":true}']]);
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === STORAGE_KEYS.days) throw new Error('quota exceeded');
      values.set(key, String(value));
    },
    removeItem: (key) => values.delete(key),
  };

  try {
    assert.equal(importAllData({ [STORAGE_KEYS.tasks]: {}, [STORAGE_KEYS.days]: {} }), false);
    assert.equal(values.get(STORAGE_KEYS.tasks), '{"day-001-task-01":true}');
    assert.equal(values.has(STORAGE_KEYS.days), false);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('partial legacy imports merge instead of clearing omitted progress', () => {
  const validation = validateProgressImport({ tasks: {} });
  const merged = mergeProgressImport(validation.updates, validation.presentFields, {
    tasks: { 'day-001-task-01': true },
    days: {},
    milestones: {},
    checklists: {},
    practice: {},
    revision: {},
    notes: {},
    streaks: { current: 2, longest: 2, lastStudyDate: '2026-09-27' },
  });

  assert.equal(merged[STORAGE_KEYS.tasks]['day-001-task-01'], true);
  assert.deepEqual(merged[STORAGE_KEYS.days], {});
});

test('partial task and day imports reconcile completion state', () => {
  const currentState = {
    tasks: {
      'day-001-task-01': true,
      'day-001-task-02': true,
      'day-001-task-03': true,
      'day-001-task-04': true,
    },
    days: {},
  };
  const taskImport = validateProgressImport({ tasks: { 'day-001-task-05': true } });
  const mergedTasks = mergeProgressImport(taskImport.updates, taskImport.presentFields, currentState);
  assert.equal(mergedTasks[STORAGE_KEYS.days]['day-001'], true);

  const dayImport = validateProgressImport({ days: { 'day-001': true } });
  const mergedDays = mergeProgressImport(dayImport.updates, dayImport.presentFields, currentState);
  assert.equal(mergedDays[STORAGE_KEYS.tasks]['day-001-task-05'], true);
});

test('complete backups intentionally replace existing progress', () => {
  const backup = Object.fromEntries([
    ['tasks', {}], ['days', {}], ['milestones', {}], ['checklists', {}],
    ['practice', {}], ['revision', {}], ['notes', {}], ['streaks', {}],
  ]);
  const validation = validateProgressImport(backup);
  const merged = mergeProgressImport(validation.updates, validation.presentFields, {
    tasks: { 'day-001-task-01': true },
  });

  assert.equal(validation.success, true);
  assert.deepEqual(merged[STORAGE_KEYS.tasks], {});
});