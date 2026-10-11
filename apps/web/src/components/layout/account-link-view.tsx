'use client';

import { useTranslations } from 'next-intl';
import { LayoutDashboard, UserRound } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LOGIN_HREF, PORTAL_HREF } from './nav-links';

export type AccountLinkProps = {
  size?: 'md' | 'lg';
  block?: boolean;
  withIcon?: boolean;
  className?: string;
  onClick?: () => void;
};

/** شكل الزرار بس: "دخول المريض" ← /login، أو "بوابتي" ← /portal (من غير ما يسأل الـAPI) */
export function AccountLinkView({
  signedIn,
  size = 'md',
  block,
  withIcon,
  className,
  onClick,
}: AccountLinkProps & { signedIn: boolean }) {
  const t = useTranslations('nav');
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
