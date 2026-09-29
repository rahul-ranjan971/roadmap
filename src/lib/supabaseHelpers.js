import { supabase } from './superbase.js';

// --- Auth helpers ---

export function getAuthRedirectUrl(path) {
  // Email links must always return to the configured canonical site when one
  // is available. Using window.location.origin first can generate links to
  // temporary Vercel preview deployments, where Supabase env vars may not be
  // configured. That makes the verification link open with a false
  // "Authentication service is not configured" error.
  let origin;
  const configuredSiteUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
    ? String(import.meta.env.VITE_SITE_URL).trim()
    : '';

  if (configuredSiteUrl) {
    try {
      const parsed = new URL(configuredSiteUrl);
      const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
      if (!(isProd && isLocalhost)) origin = parsed.origin;
    } catch {
      // Ignore an invalid build-time URL and fall back to the current origin.
    }
  }

  if (!origin && typeof window !== 'undefined' && window.location?.origin) {
    origin = window.location.origin;
  }

  if (!origin) return undefined;

  const pathname = typeof window !== 'undefined' && window.location?.pathname ? window.location.pathname : '';
  const base = /^\/roadmap(?:\/|$)/.test(pathname) ? '/roadmap' : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${base}${cleanPath}`;
}

const AUTH_CALLBACK_PARAMS = [
  'access_token',
  'refresh_token',
  'provider_token',
  'provider_refresh_token',
  'token_type',
  'expires_in',
  'expires_at',
  'code',
  'error',
  'error_code',
  'error_description',
  'type',
  'state',
  'sb_flow_id',
];

export function getAuthCallbackError() {
  if (typeof window === 'undefined') return null;
  const params = [
    new URLSearchParams(window.location.search),
    new URLSearchParams(window.location.hash.slice(1)),
  ];
  const error = params
    .map((values) => values.get('error_description') || values.get('error_code') || values.get('error'))
    .find(Boolean);
  return error ? formatAuthError(error) : null;
}

export function clearAuthCallbackUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  let changed = false;

  for (const key of AUTH_CALLBACK_PARAMS) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  const hashParams = new URLSearchParams(url.hash.slice(1));
  for (const key of AUTH_CALLBACK_PARAMS) {
    if (hashParams.has(key)) {
      hashParams.delete(key);
      changed = true;
    }
  }

  if (changed) {
    url.hash = hashParams.size ? `#${hashParams}` : '';
    window.history.replaceState(window.history.state, '', url.toString());
  }
}

export function formatAuthError(err) {
  if (!err) return '';
  const msg = typeof err === 'string'
    ? err
    : `${err.code || ''} ${err.message || err.msg || err.error_description || err.error || ''}`;
  const lower = msg.toLowerCase();

  if (lower.includes('email_not_confirmed') || lower.includes('email not confirmed')) {
    return 'Verify your email address before signing in.';
  }
  if (lower.includes('otp_expired') || lower.includes('expired') || lower.includes('invalid token') || lower.includes('email link is invalid')) {
    return 'This verification link has expired or has already been used. Please request a new verification email.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid grant') || lower.includes('invalid credentials')) {
    return 'Email or password is incorrect.';
  }
  if (lower.includes('user_already_exists') || lower.includes('user already registered') || lower.includes('already exists')) {
    return 'This email is already registered. Try signing in.';
  }
  if (lower.includes('over_email_send_rate_limit') || lower.includes('email rate limit') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many verification requests. Please wait a moment before trying again.';
  }
  if (lower.includes('invalid email') || lower.includes('valid email') || lower.includes('validate email') || (lower.includes('email') && lower.includes('invalid'))) {
    return 'Enter a valid email address.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Use a stronger password (minimum 6 characters).';
  }
  if (lower.includes('passwords do not match')) {
    return 'Passwords do not match.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'Unable to connect. Please try again.';
  }
  if (lower.includes('supabase is not configured')) {
    return 'Authentication service is not configured.';
  }
  if (lower.includes('recovery session missing')) {
    return 'This recovery link is invalid or expired. Request a new password reset email.';
  }
  if (lower.includes('password update') || (lower.includes('password') && (lower.includes('different') || lower.includes('same') || lower.includes('reuse')))) {
    return 'Your password could not be updated. Please request a new recovery link and try again.';
  }
  return 'Authentication could not be completed. Please try again.';
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    callback('INITIAL_SESSION', null);
    return { unsubscribe: () => {} };
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session)
  );
  return subscription;
}

export function getSession() {
  if (!supabase) return Promise.resolve({ data: { session: null }, error: null });
  return supabase.auth.getSession();
}

export async function signUp(email, password, { name } = {}) {
  if (!supabase) throw new Error('Supabase is not configured');
  const redirectUrl = getAuthRedirectUrl('/login');
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Auth Debug] Calling supabase.auth.signUp for:', email, 'redirecting to:', redirectUrl);
  }
  const options = {
    emailRedirectTo: redirectUrl,
    ...(name ? { data: { name, full_name: name } } : {}),
  };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options,
  });
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Auth Debug] supabase.auth.signUp response:', {
      hasUser: Boolean(data?.user),
      userId: data?.user?.id,
      hasSession: Boolean(data?.session),
      error: error?.message || null,
    });
  }
  if (error) throw error;
  if (data?.session && data?.user?.id && name) {
    try {
      await upsertProfile(data.user.id, { full_name: name, email });
    } catch {
      // Non-blocking if profile schema handled via Supabase trigger or session is absent
    }
  }
  return data;
}

export async function resendSignupVerification(email) {
  if (!supabase) throw new Error('Supabase is not configured');
  const redirectUrl = getAuthRedirectUrl('/login');
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Auth Debug] Calling supabase.auth.resend for signup:', email, 'redirecting to:', redirectUrl);
  }
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: redirectUrl },
  });
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Auth Debug] supabase.auth.resend response:', {
      data,
      error: error?.message || null,
    });
  }
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase is not configured');
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Auth Debug] Calling supabase.auth.signInWithPassword for:', email);
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('[Auth Debug] supabase.auth.signInWithPassword response:', {
      hasUser: Boolean(data?.user),
      userId: data?.user?.id,
      hasSession: Boolean(data?.session),
      error: error ? { message: error.message, status: error.status, name: error.name, code: error.code } : null,
    });
  }
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl('/reset-password'),
  });
  if (error) throw error;
  return data;
}

export async function updateUserPassword(newPassword) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Recovery session missing');
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
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

/**
 * Upsert profile for the authenticated user.
 */
export async function upsertProfile(userId, profileData = {}) {
  if (!supabase) return null;
  const row = {
    id: userId,
    updated_at: new Date().toISOString(),
    ...profileData,
  };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}
