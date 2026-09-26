// Stable localStorage keys — NEVER generate random keys, NEVER auto-clear
export const STORAGE_KEYS = {
  days: 'career-compass:v1:days',
  tasks: 'career-compass:v1:tasks',
  projects: 'career-compass:v1:projects',
  milestones: 'career-compass:v1:milestones',
  revision: 'career-compass:v1:revision',
  practice: 'career-compass:v1:practice',
  streaks: 'career-compass:v1:streaks',
  notes: 'career-compass:v1:notes',
  settings: 'career-compass:v1:settings',
};

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    console.error(`[CareerCompass] Failed to parse storage key: ${key}`);
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('[CareerCompass] localStorage quota exceeded');
    }
    return false;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // silent
  }
}

// Check if localStorage is available (private/incognito mode)
export function isStorageAvailable() {
  try {
    const test = '__cc_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Export all data for backup
export function exportAllData() {
  const data = {};
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    data[name] = loadFromStorage(key);
  }
  return data;
}

// Import data from backup (manual restore only)
export function importAllData(data) {
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    if (data[name] !== undefined) {
      saveToStorage(key, data[name]);
    }
  }
}
