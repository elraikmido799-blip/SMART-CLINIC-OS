'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// بيبدّل بين عربي وإنجليزي ويفضل في نفس الصفحة
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const nextLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      lang={nextLocale}
      disabled={isPending}
      onClick={() => startTransition(() => router.replace(pathname, { locale: nextLocale }))}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-ink hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60',
        className,
      )}
    >
      <Globe className="size-4" aria-hidden />
      {t('switchLanguage')}
    </button>
  );
}
