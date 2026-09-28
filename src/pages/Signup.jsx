import React, { useEffect, useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';

export function Signup() {
  const { signUp, resendSignupVerification, authError, clearError } = useAuth();

  const [pendingEmail] = useState(
    () => (typeof window !== 'undefined' ? sessionStorage.getItem('cc_pending_verification_email') || '' : '')
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState(pendingEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(
    () => (pendingEmail ? 'Account created. Check your email to verify your account.' : null)
  );
  const [resendMessage, setResendMessage] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown === 0) return undefined;
    const timeout = window.setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Enter a valid email address.';
    if (password.length < 6) return 'Use a stronger password (at least 6 characters).';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setResendError(null);
    setResendMessage(null);

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setSubmitting(true);
    const trimmedEmail = email.trim();
    try {
      const res = await signUp(trimmedEmail, password, { name: name.trim() });
      clearError();
      if (res?.user && !res?.session) {
        try {
          sessionStorage.setItem('cc_pending_verification_email', trimmedEmail);
        } catch {
          // Private browsing fallback
        }
        setSignupSuccess('Account created. Check your email to verify your account.');
      } else {
        try {
          sessionStorage.removeItem('cc_pending_verification_email');
        } catch {
          // Private browsing fallback
        }
        navigate('/dashboard', { replace: true });
      }
    } catch {
      // Error handled via authError in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    clearError();
    setResendMessage(null);
    setResendError(null);
    setResending(true);
    let sent = false;
    const targetEmail = email.trim() || pendingEmail;
    try {
      await resendSignupVerification(targetEmail);
      clearError();
      setResendMessage('Verification email sent. Check your inbox.');
      setResendCooldown(60);
      sent = true;
    } catch (err) {
      setResendError(err.message || authError);
    } finally {
      setResending(false);
      if (!sent) setResendCooldown(15);
    }
  };

  const displayError = localError || authError;
  const activeVerificationError = resendError || (authError && authError !== 'Authentication could not be completed. Please try again.' ? authError : null);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register your isolated profile to begin the 120-day engineering journey."
    >
      {signupSuccess ? (
        <div className="space-y-5 text-center py-2 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white">Verification Required</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              {signupSuccess}
            </p>
            {email && (
              <p className="text-xs text-gray-300 font-medium">
                Sent to: <span className="text-indigo-300">{email}</span>
              </p>
            )}
          </div>
          {(resendMessage || activeVerificationError) && (
            <p role={resendMessage ? 'status' : 'alert'} className={`text-xs ${resendMessage ? 'text-emerald-300' : 'text-rose-300'}`}>
              {resendMessage || activeVerificationError}
            </p>
          )}
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending || resendCooldown > 0}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Back to Login</span>
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

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="block text-xs font-medium text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Alex Developer"
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="block text-xs font-medium text-gray-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="signup-email"
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
            <label htmlFor="signup-password" aria-label="Password" className="block text-xs font-medium text-gray-300">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Create password"
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="signup-confirm-password" aria-label="Confirm Password" className="block text-xs font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Repeat password"
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
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
          </button>

          {/* Navigation to Login */}
          <div className="pt-3 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
