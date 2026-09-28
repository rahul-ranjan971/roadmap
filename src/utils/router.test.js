import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePath } from './router.js';
import {
  clearAuthCallbackUrl,
  formatAuthError,
  getAuthCallbackError,
  getAuthRedirectUrl,
} from '../lib/supabaseHelpers.js';

test('router: normalizePath handles root and subpaths correctly', () => {
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('/login'), '/login');
  assert.equal(normalizePath('/login/'), '/login');
  assert.equal(normalizePath('/signup'), '/signup');
  assert.equal(normalizePath('/forgot-password'), '/forgot-password');
  assert.equal(normalizePath('/reset-password'), '/reset-password');
  assert.equal(normalizePath('/dashboard'), '/dashboard');
  assert.equal(normalizePath('/roadmap/login'), '/login');
  assert.equal(normalizePath('/roadmap/'), '/');
});

test('supabaseHelpers: formatAuthError returns human-friendly messages', () => {
  assert.equal(formatAuthError('Invalid login credentials'), 'Email or password is incorrect.');
  assert.equal(formatAuthError('User already registered'), 'This email is already registered. Try signing in.');
  assert.equal(formatAuthError('Unable to validate email address: invalid format'), 'Enter a valid email address.');
  assert.equal(formatAuthError('Password should be at least 6 characters'), 'Use a stronger password (minimum 6 characters).');
  assert.equal(formatAuthError('Passwords do not match'), 'Passwords do not match.');
  assert.equal(formatAuthError('Failed to fetch'), 'Unable to connect. Please try again.');
  assert.equal(formatAuthError('Email not confirmed'), 'Verify your email address before signing in.');
  assert.equal(formatAuthError('otp_expired'), 'This verification link has expired or has already been used. Please request a new verification email.');
  assert.equal(formatAuthError('over_email_send_rate_limit'), 'Too many verification requests. Please wait a moment before trying again.');
  assert.match(formatAuthError('Recovery session missing'), /recovery link is invalid or expired/);
  assert.match(formatAuthError('New password should be different from the old password'), /password could not be updated/);
});

test('auth redirects follow the current origin in development and production', () => {
  const previousWindow = globalThis.window;
  try {
    globalThis.window = { location: { origin: 'http://localhost:5173', pathname: '/roadmap/signup' } };
    assert.equal(getAuthRedirectUrl('/login'), 'http://localhost:5173/roadmap/login');
    assert.equal(getAuthRedirectUrl('/reset-password'), 'http://localhost:5173/roadmap/reset-password');

    globalThis.window.location.origin = 'https://career-compass.vercel.app';
    globalThis.window.location.pathname = '/signup';
    assert.equal(getAuthRedirectUrl('/login'), 'https://career-compass.vercel.app/login');
    assert.equal(getAuthRedirectUrl('/reset-password'), 'https://career-compass.vercel.app/reset-password');
    assert.doesNotMatch(getAuthRedirectUrl('/login'), /localhost/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('auth callback errors are friendly and callback tokens are removed from the URL', () => {
  const previousWindow = globalThis.window;
  const location = {
    origin: 'https://career-compass.example',
    href: 'https://career-compass.example/reset-password#error=access_denied&error_code=otp_expired&access_token=secret&refresh_token=secret',
    pathname: '/reset-password',
    search: '',
    hash: '#error=access_denied&error_code=otp_expired&access_token=secret&refresh_token=secret',
  };
  let replacedUrl = '';
  globalThis.window = {
    location,
    history: {
      state: null,
      replaceState(_state, _title, url) { replacedUrl = url; },
    },
  };

  try {
    assert.match(getAuthCallbackError(), /expired or has already been used/);
    clearAuthCallbackUrl();
    assert.doesNotMatch(replacedUrl, /access_token|refresh_token|error_code|error=/);
    assert.match(replacedUrl, /reset-password/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
