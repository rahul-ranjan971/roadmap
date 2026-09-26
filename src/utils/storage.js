// Stable localStorage keys — NEVER generate random keys, NEVER auto-clear
export const STORAGE_KEYS = {
  days: 'career-compass:v1:days',
  tasks: 'career-compass:v1:tasks',
  projects: 'career-compass:v1:projects',
  milestones: 'career-compass:v1:milestones',
  checklists: 'career-compass:v1:checklists',
  revision: 'career-compass:v1:revision',
  practice: 'career-compass:v1:practice',
  streaks: 'career-compass:v1:streaks',
  notes: 'career-compass:v1:notes',
  settings: 'career-compass:v1:settings',
  quoteDate: 'career-compass:v1:quote-date',
  quoteIndex: 'career-compass:v1:quote-index',
};

export function loadFromStorage(key, fallback = null) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      console.warn('[CareerCompass] localStorage quota exceeded');
    }
    return false;
  }
}

export function removeFromStorage(key) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  } catch {
    // silent
  }
}

// Check if localStorage is available (private/incognito mode)
export function isStorageAvailable() {
  try {
    if (typeof localStorage === 'undefined') return false;
    const test = '__cc_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Export all data for backup (stores both key names for full backward/forward compatibility)
export function exportAllData() {
  const data = {};
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    const val = loadFromStorage(key);
    data[name] = val;
    data[key] = val;
  }
  return data;
}

// Import data from backup (manual restore only with fallback key resolution)
export function importAllData(data) {
  if (!data || typeof data !== 'object') return false;
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    const val = data[key] !== undefined ? data[key] : data[name];
    if (val !== undefined) {
      saveToStorage(key, val);
    }
  }
  return true;
}
