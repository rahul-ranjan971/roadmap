import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';

export function Login() {
  const { signIn, authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [passwordUpdated] = useState(
    () => new URLSearchParams(window.location.search).get('password') === 'updated'
  );

  useEffect(() => {
    if (passwordUpdated) {
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
  }, [passwordUpdated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(trimmedEmail, password);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error handled via authError in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    clearError();
    setLocalError(null);
    const demoEmail = typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_EMAIL
      ? import.meta.env.VITE_DEMO_EMAIL
      : 'demo@careercompass.dev';
    setEmail(demoEmail);
    setPassword('');
  };

  const displayError = localError || authError;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your isolated account and continue your 120-day roadmap."
    >
      {passwordUpdated && (
        <p role="status" className="mb-4 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
          Password updated. Sign in with your new password.
        </p>
      )}
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
          <label htmlFor="login-email" className="block text-xs font-medium text-gray-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-email"
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" aria-label="Password" className="block text-xs font-medium text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder="Enter your password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn className="w-4 h-4" />
          <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
        </button>

        {/* Demo Account Helper */}
        <div className="pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Use Demo Account Preset</span>
          </button>
        </div>

        {/* Navigation to Signup */}
        <div className="pt-3 text-center">
          <p className="text-xs text-gray-400">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
