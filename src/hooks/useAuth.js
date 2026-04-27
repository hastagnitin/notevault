import { useState, useEffect } from 'react';
import { onAuthChange, logOut } from '../firebase/authService';

/**
 * useAuth Hook
 * Provides high-level authentication state and actions.
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth changes via our service
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    logOut,
    isAuthenticated: !!user,
  };
}
