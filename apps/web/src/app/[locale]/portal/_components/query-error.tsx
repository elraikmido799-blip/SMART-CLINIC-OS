'use client';

import { useTranslations } from 'next-intl';
import { CloudOff, RotateCcw } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { cn } from '@/lib/utils';

/** حالة الخطأ في أي قسم في البوابة: "مقدرناش نجيب …" + "جرب تاني" (refetch) */
export function QueryError({ onRetry, className }: { onRetry: () => void; className?: string }) {
  const t = useTranslations('portal');
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-8 text-center',
        className,
      )}
    >
      <CloudOff className="size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      <p className="mt-3 text-ink">{t('error')}</p>
      <button
        type="button"
        onClick={onRetry}
        className={brandButton({ tone: 'outline', className: 'mt-4' })}
      >
        <RotateCcw className="rtl:-scale-x-100" aria-hidden />
        {t('retry')}
      </button>
    </div>
  );
}
