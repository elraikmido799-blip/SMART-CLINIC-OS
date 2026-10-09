'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, Menu, UserRound } from 'lucide-react';
import { directionOf, isLocale } from '@oxygen/shared';
import { brandButton } from '@/components/shared/brand';
import { Logo } from '@/components/shared/logo';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { BOOK_HREF, LOGIN_HREF, NAV_LINKS } from './nav-links';

// القايمة في الموبايل (A3): بتفتح من ناحية البداية (يمين في العربي)
export function MobileMenu() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const side = isLocale(locale) && directionOf(locale) === 'rtl' ? 'right' : 'left';
  const close = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="inline-flex size-11 items-center justify-center rounded-md text-ink hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={t('openMenu')}
      >
        <Menu className="size-6" aria-hidden />
      </SheetTrigger>
      <SheetContent side={side} className="w-full gap-0 bg-background p-6 sm:max-w-sm">
        <SheetTitle className="sr-only">{t('menuTitle')}</SheetTitle>
        <Logo />
        <nav aria-label={t('menuTitle')} className="mt-8">
          <ul className="divide-y divide-border">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex h-14 items-center justify-between text-lg text-ink"
                >
                  {t(link.key)}
                  <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher className="-ms-3 mt-4 self-start" />
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={LOGIN_HREF}
            onClick={close}
            className={brandButton({ tone: 'outline', size: 'lg', block: true })}
          >
            <UserRound aria-hidden />
            {t('patientLogin')}
          </Link>
          <Link
            href={BOOK_HREF}
            onClick={close}
            className={cn(brandButton({ tone: 'gold', size: 'lg', block: true }))}
          >
            {t('bookNow')}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
