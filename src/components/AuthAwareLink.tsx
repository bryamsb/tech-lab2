'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContextLegacy';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { ReactNode } from 'react';

interface AuthAwareLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  requireAuth?: boolean;
  onClick?: () => void;
}

export default function AuthAwareLink({
  href,
  children,
  className,
  requireAuth = false,
  onClick,
}: AuthAwareLinkProps) {
  const { isAuthenticated } = useAuth();
  const { redirectToLogin } = useAuthRedirect();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      redirectToLogin(href);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
