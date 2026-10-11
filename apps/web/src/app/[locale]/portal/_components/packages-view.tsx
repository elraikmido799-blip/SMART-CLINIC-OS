'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, CalendarDays, Package as PackageIcon, Target } from 'lucide-react';
import { formatDate, isLocale, localized } from '@oxygen/shared';
import { brandButton, specialtyIcon } from '@/components/shared/brand';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { useGetMyPackagesQuery, useGetMyProgramQuery } from '../_api/care.api';
import { PageHeader } from './page-header';
import { ProgramStages } from './program-stages';
import { ProgressBar } from './progress-bar';
import { QueryError } from './query-error';
import { StatusBadge } from './status-badge';

/**
 * الباقات PP-06: البرنامج اللي المريض فيه (مراحله) + كل باقة: الجلسات الباقية (Progress) والانتهاء
 * و"احجز جلسة". الاشتراكات الرقمية (P2) هتظهر هنا لما تبدأ.
 */
export function PackagesView() {
  const t = useTranslations('portal.packages');
  const locale = useLocale();
  const program = useGetMyProgramQuery();
  const packages = useGetMyPackagesQuery();
  if (!isLocale(locale)) return null;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {program.data && (
        <section
          aria-labelledby="my-program-title"
          className="rounded-2xl border border-border bg-mist/40 p-5 sm:p-6"
        >
          <h2 id="my-program-title" className="flex items-center gap-2 font-semibold text-ink">
            <Target className="size-5 text-primary" aria-hidden />
            {t('program')}
          </h2>
          <p className="mt-3 font-heading text-2xl font-bold text-ink">
            {localized(program.data, 'title', locale)}
          </p>
          <p className="text-muted-foreground">
            {t('stage', {
              stage: program.data.stage,
              total: program.data.total_stages,
              title: localized(program.data, 'stage_title', locale),
            })}
          </p>
          <div className="mt-4 max-w-xl">
            <ProgramStages
              stage={program.data.stage}
              total={program.data.total_stages}
              label={t('stageLabel', {
                stage: program.data.stage,
                total: program.data.total_stages,
              })}
            />
          </div>
          <Link
            href={`/programs/${program.data.slug}`}
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t('programDetails')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </section>
      )}

      {packages.isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : packages.isError ? (
        <QueryError onRetry={packages.refetch} />
      ) : !packages.data?.length ? (
        <EmptyState
          icon={PackageIcon}
          title={t('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href="/contact" className={brandButton({ tone: 'outline' })}>
              {t('ask')}
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {packages.data.map((item) => {
            const left = item.total_sessions - item.used_sessions;
            return (
              <li
                key={item.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={specialtyIcon(item.specialty)}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10"
                    />
                    <h2 className="font-heading text-lg font-bold text-ink">
                      {localized(item, 'title', locale)}
                    </h2>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-4 font-heading text-3xl font-bold text-ink">
                  {t('left', { left })}
                  <span className="ms-2 text-base font-normal text-muted-foreground">
                    {t('ofTotal', { total: item.total_sessions })}
                  </span>
                </p>
                <ProgressBar
                  value={left}
                  max={item.total_sessions}
                  label={t('progressLabel', { left, total: item.total_sessions })}
                  className="mt-3"
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('used', { used: item.used_sessions })}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden />
                  {t('expires', { date: formatDate(item.expires_at, locale) })}
                </p>
                {item.status === 'active' && left > 0 && (
                  <Link
                    href={{ pathname: '/book', query: { specialty: item.specialty } }}
                    className={brandButton({ tone: 'primary', className: 'mt-5 self-start' })}
                  >
                    {t('bookSession')}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
