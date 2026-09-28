import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChange,
  getSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPasswordForEmail,
  updateUserPassword,
  loadProfile,
  formatAuthError,
} from '../lib/supabaseHelpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      const data = await loadProfile(userId);
      setProfile(data || null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Restore session on mount
    getSession()
      .then(({ data }) => {
        const initialSession = data?.session ?? null;
        setSession(initialSession);
        if (initialSession?.user?.id) {
          fetchProfile(initialSession.user.id);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Listen for auth changes (login, logout, token refresh, password recovery)
    const subscription = onAuthStateChange((newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe?.();
  }, [fetchProfile]);

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(user);

  // Determine user role (admin vs member)
  const userRole =
    profile?.role ||
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    (user?.email && user.email.toLowerCase().includes('admin') ? 'admin' : 'member');

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authSignIn(email, password);
      if (data?.user?.id) {
        await fetchProfile(data.user.id);
      }
      return data;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, [fetchProfile]);

  const signUp = useCallback(async (email, password, metadata = {}) => {
    setAuthError(null);
    try {
      const data = await authSignUp(email, password, metadata);
      if (data?.user?.id) {
        await fetchProfile(data.user.id);
      }
      return data;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      await authSignOut();
      setSession(null);
      setProfile(null);
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
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

  const updatePassword = useCallback(async (newPassword) => {
    setAuthError(null);
    try {
      const res = await updateUserPassword(newPassword);
      return res;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const value = {
    session,
    user,
    profile,
    userRole,
    isAdmin: userRole === 'admin',
    isAuthenticated,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    refreshProfile: () => user?.id && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
