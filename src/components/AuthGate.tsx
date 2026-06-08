'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // No bloqueamos la UI: renderizamos siempre y, si se quiere, se puede mostrar un micro-indicador no intrusivo.
  return (
    <>
      {children}
      {hydrated && loading && (
        <span className="sr-only" aria-live="polite">
          Verificando autenticación
        </span>
      )}
    </>
  );
}
