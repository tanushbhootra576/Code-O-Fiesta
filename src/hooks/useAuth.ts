'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PARTICIPANT' | 'JUDGE';
  teamId: string | null;
  teamMember: string | null;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
};

const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    authenticated: false,
  });

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthState({
            user: null,
            loading: false,
            error: null,
            authenticated: false,
          });
          return;
        }

        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();

      setAuthState({
        user: data.user,
        loading: false,
        error: null,
        authenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        authenticated: false,
      }));
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({
        user: null,
        loading: false,
        error: null,
        authenticated: false,
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if logout fails
      router.push('/login');
    }
  }, [router]);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    ...authState,
    logout,
    refresh: fetchUser,
  };
};

export default useAuth;
