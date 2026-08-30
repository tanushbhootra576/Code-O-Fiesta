import React from 'react';
import AuthGuard from '@/app/guards/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="ADMIN">
      {children}
    </AuthGuard>
  );
}
