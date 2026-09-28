import { supabase } from './superbase.js';

// --- Auth helpers ---

export function onAuthStateChange(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  );
  return subscription;
}

export function getSession() {
  if (!supabase) return Promise.resolve({ data: { session: null }, error: null });
  return supabase.auth.getSession();
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// --- Database helpers ---

/**
 * Load all user_progress rows for the authenticated user.
 * Returns { tasks: {taskId: bool}, days: {dayId: bool} } derived from rows.
 */
export async function loadProgress(userId) {
  if (!supabase) return { tasks: {}, days: {} };
  const { data, error } = await supabase
    .from('user_progress')
    .select('task_id, day_id, completed')
    .eq('user_id', userId);
  if (error) throw error;

  const tasks = {};
  const completedDayIds = new Set();
  const dayTaskMap = {}; // day_id -> [completed booleans]

  for (const row of data || []) {
    tasks[row.task_id] = !!row.completed;
    if (!dayTaskMap[row.day_id]) dayTaskMap[row.day_id] = [];
    dayTaskMap[row.day_id].push(!!row.completed);
  }

  // A day is complete if it has rows and all are completed
  for (const [dayId, completions] of Object.entries(dayTaskMap)) {
    if (completions.length > 0 && completions.every(Boolean)) {
      completedDayIds.add(dayId);
    }
  }

  const days = {};
  for (const dayId of completedDayIds) days[dayId] = true;

  return { tasks, days };
}

/**
 * Upsert a single task completion into user_progress.
 * Uses task_id + user_id as the conflict key.
 */
export async function saveTaskProgress(userId, taskId, dayId, completed) {
  if (!supabase) return;
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      { user_id: userId, task_id: taskId, day_id: dayId, completed },
      { onConflict: 'user_id,task_id' }
    );
  if (error) throw error;
}

/**
 * Batch upsert multiple tasks (for migration or toggleDay).
 */
export async function saveTaskProgressBatch(userId, entries) {
  if (!supabase || !entries || entries.length === 0) return;
  const rows = entries.map(e => ({
    user_id: userId,
    task_id: e.taskId,
    day_id: e.dayId,
    completed: e.completed,
  }));
  const { error } = await supabase
    .from('user_progress')
    .upsert(rows, { onConflict: 'user_id,task_id' });
  if (error) throw error;
}

/**
 * Load user_settings for the authenticated user.
 * Returns the full settings row or null.
 */
export async function loadSettings(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Upsert user_settings. The `settings` column is jsonb holding:
 * milestones, checklists, practice, revision, notes, streaks, learningLevel
 */
export async function saveSettings(userId, { selectedDayId, theme, settings }) {
  if (!supabase) return;
  const row = { user_id: userId, updated_at: new Date().toISOString() };
  if (selectedDayId !== undefined) row.selected_day_id = selectedDayId;
  if (theme !== undefined) row.theme = theme;
  if (settings !== undefined) row.settings = settings;

  const { error } = await supabase
    .from('user_settings')
    .upsert(row, { onConflict: 'user_id' });
  if (error) throw error;
}

/**
 * Load profile for the authenticated user.
 */
export async function loadProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
