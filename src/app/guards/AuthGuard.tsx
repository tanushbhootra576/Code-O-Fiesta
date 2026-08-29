'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'PARTICIPANT' | 'JUDGE';
};

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { authenticated, loading, error, user, logout } = useAuth();

  // Handle redirect to login when not authenticated
  useEffect(() => {
    if (!loading && (!authenticated || !user)) {
      router.push('/login');
    }
  }, [loading, authenticated, user, router]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingState message="Verifying authentication..." mode="full-page" />
      </div>
    );
  }

  // Not authenticated - show loading (will redirect via useEffect)
  if (!authenticated || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingState message="Redirecting to login..." mode="full-page" />
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ErrorState 
          variant="access-denied" 
          title="Access Denied" 
          message={`This page requires ${requiredRole} access. Your current role is ${user.role}.`}
          onRetry={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ErrorState 
          variant="connection" 
          title="Authentication Error" 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Authenticated and authorized - render children
  return <>{children}</>;
}
