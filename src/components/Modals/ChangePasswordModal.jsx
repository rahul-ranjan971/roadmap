import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ChangePasswordModal({ isOpen, onClose }) {
  const { updatePassword, authError, clearError } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (newPassword.length < 6) {
      setLocalError('Use a stronger password (at least 6 characters).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } catch {
      // Error in authError
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    clearError();
    setLocalError(null);
    setNewPassword('');
    setConfirmPassword('');
    setSuccess(false);
    onClose();
  };

  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#11131c] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Change Account Password</h3>
              <p className="text-[11px] text-gray-400">Update your credentials securely</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close change password modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-white">Password Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <p>{displayError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="modal-new-password" aria-label="New Password" className="block text-xs font-medium text-gray-300">
                New Password (min. 6 chars)
              </label>
              <div className="relative">
                <input
                  id="modal-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 pr-10 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-confirm-password" aria-label="Confirm New Password" className="block text-xs font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="modal-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (localError) setLocalError(null);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="Repeat new password"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
