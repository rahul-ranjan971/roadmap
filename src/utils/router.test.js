import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePath } from './router.js';
import { formatAuthError } from '../lib/supabaseHelpers.js';

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
});
