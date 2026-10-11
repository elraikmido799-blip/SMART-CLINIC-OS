'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Package as PackageIcon,
  Target,
  UserRound,
  Video,
} from 'lucide-react';
import { formatDate, formatNumber, formatSlot, isLocale, localized } from '@oxygen/shared';
import { useGetMeQuery } from '@/api/auth.api';
import { brandButton, specialtyIcon } from '@/components/shared/brand';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { greetingPeriod, isUpcoming } from '@/lib/dates';
import { useGetMyBookingsQuery } from '../_api/appointments.api';
import { useGetMyPackagesQuery, useGetMyProgramQuery, useGetPassportQuery } from '../_api/care.api';
import { useGetMyDocumentsQuery } from '../_api/documents.api';
import { DocumentIcon } from './document-icon';
import { PortalCard } from './portal-card';
import { ProgramStages } from './program-stages';
import { ProgressBar } from './progress-bar';
import { QueryError } from './query-error';
import { WeightChart } from './weight-chart';

const RECENT_DOCUMENTS = 3;

const linkClass =
  'mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-sm font-semibold text-primary hover:underline';

/**
 * الملخص PP-01: التحية + الموعد الجاي + البرنامج + الباقة + رسم الوزن + آخر الملفات.
 * كل كارت بيجيب داتته لوحده وليه Loading وError وفاضي، فلو حاجة وقعت الباقي بيكمل.
 */
export function OverviewView() {
  const t = useTranslations('portal.overview');
  const me = useGetMeQuery();
  const firstName = (me.data?.full_name ?? '').trim().split(/\s+/)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
          {firstName
            ? t(`greeting.${greetingPeriod()}`, { name: firstName })
            : t(`greetingNoName.${greetingPeriod()}`)}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* اللي دخل من صفحة الدخول من غير اسم: نطلب اسمه مرة واحدة */}
      {me.data && !me.data.full_name && (
        <p className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-mist p-4 text-ink sm:flex-row sm:items-center sm:justify-between">
          {t('addName')}
          <Link
            href="/portal/profile"
            className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
          >
            {t('addNameCta')}
          </Link>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-6">
        <NextAppointment />
        <ProgramCard />
        <PackageCard />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:gap-6">
        <ProgressCard />
        <RecentDocuments />
      </div>
    </div>
  );
}

function NextAppointment() {
  const t = useTranslations('portal.overview');
  const locale = useLocale();
  const bookings = useGetMyBookingsQuery();
  if (!isLocale(locale)) return null;

  const next = bookings.data
    ?.filter(
      (booking) =>
        (booking.status === 'confirmed' || booking.status === 'pending_payment') &&
        isUpcoming(booking.starts_at),
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

  return (
    <PortalCard id="next-title" title={t('next')} icon={CalendarDays}>
      {bookings.isLoading ? (
        <Skeleton className="h-36 rounded-xl" />
      ) : bookings.isError ? (
        <QueryError onRetry={bookings.refetch} className="border-0 p-0" />
      ) : !next ? (
        <div className="flex flex-1 flex-col items-start">
          <p className="text-muted-foreground">{t('noNext')}</p>
          <Link href="/book" className={brandButton({ tone: 'gold', className: 'mt-4' })}>
            {t('book')}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-4">
            <span className="grid size-20 shrink-0 place-items-center rounded-full border-[3px] border-dotted border-primary/50 bg-mist">
              <Image
                src={specialtyIcon(next.specialty)}
                alt=""
                width={44}
                height={44}
                className="size-11"
              />
            </span>
            <div className="min-w-0 space-y-1.5">
              <p className="font-heading text-lg font-bold text-ink">
                {localized(next.service, 'name', locale)}
              </p>
              <p className="flex items-center gap-2 text-sm text-ink">
                <Clock className="size-4 shrink-0 text-primary" aria-hidden />
                {formatSlot(next.starts_at, locale).day} ·{' '}
                <bdi>{formatSlot(next.starts_at, locale).time}</bdi>
              </p>
              <p className="flex items-center gap-2 text-sm text-ink">
                {next.branch ? (
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                ) : (
                  <Video className="size-4 shrink-0 text-primary" aria-hidden />
                )}
                {next.branch
                  ? t('branch', { name: localized(next.branch, 'name', locale) })
                  : t('online')}
              </p>
              <p className="flex items-center gap-2 text-sm text-ink">
                <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
                {localized(next.doctor, 'name', locale)}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {next.status === 'pending_payment' ? (
              <Link
                href={{ pathname: '/checkout', query: { booking: next.id } }}
                className={brandButton({ tone: 'gold' })}
              >
                {t('payNow')}
              </Link>
            ) : (
              <Link
                href={{ pathname: '/portal/appointments', query: { reschedule: next.id } }}
                className={brandButton({ tone: 'primary' })}
              >
                {t('reschedule')}
              </Link>
            )}
            {next.branch ? (
              <a
                href={next.branch.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className={brandButton({ tone: 'outline' })}
              >
                <MapPin aria-hidden />
                {t('directions')}
              </a>
            ) : (
              <Link href="/portal/appointments" className={brandButton({ tone: 'outline' })}>
                <Video aria-hidden />
                {t('callDetails')}
              </Link>
            )}
          </div>
        </>
      )}
    </PortalCard>
  );
}

function ProgramCard() {
  const t = useTranslations('portal.overview');
  const locale = useLocale();
  const program = useGetMyProgramQuery();
  if (!isLocale(locale)) return null;

  return (
    <PortalCard id="program-title" title={t('program')} icon={Target} className="bg-mist/40">
      {program.isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : program.isError ? (
        <QueryError onRetry={program.refetch} className="border-0 bg-transparent p-0" />
      ) : !program.data ? (
        <>
          <p className="text-muted-foreground">{t('noProgram')}</p>
          <Link href="/programs" className={linkClass}>
            {t('explorePrograms')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </>
      ) : (
        <>
          <p className="font-heading text-2xl font-bold text-ink">
            {localized(program.data, 'title', locale)}
          </p>
          <p className="mt-1 text-muted-foreground">
            {t('stage', {
              stage: program.data.stage,
              total: program.data.total_stages,
              title: localized(program.data, 'stage_title', locale),
            })}
          </p>
          <div className="mt-5">
            <ProgramStages
              stage={program.data.stage}
              total={program.data.total_stages}
              label={t('stageLabel', {
                stage: program.data.stage,
                total: program.data.total_stages,
              })}
            />
          </div>
          <Link href={`/programs/${program.data.slug}`} className={linkClass}>
            {t('programDetails')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </>
      )}
    </PortalCard>
  );
}

function PackageCard() {
  const t = useTranslations('portal.overview');
  const locale = useLocale();
  const packages = useGetMyPackagesQuery();
  if (!isLocale(locale)) return null;
  const active = packages.data?.find((item) => item.status === 'active');
  const left = active ? active.total_sessions - active.used_sessions : 0;

  return (
    <PortalCard id="package-title" title={t('package')} icon={PackageIcon}>
      {packages.isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : packages.isError ? (
        <QueryError onRetry={packages.refetch} className="border-0 p-0" />
      ) : !active ? (
        <>
          <p className="text-muted-foreground">{t('noPackage')}</p>
          <Link href="/portal/packages" className={linkClass}>
            {t('packageDetails')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </>
      ) : (
        <>
          <p className="font-heading text-xl font-bold text-ink">
            {localized(active, 'title', locale)}
          </p>
          <p className="mt-1 text-muted-foreground">
            {t('sessionsLeft', { left, total: active.total_sessions })}
          </p>
          <ProgressBar
            value={left}
            max={active.total_sessions}
            label={t('sessionsLeft', { left, total: active.total_sessions })}
            className="mt-4"
          />
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden />
            {t('expires', { date: formatDate(active.expires_at, locale) })}
          </p>
          <Link href="/portal/packages" className={linkClass}>
            {t('packageDetails')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </>
      )}
    </PortalCard>
  );
}

function ProgressCard() {
  const t = useTranslations('portal.overview');
  const locale = useLocale();
  const passport = useGetPassportQuery();
  if (!isLocale(locale)) return null;
  const measurements = passport.data?.measurements ?? [];

  return (
    <PortalCard
      id="progress-title"
      title={t('progress', { weeks: measurements.length })}
      icon={BarChart3}
      action={
        <Link
          href="/portal/passport"
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t('passport')}
        </Link>
      }
    >
      {passport.isLoading ? (
        <Skeleton className="h-60 rounded-xl" />
      ) : passport.isError ? (
        <QueryError onRetry={passport.refetch} className="border-0 p-0" />
      ) : measurements.length < 2 ? (
        <p className="text-muted-foreground">{t('noMeasurements')}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t('weight')}</p>
          <p className="flex flex-wrap items-baseline gap-x-3 font-heading text-ink">
            <span className="text-2xl font-bold">
              {t('kg', { value: formatNumber(measurements[0].weight_kg, locale) })}
            </span>
            <ArrowRight
              className="size-5 self-center text-muted-foreground rtl:rotate-180"
              aria-hidden
            />
            <span className="text-4xl font-bold">
              {t('kg', { value: formatNumber(measurements.at(-1)!.weight_kg, locale) })}
            </span>
          </p>
          {passport.data?.goal_weight_kg != null && (
            <p className="text-sm text-muted-foreground">
              {t('goal', { value: formatNumber(passport.data.goal_weight_kg, locale) })}
            </p>
          )}
          <div className="mt-4">
            <WeightChart data={measurements} goal={passport.data?.goal_weight_kg ?? null} />
          </div>
        </>
      )}
    </PortalCard>
  );
}

function RecentDocuments() {
  const t = useTranslations('portal.overview');
  const locale = useLocale();
  const documents = useGetMyDocumentsQuery();
  if (!isLocale(locale)) return null;
  const recent = documents.data?.slice(0, RECENT_DOCUMENTS) ?? [];

  return (
    <PortalCard
      id="documents-title"
      title={t('documents')}
      icon={FileText}
      action={
        <Link
          href="/portal/documents"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      }
    >
      {documents.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : documents.isError ? (
        <QueryError onRetry={documents.refetch} className="border-0 p-0" />
      ) : recent.length === 0 ? (
        <p className="text-muted-foreground">{t('noDocuments')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((document) => (
            <li key={document.id}>
              <Link
                href={{ pathname: '/portal/documents', query: { open: document.id } }}
                className="flex items-center gap-3 py-3 hover:bg-mist/40"
              >
                <DocumentIcon kind={document.kind} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">
                    {localized(document, 'title', locale)}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {formatDate(document.date, locale)}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground rtl:rotate-180"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalCard>
  );
}
