import React, { useState } from 'react';
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';

export function ForgotPassword() {
  const { resetPassword, authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSentSuccess(true);
    } catch {
      // Error handled via authError in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the email associated with your account to receive recovery instructions."
    >
      {sentSuccess ? (
        <div className="space-y-5 text-center py-2 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white">Instructions Sent</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              If an account exists for <span className="text-gray-200 font-medium">{email}</span>, a secure password recovery link has been dispatched.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : (
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

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className="block text-xs font-medium text-gray-300">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="name@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyRound className="w-4 h-4" />
            <span>{submitting ? 'Sending Instructions...' : 'Send Recovery Link'}</span>
          </button>

          {/* Navigation to Login */}
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
