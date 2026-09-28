import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChange,
  getSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
} from '../lib/supabaseHelpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Restore session on mount
    getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const subscription = onAuthStateChange((newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authSignIn(email, password);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authSignUp(email, password);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    try {
      await authSignOut();
      setSession(null);
    } catch (err) {
      setAuthError(err.message);
    }
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const value = {
    session,
    user,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
