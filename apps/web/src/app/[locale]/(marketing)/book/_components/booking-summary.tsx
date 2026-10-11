'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarClock,
  MapPin,
  ReceiptText,
  Stethoscope,
  TimerReset,
  UserRound,
  Video,
} from 'lucide-react';
import { formatMoney, formatSlot, isLocale, localized } from '@oxygen/shared';
import { specialtyIcon } from '@/components/shared/brand';
import type { BookingCatalog } from './catalog';
import type { BookingState, StepId } from './use-booking-state';

type Row = {
  key: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
  detail?: string;
  step: StepId;
};

/**
 * ملخص الحجز (A7): ثابت جنب الخطوات على الكمبيوتر، وتحتها على الموبايل.
 * كل سطر بيتملي أول ما تختار، واللي لسه "لسه ماختارتش". "تعديل" بيرجّعك للخطوة بتاعته.
 */
export function BookingSummary({
  catalog,
  state,
}: {
  catalog: BookingCatalog;
  state: BookingState;
}) {
  const t = useTranslations('booking.summary');
  const tSpecialty = useTranslations('specialtyNames');
  const locale = useLocale();
  if (!isLocale(locale)) return null;

  const online = state.mode === 'online';
  const price = online
    ? state.onlineOption &&
      formatMoney(state.onlineOption.price_minor, catalog.onlineCurrency, locale)
    : state.service && formatMoney(state.service.price_from_minor, state.service.currency, locale);
  const slot = state.slot ? formatSlot(state.slot, locale) : undefined;
  const doctorName = state.slotDoctor
    ? localized(state.slotDoctor, 'name', locale)
    : state.doctor
      ? localized(state.doctor, 'name', locale)
      : undefined;

  const rows: Row[] = [
    {
      key: 'service',
      step: 'service',
      icon: state.specialty ? (
        <Image
          src={specialtyIcon(state.specialty)}
          alt=""
          width={24}
          height={24}
          className="size-6"
        />
      ) : (
        <Stethoscope className="size-5" aria-hidden />
      ),
      label: t('service'),
      value: online
        ? state.onlineOption && t('online', { specialty: tSpecialty(state.onlineOption.specialty) })
        : state.service && localized(state.service, 'name', locale),
      detail: online
        ? state.onlineOption && t('minutes', { minutes: state.onlineOption.duration_minutes })
        : state.service &&
          `${tSpecialty(state.service.specialty)} · ${t('minutes', { minutes: state.service.duration_minutes })}`,
    },
    online
      ? {
          key: 'place',
          step: 'service',
          icon: <Video className="size-5" aria-hidden />,
          label: t('place'),
          value: t('videoCall'),
          detail: t('videoDetail'),
        }
      : {
          key: 'place',
          step: 'branch',
          icon: <MapPin className="size-5" aria-hidden />,
          label: t('place'),
          value: state.branch && t('branch', { name: localized(state.branch, 'name', locale) }),
        },
    {
      key: 'doctor',
      step: 'time',
      icon: <UserRound className="size-5" aria-hidden />,
      label: t('doctor'),
      value: doctorName ?? (state.done.service && state.done.branch ? t('anyDoctor') : undefined),
    },
    {
      key: 'when',
      step: 'time',
      icon: <CalendarClock className="size-5" aria-hidden />,
      label: t('when'),
      value: slot && `${slot.day} · ${slot.time}`,
    },
  ];

  return (
    <aside
      aria-labelledby="summary-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="summary-title" className="font-heading text-xl font-bold text-ink">
        {t('title')}
      </h2>
      {state.program && (
        <p className="mt-2 inline-flex rounded-full bg-mist px-3 py-1 text-sm font-semibold text-primary">
          {t('program', { program: localized(state.program, 'name', locale) })}
        </p>
      )}
      <dl className="mt-4 divide-y divide-border">
        {rows.map((row) => (
          <div key={row.key} className="flex gap-3 py-3">
            <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
              {row.icon}
              <span className="sr-only">{row.label}</span>
            </dt>
            <dd className="min-w-0 flex-1">
              {row.value ? (
                <>
                  <span className="block font-semibold text-ink">{row.value}</span>
                  {row.detail && (
                    <span className="block text-sm text-muted-foreground">{row.detail}</span>
                  )}
                </>
              ) : (
                <span className="block text-sm text-muted-foreground">
                  {row.label} · {t('notChosen')}
                </span>
              )}
            </dd>
            {row.value &&
              row.step !== state.step &&
              state.steps.indexOf(row.step) < state.steps.indexOf(state.step) && (
                <button
                  type="button"
                  onClick={() => state.goTo(row.step)}
                  className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-primary hover:underline"
                >
                  {t('edit')}
                  <span className="sr-only"> — {row.label}</span>
                </button>
              )}
          </div>
        ))}
        <div className="flex items-center gap-3 py-3">
          <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
            <ReceiptText className="size-5" aria-hidden />
            <span className="sr-only">{t('price')}</span>
          </dt>
          <dd>
            {price ? (
              <>
                <span className="block font-heading text-xl font-bold text-ink">{price}</span>
                <span className="block text-sm text-muted-foreground">
                  {online ? t('priceOnline') : t('priceFrom')}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('price')} · {t('notChosen')}
              </span>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-2 flex gap-2 rounded-lg bg-mist p-3 text-sm text-ink">
        <TimerReset className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        {t('cancellation')}
      </p>
    </aside>
  );
}
