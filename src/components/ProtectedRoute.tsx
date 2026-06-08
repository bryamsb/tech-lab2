'use client';

import { useAuth } from '@/contexts/AuthContextLegacy';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback = (
    <div className="min-h-screen bg-theme-background flex items-center justify-center">
      <div className="text-theme-text">Redirigiendo al login...</div>
    </div>
  ),
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { redirectToLogin } = useAuthRedirect();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, isLoading, redirectToLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-theme-text">Verificando autenticación...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
