import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  resendSignupVerification as authResendSignupVerification,
  signOut as authSignOut,
  resetPasswordForEmail,
  updateUserPassword,
  loadProfile,
  formatAuthError,
  getAuthCallbackError,
  clearAuthCallbackUrl,
} from '../lib/supabaseHelpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [profileState, setProfileState] = useState({ userId: null, value: null });
  const [recoverySession, setRecoverySession] = useState(false);

  useEffect(() => {
    const subscription = onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === 'PASSWORD_RECOVERY') {
        try {
          window.sessionStorage.setItem('cc_password_recovery', 'true');
        } catch {
          // The in-memory recovery state remains available for this page load.
        }
        setRecoverySession(Boolean(newSession));
        clearAuthCallbackUrl();
      } else if (event === 'SIGNED_OUT') {
        try {
          window.sessionStorage.removeItem('cc_password_recovery');
        } catch {
          // Storage can be unavailable in private browsing contexts.
        }
        setRecoverySession(false);
        setProfileState({ userId: null, value: null });
      } else if (event === 'SIGNED_IN') {
        setRecoverySession(false);
        clearAuthCallbackUrl();
      } else if (event === 'TOKEN_REFRESHED') {
        try {
          setRecoverySession(Boolean(newSession && window.sessionStorage.getItem('cc_password_recovery')));
        } catch {
          setRecoverySession(false);
        }
      } else if (event === 'INITIAL_SESSION') {
        const callbackError = getAuthCallbackError();
        if (callbackError) setAuthError(callbackError);
        try {
          setRecoverySession(Boolean(newSession && window.sessionStorage.getItem('cc_password_recovery')));
        } catch {
          setRecoverySession(false);
        }
        clearAuthCallbackUrl();
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  const user = session?.user ?? null;
  const profile = profileState.userId === user?.id ? profileState.value : null;

  useEffect(() => {
    let active = true;
    const userId = session?.user?.id;
    if (userId) {
      loadProfile(userId)
        .then((data) => {
          if (active) setProfileState({ userId, value: data || null });
        })
        .catch(() => {
          if (active) setProfileState({ userId, value: null });
        });
    }
    return () => { active = false; };
  }, [session?.user?.id]);

  const isAuthenticated = Boolean(user);

  // Determine user role (admin vs member)
  const userRole =
    profile?.role ||
    user?.app_metadata?.role ||
    'user';

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      return await authSignIn(email, password);
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, []);

  const signUp = useCallback(async (email, password, metadata = {}) => {
    setAuthError(null);
    try {
      const res = await authSignUp(email, password, metadata);
      setAuthError(null);
      return res;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, []);

  const resendSignupVerification = useCallback(async (email) => {
    setAuthError(null);
    try {
      const res = await authResendSignupVerification(email);
      setAuthError(null);
      return res;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      await authSignOut();
      setSession(null);
      setProfileState({ userId: null, value: null });
      setRecoverySession(false);
      try {
        window.sessionStorage.removeItem('cc_password_recovery');
      } catch {
        // Storage can be unavailable in private browsing contexts.
      }
      return true;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setAuthError(null);
    try {
      const res = await resetPasswordForEmail(email);
      return res;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword, { requireRecovery = false } = {}) => {
    setAuthError(null);
    try {
      if (requireRecovery && (!recoverySession || !session)) throw new Error('Recovery session missing');
      const res = await updateUserPassword(newPassword);
      return res;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, [recoverySession, session]);

  const clearError = useCallback(() => setAuthError(null), []);
  const value = {
    session,
    user,
    profile,
    userRole,
    isAdmin: userRole === 'admin',
    isAuthenticated,
    recoverySession,
    loading,
    authError,
    signIn,
    signUp,
    resendSignupVerification,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    refreshProfile: () => user?.id && loadProfile(user.id).then((data) => {
      setProfileState({ userId: user.id, value: data || null });
      return data;
    }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
