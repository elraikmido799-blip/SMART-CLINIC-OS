'use client';

import { useTranslations } from 'next-intl';
import { LayoutDashboard, UserRound } from 'lucide-react';
import { useGetMeQuery } from '@/api/auth.api';
import { brandButton } from '@/components/shared/brand';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LOGIN_HREF, PORTAL_HREF } from './nav-links';

type AccountLinkProps = {
  size?: 'md' | 'lg';
  block?: boolean;
  withIcon?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * "دخول المريض" ← /login، ولو داخل "بوابتي" ← /portal (16 · 5.3).
 * لحد ما نعرف هو داخل ولا لأ بيبان "دخول المريض" (الأغلب)، فمفيش قفزة في الـNavbar.
 */
export function AccountLink({
  size = 'md',
  block,
  withIcon,
  className,
  onClick,
}: AccountLinkProps) {
  const t = useTranslations('nav');
  const signedIn = useGetMeQuery().isSuccess;
  const Icon = signedIn ? LayoutDashboard : UserRound;

  return (
    <Link
      href={signedIn ? PORTAL_HREF : LOGIN_HREF}
      onClick={onClick}
      className={cn(brandButton({ tone: 'outline', size, block }), className)}
    >
      {withIcon && <Icon aria-hidden />}
      {signedIn ? t('myPortal') : t('patientLogin')}
    </Link>
  );
}
