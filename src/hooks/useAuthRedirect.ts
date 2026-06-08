'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextLegacy';

export function useAuthRedirect() {
  const { setRedirectPath, getRedirectPath, clearRedirectPath } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Función para redirigir al login guardando la ruta actual
  const redirectToLogin = (currentPath?: string) => {
    const pathToSave = currentPath || pathname;

    // No guardar ciertas rutas como redirect
    const excludePaths = ['/login', '/'];
    if (!excludePaths.includes(pathToSave)) {
      setRedirectPath(pathToSave);
    }

    router.push('/login');
  };

  // Función para redirigir después del login
  const redirectAfterLogin = () => {
    const savedPath = getRedirectPath();
    clearRedirectPath();

    if (savedPath && savedPath !== '/login') {
      router.push(savedPath);
    } else {
      router.push('/'); // Ruta por defecto
    }
  };

  return {
    redirectToLogin,
    redirectAfterLogin,
  };
}
