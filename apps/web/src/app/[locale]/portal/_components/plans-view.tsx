'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ListChecks, PlayCircle, Video } from 'lucide-react';
import { formatDate, isLocale, localized } from '@oxygen/shared';
import { brandButton, specialtyIcon } from '@/components/shared/brand';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/portal';
import { useGetMyPlansQuery } from '../_api/care.api';
import { PageHeader } from './page-header';
import { QueryError } from './query-error';

/**
 * الخطط PP-05: تاب لكل خطة (تغذية · تمارين). الوجبات قايمة، والتمارين كروت فيها الفيديو (لو الأخصائي صوّره).
 * "خلصته النهارده" علامة على الجهاز بس — مش بتتبعت (الـAPI لسه مفيهوش متابعة يومية).
 */
export function PlansView() {
  const t = useTranslations('portal.plans');
  const plans = useGetMyPlansQuery();

  const header = <PageHeader title={t('title')} subtitle={t('subtitle')} />;
  return (
    <div className="space-y-6">
      {header}
      {plans.isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : plans.isError ? (
        <QueryError onRetry={plans.refetch} />
      ) : !plans.data?.length ? (
        <EmptyState
          icon={ListChecks}
          title={t('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href="/book" className={brandButton({ tone: 'gold' })}>
              {t('book')}
            </Link>
          }
        />
      ) : (
        <PlanTabs plans={plans.data} />
      )}
    </div>
  );
}

function PlanTabs({ plans }: { plans: Plan[] }) {
  const locale = useLocale();
  if (!isLocale(locale)) return null;
  return (
    <Tabs defaultValue={plans[0].id}>
      <TabsList className="h-auto flex-wrap">
        {plans.map((plan) => (
          <TabsTrigger key={plan.id} value={plan.id} className="gap-2">
            <Image
              src={specialtyIcon(plan.specialty)}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            {localized(plan, 'title', locale)}
          </TabsTrigger>
        ))}
      </TabsList>
      {plans.map((plan) => (
        <TabsContent key={plan.id} value={plan.id} className="mt-5">
          <PlanBody plan={plan} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function PlanBody({ plan }: { plan: Plan }) {
  const t = useTranslations('portal.plans');
  const locale = useLocale();
  const [done, setDone] = useState<string[]>([]);
  if (!isLocale(locale)) return null;
  const toggle = (id: string) =>
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <section aria-label={localized(plan, 'title', locale)}>
      <p className="text-sm text-muted-foreground">
        {t('by', {
          doctor: localized(plan, 'doctor_name', locale),
          date: formatDate(plan.updated_at, locale),
        })}
      </p>
      <p className="mt-1 text-sm font-semibold text-primary" aria-live="polite">
        {t('progress', { done: done.length, total: plan.items.length })}
      </p>

      <ul className={cn('mt-4 grid gap-3', plan.kind === 'exercises' && 'sm:grid-cols-2')}>
        {plan.items.map((item) => {
          const checked = done.includes(item.id);
          return (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
              {plan.kind === 'exercises' && (
                <div className="mb-3 grid aspect-video place-items-center rounded-xl bg-mist text-primary">
                  {item.video_url ? (
                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 font-semibold"
                    >
                      <PlayCircle className="size-12" strokeWidth={1.25} aria-hidden />
                      {t('watch')}
                    </a>
                  ) : (
                    <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
                      <Video className="size-8" strokeWidth={1.25} aria-hidden />
                      {t('videoSoon')}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink">{localized(item, 'title', locale)}</h3>
                  <p className="mt-1 text-muted-foreground">{localized(item, 'detail', locale)}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={checked}
                  aria-label={t('markDone', { item: localized(item, 'title', locale) })}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-full border-2 transition-colors',
                    checked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-dotted border-primary/50 text-primary/60 hover:border-primary',
                  )}
                >
                  <Check className="size-5" aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
