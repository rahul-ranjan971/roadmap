import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';

export function ResetPassword() {
  const { updatePassword, signOut, isAuthenticated, recoverySession, loading, authError, clearError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password.length < 6) {
      setLocalError('Use a stronger password (at least 6 characters).');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password, { requireRecovery: true });
      const didSignOut = await signOut();
      if (!didSignOut) throw new Error('Password update succeeded, but sign-out failed. Please sign out and log in again.');
      navigate('/login?password=updated', { replace: true });
    } catch {
      // Handled via authError in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  if (loading) {
    return <AuthLayout title="Checking Recovery Link" subtitle="Securing your password reset session." />;
  }

  if (!isAuthenticated || !recoverySession) {
    return (
      <AuthLayout title="Recovery Link Unavailable" subtitle="This password recovery session is no longer valid.">
        <div className="space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p role="alert" className="text-xs text-rose-300 leading-relaxed">
            {authError || 'This recovery link is invalid or expired. Request a new password reset email.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/forgot-password', { replace: true })}
            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            Request a New Recovery Link
          </button>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter and confirm your new secure password to restore account access."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {displayError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">{displayError}</p>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="reset-new-password" aria-label="New Password" className="block text-xs font-medium text-gray-300">
              New Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Enter new password"
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="reset-confirm-password" aria-label="Confirm New Password" className="block text-xs font-medium text-gray-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Repeat new password"
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? 'Updating Password...' : 'Save New Password'}</span>
          </button>
      </form>
    </AuthLayout>
  );
}
