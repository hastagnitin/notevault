import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange } from '../firebase/authService.js';

/**
 * AuthContext — provides the current Firebase user object (or null)
 * and a loading flag to every component in the tree.
 *
 * Usage:
 *   const { user, loading } = useAuth();
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes.
    // onAuthChange also keeps the stored ID token fresh on each event.
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — must be used inside an <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
