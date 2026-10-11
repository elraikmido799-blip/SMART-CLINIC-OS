'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, LogOut, Menu, MessageCircle, UserRound } from 'lucide-react';
import { useGetMeQuery, useLogoutMutation } from '@/api/auth.api';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Logo } from '@/components/shared/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { formatEgyptianMobile } from '@/lib/phone';
import { cn } from '@/lib/utils';
import { whatsappUrl } from '@/lib/whatsapp';
import { isActive, MOBILE_PRIMARY, PORTAL_NAV } from './portal-nav';

// الحروف الأولى من الاسم للأفاتار ("سارة أحمد" ← "سأ")
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '•';

/**
 * هيكل البوابة (PP-01): Sidebar على الكمبيوتر · شريط فوق + Bottom nav على الموبايل.
 * الـGuard: مش داخل ← /login?next=<الصفحة>. الـGuard وهمي على الفرونت بس؛ الحماية الحقيقية من الـAPI (401).
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('portal');
  const me = useGetMeQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [logout] = useLogoutMutation();
  const tWhatsapp = useTranslations('whatsapp');

  const signedOut = me.isError;
  useEffect(() => {
    if (signedOut) router.replace({ pathname: '/login', query: { next: pathname } });
  }, [signedOut, router, pathname]);

  const signOut = async () => {
    await logout();
    router.replace('/');
  };

  if (!me.data) {
    return (
      <div aria-busy className="flex min-h-dvh">
        <Skeleton className="hidden w-64 shrink-0 rounded-none lg:block" />
        <div className="flex-1 space-y-6 p-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
        {signedOut && <p className="sr-only">{t('redirecting')}</p>}
      </div>
    );
  }

  const name = me.data.full_name || t('patient');
  const help = (
    <a
      href={whatsappUrl(tWhatsapp('defaultMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-mist"
    >
      <MessageCircle className="size-6 text-primary" aria-hidden />
      <span>
        <span className="block font-semibold text-ink">{t('help')}</span>
        <span className="block text-primary">{t('helpWhatsapp')}</span>
      </span>
    </a>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-11 items-center gap-2 rounded-full ps-1 pe-3 text-sm font-semibold text-ink hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={t('accountMenu')}
      >
        <span className="grid size-9 place-items-center rounded-full bg-mist font-heading text-sm font-bold text-primary">
          {me.data.full_name ? (
            initials(me.data.full_name)
          ) : (
            <UserRound className="size-4" aria-hidden />
          )}
        </span>
        <span className="hidden max-w-36 truncate sm:inline">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block truncate text-ink">{name}</span>
          <bdi dir="ltr" className="block text-xs font-normal text-muted-foreground">
            {formatEgyptianMobile(me.data.phone)}
          </bdi>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/portal/profile">
            <UserRound aria-hidden />
            {t('nav.profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">
            <ExternalLink aria-hidden />
            {t('website')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="rtl:-scale-x-100" aria-hidden />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-dvh">
      <a
        href="#portal-main"
        className="sr-only rounded-md bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
      >
        {t('skip')}
      </a>

      {/* الـSidebar (كمبيوتر) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-border bg-card px-4 py-6 lg:flex">
        <Link href="/" aria-label={t('website')} className="px-2">
          <Logo />
        </Link>
        <nav aria-label={t('navLabel')} className="mt-8 flex-1">
          <ul className="space-y-1">
            {PORTAL_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      active ? 'bg-mist font-semibold text-primary' : 'text-ink hover:bg-mist/60',
                    )}
                  >
                    <item.icon className="size-5" aria-hidden />
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border pt-4">{help}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* الشريط اللي فوق */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/60 bg-card/95 px-4 backdrop-blur sm:px-6 lg:justify-end lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
          <Link href="/portal" aria-label={t('nav.overview')} className="me-auto lg:hidden">
            <Logo className="w-28" />
          </Link>
          <LanguageSwitcher />
          {userMenu}
        </header>

        <main id="portal-main" className="flex-1 px-4 pt-4 pb-28 sm:px-6 lg:px-10 lg:pb-12">
          {children}
        </main>
      </div>

      {/* الـBottom nav (موبايل): 4 أقسام + "المزيد" */}
      <nav
        aria-label={t('navLabel')}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {PORTAL_NAV.filter((item) =>
            (MOBILE_PRIMARY as readonly string[]).includes(item.key),
          ).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="size-5" aria-hidden />
                  <span className="max-w-full truncate px-1">{t(`navShort.${item.key}`)}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Menu className="size-5" aria-hidden />
                {t('more')}
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl pb-8">
                <SheetTitle className="px-4 pt-4 font-heading text-lg text-ink">
                  {t('more')}
                </SheetTitle>
                <ul className="mt-2 grid gap-1 px-2">
                  {PORTAL_NAV.filter(
                    (item) => !(MOBILE_PRIMARY as readonly string[]).includes(item.key),
                  ).map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                        className="flex h-12 items-center gap-3 rounded-lg px-3 font-medium text-ink hover:bg-mist aria-[current=page]:bg-mist aria-[current=page]:text-primary"
                      >
                        <item.icon className="size-5" aria-hidden />
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 border-t border-border px-2 pt-2">{help}</div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </div>
  );
}
