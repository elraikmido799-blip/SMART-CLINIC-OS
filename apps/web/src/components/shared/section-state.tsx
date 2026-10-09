import { getTranslations } from 'next-intl/server';
import { CloudOff, Inbox, SearchX, ServerCrash, TriangleAlert } from 'lucide-react';
import type { PublicErrorKind } from '@/api/public/fetch-public';
import { cn } from '@/lib/utils';
import { RetryButton } from './retry-button';

const ICONS = {
  network: CloudOff,
  'not-found': SearchX,
  server: ServerCrash,
  'invalid-response': TriangleAlert,
  unknown: TriangleAlert,
  empty: Inbox,
} as const;

type SectionStateProps = {
  // empty: الـAPI رجّع List فاضية · أي قيمة تانية: نوع الخطأ من fetchPublic
  state: PublicErrorKind | 'empty';
  className?: string;
};

/** بيتعرض مكان محتوى القسم لو الداتا فشلت أو فاضية، والصفحة بتكمل عادي */
export async function SectionState({ state, className }: SectionStateProps) {
  const t = await getTranslations('states');
  const Icon = ICONS[state];
  const canRetry = state !== 'empty' && state !== 'not-found';

  return (
    <div
      role={state === 'empty' ? 'status' : 'alert'}
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center',
        className,
      )}
    >
      <Icon className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
      <p className="font-semibold text-ink">{t(`${state}.title`)}</p>
      <p className="max-w-md text-sm text-muted-foreground">{t(`${state}.body`)}</p>
      {canRetry && <RetryButton label={t('retry')} />}
    </div>
  );
}
