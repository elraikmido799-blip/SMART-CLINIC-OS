'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ClipboardList,
  FileHeart,
  FileText,
  Ruler,
  Scale,
  Stethoscope,
  StickyNote,
} from 'lucide-react';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { formatDate, formatNumber, isLocale, localized } from '@oxygen/shared';
import { specialtyStyles } from '@/components/shared/brand';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { TimelineEntry } from '@/types/portal';
import { useGetPassportQuery } from '../_api/care.api';
import { PageHeader } from './page-header';
import { QueryError } from './query-error';
import { WeightChart } from './weight-chart';

const KIND_ICONS: Record<TimelineEntry['kind'], typeof FileText> = {
  visit: Stethoscope,
  measurement: Scale,
  plan: ClipboardList,
  document: FileText,
  note: StickyNote,
};

/**
 * الـHealth Passport PP-03: أرقام سريعة (البداية · دلوقتي · الفرق · الهدف) + رسم الوزن + الخط الزمني
 * بفلتر بالتخصص (بيظهر بس التخصصات اللي في الخط). الأحدث فوق.
 */
export function PassportView() {
  const t = useTranslations('portal.passport');
  const tSpecialty = useTranslations('specialtyNames');
  const locale = useLocale();
  const passport = useGetPassportQuery();
  const [filter, setFilter] = useState<Specialty | 'all'>('all');
  if (!isLocale(locale)) return null;

  const header = <PageHeader title={t('title')} subtitle={t('subtitle')} />;
  if (passport.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }
  if (passport.isError || !passport.data) {
    return (
      <div className="space-y-6">
        {header}
        <QueryError onRetry={passport.refetch} />
      </div>
    );
  }

  const { measurements, timeline, goal_weight_kg: goal } = passport.data;
  if (measurements.length === 0 && timeline.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState icon={FileHeart} title={t('emptyTitle')} body={t('emptyBody')} />
      </div>
    );
  }

  const first = measurements[0];
  const last = measurements.at(-1);
  const kg = (value: number) => t('kg', { value: formatNumber(value, locale) });
  const change = first && last ? Math.round((last.weight_kg - first.weight_kg) * 10) / 10 : null;
  const stats = [
    first && { key: 'start', value: kg(first.weight_kg) },
    last && { key: 'now', value: kg(last.weight_kg) },
    change !== null && { key: 'change', value: kg(change) },
    goal !== null && { key: 'goal', value: kg(goal) },
    last?.waist_cm != null && {
      key: 'waist',
      value: t('cm', { value: formatNumber(last.waist_cm, locale) }),
    },
  ].filter(Boolean) as { key: string; value: string }[];

  const present = SPECIALTIES.filter((specialty) =>
    timeline.some((entry) => entry.specialty === specialty),
  );
  const entries = [...timeline]
    .filter((entry) => filter === 'all' || entry.specialty === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {header}

      {stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-border bg-card p-4">
              <dt className="text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-ink">
                <bdi>{stat.value}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {measurements.length >= 2 && (
        <section
          aria-labelledby="weight-title"
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 id="weight-title" className="flex items-center gap-2 font-semibold text-ink">
            <Ruler className="size-5 text-primary" aria-hidden />
            {t('weightTitle')}
          </h2>
          <div className="mt-4">
            <WeightChart data={measurements} goal={goal} />
          </div>
        </section>
      )}

      <section aria-labelledby="timeline-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="timeline-title" className="font-heading text-2xl font-bold text-ink">
            {t('timelineTitle')}
          </h2>
          {present.length > 1 && (
            <div role="group" aria-label={t('filter')} className="flex flex-wrap gap-2">
              {(['all', ...present] as const).map((value) => {
                const active = filter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(value)}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-ink hover:border-primary',
                    )}
                  >
                    {value !== 'all' && (
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          active ? 'bg-white' : specialtyStyles[value].dot,
                        )}
                        aria-hidden
                      />
                    )}
                    {value === 'all' ? t('all') : tSpecialty(value)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <ol className="relative mt-6 space-y-4 border-s-2 border-dotted border-primary/40 ps-6">
          {entries.map((entry) => {
            const Icon = KIND_ICONS[entry.kind];
            const styles = specialtyStyles[entry.specialty];
            return (
              <li key={entry.id} className="relative">
                <span
                  className={cn(
                    'absolute -start-[2.35rem] top-3 grid size-7 place-items-center rounded-full border-2 border-card bg-card',
                    styles.text,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <article className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <time dateTime={entry.date}>{formatDate(entry.date, locale)}</time>
                    <span
                      className={cn('inline-flex items-center gap-1.5 font-semibold', styles.text)}
                    >
                      <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
                      {tSpecialty(entry.specialty)}
                    </span>
                    <span>· {t(`kinds.${entry.kind}`)}</span>
                  </div>
                  <h3 className="mt-1 font-semibold text-ink">
                    {localized(entry, 'title', locale)}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{localized(entry, 'body', locale)}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
