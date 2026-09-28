import { practiceResources } from '../data/practiceResources.js';
import { projects } from '../data/projects.js';
import { quotes } from '../data/quotes.js';
import { roadmap } from '../data/roadmap.js';
import { topics } from '../data/topics.js';
import { STORAGE_KEYS } from './storage.js';

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const sameValue = (left, right) => JSON.stringify(sortValue(left)) === JSON.stringify(sortValue(right));

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (isRecord(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
  }
  return value;
}

function readField(data, name, key) {
  const hasName = Object.hasOwn(data, name);
  const hasKey = Object.hasOwn(data, key);
  if (hasName && hasKey && !sameValue(data[name], data[key])) {
    throw new Error(`Conflicting values for ${name}`);
  }
  return {
    present: hasName || hasKey,
    value: hasKey ? data[key] : data[name],
  };
}

function validateMap(value, name, allowedIds, validateValue) {
  if (value === null) return {};
  if (!isRecord(value)) throw new Error(`${name} must be an object`);

  for (const [id, entry] of Object.entries(value)) {
    if (!allowedIds.has(id)) throw new Error(`${name} contains unknown ID: ${id}`);
    if (!validateValue(entry)) throw new Error(`${name} contains invalid data for ${id}`);
  }
  return value;
}

const dayIds = new Set(roadmap.map((day) => day.id));
const taskIds = new Set(roadmap.flatMap((day) => day.tasks.map((task) => task.id)));
const topicIds = new Set(topics.map((topic) => topic.id));
const milestoneIds = new Set(projects.flatMap((project) => project.milestones.map((milestone) => milestone.id)));
const practiceIds = new Set(practiceResources.map((resource) => resource.id));
const checklistPrefixes = { github: 'gh', readme: 'rm', deployment: 'dp', testing: 'ts' };
const checklistIds = new Set(projects.flatMap((project) => Object.entries(project.checklists).flatMap(([group, items]) => (
  items.map((_, index) => `${project.id}-${checklistPrefixes[group]}-${index}`)
))));
const revisionStatuses = new Set(['needs_revision', 'in_progress', 'completed', 'mastered']);

const mapFields = [
  { name: 'tasks', key: STORAGE_KEYS.tasks, ids: taskIds, check: (value) => typeof value === 'boolean' },
  { name: 'days', key: STORAGE_KEYS.days, ids: dayIds, check: (value) => typeof value === 'boolean' },
  { name: 'milestones', key: STORAGE_KEYS.milestones, ids: milestoneIds, check: (value) => typeof value === 'boolean' },
  { name: 'checklists', key: STORAGE_KEYS.checklists, ids: checklistIds, check: (value) => typeof value === 'boolean' },
  {
    name: 'practice',
    key: STORAGE_KEYS.practice,
    ids: practiceIds,
    check: (value) => typeof value === 'boolean' || (
      isRecord(value)
      && typeof value.status === 'boolean'
      && (value.timesPracticed === undefined || (Number.isInteger(value.timesPracticed) && value.timesPracticed >= 0))
      && (value.lastPracticed === undefined || value.lastPracticed === null || isDate(value.lastPracticed))
    ),
  },
  {
    name: 'revision',
    key: STORAGE_KEYS.revision,
    ids: topicIds,
    check: (value) => typeof value === 'string'
      ? revisionStatuses.has(value)
      : isRecord(value)
        && revisionStatuses.has(value.status)
        && (value.lastUpdated === undefined || isDate(value.lastUpdated)),
  },
  { name: 'notes', key: STORAGE_KEYS.notes, ids: dayIds, check: (value) => typeof value === 'string' },
];
const progressFields = [...mapFields.map(({ name }) => name), 'streaks'];

export function validateProgressImport(data) {
  try {
    if (!isRecord(data)) throw new Error('Backup must contain a JSON object');

    const updates = {};
    const presentFields = new Set();

    for (const field of mapFields) {
      const imported = readField(data, field.name, field.key);
      if (!imported.present) continue;
      updates[field.key] = validateMap(imported.value, field.name, field.ids, field.check);
      presentFields.add(field.name);
    }

    const streaks = readField(data, 'streaks', STORAGE_KEYS.streaks);
    if (streaks.present) {
      const value = streaks.value;
      if (value !== null && (!isRecord(value)
        || (value.current !== undefined && (!Number.isInteger(value.current) || value.current < 0))
        || (value.longest !== undefined && (!Number.isInteger(value.longest) || value.longest < 0))
        || (value.lastStudyDate !== undefined && value.lastStudyDate !== null && !isDate(value.lastStudyDate)))) {
        throw new Error('streaks contains invalid data');
      }
      updates[STORAGE_KEYS.streaks] = value === null ? null : value;
      presentFields.add('streaks');
    }

    const quoteDate = readField(data, 'quoteDate', STORAGE_KEYS.quoteDate);
    if (quoteDate.present) {
      if (quoteDate.value !== null && !isDate(quoteDate.value)) throw new Error('quoteDate is invalid');
      updates[STORAGE_KEYS.quoteDate] = quoteDate.value;
      presentFields.add('quoteDate');
    }

    const quoteIndex = readField(data, 'quoteIndex', STORAGE_KEYS.quoteIndex);
    if (quoteIndex.present) {
      if (quoteIndex.value !== null && (!Number.isInteger(quoteIndex.value) || quoteIndex.value < 0 || quoteIndex.value >= quotes.length)) {
        throw new Error('quoteIndex is invalid');
      }
      updates[STORAGE_KEYS.quoteIndex] = quoteIndex.value;
      presentFields.add('quoteIndex');
    }

    if (!progressFields.some((field) => presentFields.has(field))) {
      throw new Error('Backup contains no progress data');
    }

    return { success: true, updates, presentFields };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function mergeProgressImport(updates, presentFields, currentState) {
  const isFullBackup = progressFields.every((field) => presentFields.has(field));
  const merged = { ...updates };

  for (const field of mapFields) {
    if (!presentFields.has(field.name)) continue;
    merged[field.key] = isFullBackup
      ? updates[field.key]
      : { ...currentState[field.name], ...updates[field.key] };
  }

  if (presentFields.has('tasks') && !presentFields.has('days')) {
    const importedTasks = merged[STORAGE_KEYS.tasks];
    const importedDays = { ...currentState.days };
    for (const day of roadmap) {
      const isComplete = day.tasks.length > 0 && day.tasks.every((task) => importedTasks[task.id]);
      if (isComplete) importedDays[day.id] = true;
      else if (importedDays[day.id]) importedDays[day.id] = false;
    }
    merged[STORAGE_KEYS.days] = importedDays;
  } else if (presentFields.has('days') && !presentFields.has('tasks')) {
    const importedTasks = { ...currentState.tasks };
    for (const day of roadmap) {
      if (merged[STORAGE_KEYS.days][day.id]) {
        day.tasks.forEach((task) => { importedTasks[task.id] = true; });
      }
    }
    merged[STORAGE_KEYS.tasks] = importedTasks;
  }

  if (presentFields.has('streaks')) {
    const imported = updates[STORAGE_KEYS.streaks];
    merged[STORAGE_KEYS.streaks] = isFullBackup
      ? {
        current: imported?.current ?? 0,
        longest: imported?.longest ?? imported?.current ?? 0,
        lastStudyDate: imported?.lastStudyDate ?? null,
      }
      : { ...currentState.streaks, ...imported };
  }

  return merged;
}