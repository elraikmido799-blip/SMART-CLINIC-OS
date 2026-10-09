'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TriangleAlert } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Link } from '@/i18n/navigation';

// أي خطأ مش متوقع في أي صفحة: رسالة + نحاول تاني، بدل شاشة بيضا
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations('errorPage');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-10 text-primary" strokeWidth={1.5} aria-hidden />
      <h1 className="font-heading text-2xl font-bold text-ink">{t('title')}</h1>
      <p className="text-muted-foreground">{t('body')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className={brandButton({ tone: 'primary' })}>
          {t('retry')}
        </button>
        <Link href="/" className={brandButton({ tone: 'outline' })}>
          {t('home')}
        </Link>
      </div>
    </main>
  );
}
