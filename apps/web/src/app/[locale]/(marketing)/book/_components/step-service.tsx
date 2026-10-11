'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, Info, Video } from 'lucide-react';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { formatMoney, isLocale, localized } from '@oxygen/shared';
import { specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { cn } from '@/lib/utils';
import type { BookingCatalog } from './catalog';
import { choiceCardClass, SelectedCheck, stretchedButtonClass } from './choice';
import type { BookingState } from './use-booking-state';

type StepProps = { catalog: BookingCatalog; state: BookingState };

/**
 * الخطوة 1 — الخدمة. في العيادة: الخدمات متقسمة بالتخصص، وفوقها فلتر (بيبدأ بالتخصص اللي جه من الـURL).
 * في الأونلاين: كارت لكل تخصص متاح أونلاين بسعره ومدته.
 * الاختيار بيودّي للخطوة اللي بعدها على طول (من غير "التالي").
 */
export function StepService({ catalog, state }: StepProps) {
  const t = useTranslations('booking');
  const tSpecialty = useTranslations('specialtyNames');
  const locale = useLocale();
  // الدكتور أو الفرع اللي جه من الـURL بيحدد التخصصات المتاحة
  const allowed = SPECIALTIES.filter(
    (specialty) =>
      (!state.doctor || state.doctor.specialty === specialty) &&
      (state.mode === 'online' ||
        !state.branch ||
        catalog.doctors.some(
          (doctor) =>
            doctor.specialty === specialty && doctor.branch_ids.includes(state.branch!.id),
        )),
  );
  const [filter, setFilter] = useState<Specialty | 'all'>(
    state.specialty && allowed.includes(state.specialty) ? state.specialty : 'all',
  );
  if (!isLocale(locale)) return null;

  const keepDoctor = (specialty: Specialty) =>
    state.doctor?.specialty === specialty ? state.doctor.slug : undefined;

  if (state.mode === 'online') {
    const options = catalog.online.filter((option) => allowed.includes(option.specialty));
    return (
      <section aria-labelledby="step-title">
        <h2 id="step-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
          {t('service.onlineTitle')}
        </h2>
        <p className="mt-1 text-muted-foreground">{t('service.onlineSubtitle')}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const selected = state.specialty === option.specialty && Boolean(state.onlineOption);
            return (
              <li key={option.specialty} className={choiceCardClass(selected)}>
                <SelectedCheck show={selected} />
                <div className="flex items-center gap-3">
                  <Image
                    src={specialtyIcon(option.specialty)}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12"
                  />
                  <div>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        state.update(
                          {
                            specialty: option.specialty,
                            doctor: keepDoctor(option.specialty),
                            slot: undefined,
                            with: undefined,
                            step: 'time',
                          },
                          { push: true },
                        )
                      }
                      className={cn(
                        stretchedButtonClass,
                        'font-heading text-lg font-bold text-ink',
                      )}
                    >
                      {tSpecialty(option.specialty)}
                    </button>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Video className="size-4" aria-hidden />
                      {t('service.minutes', { minutes: option.duration_minutes })}
                    </p>
                  </div>
                </div>
                <p className="mt-3 font-semibold text-ink">
                  {formatMoney(option.price_minor, catalog.onlineCurrency, locale)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  const visible = SPECIALTIES.filter(
    (specialty) => allowed.includes(specialty) && (filter === 'all' || filter === specialty),
  );

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
        {t('service.title')}
      </h2>
      <p className="mt-1 text-muted-foreground">{t('service.subtitle')}</p>

      {state.program && (
        <p className="mt-4 flex gap-2 rounded-lg bg-mist p-3 text-sm text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {t('service.programNote', { program: localized(state.program, 'name', locale) })}
        </p>
      )}

      {allowed.length > 1 && (
        <div role="group" aria-label={t('service.filter')} className="mt-5 flex flex-wrap gap-2">
          {(['all', ...allowed] as const).map((value) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
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
                {value === 'all' ? t('service.all') : tSpecialty(value)}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-8">
        {visible.map((specialty) => {
          const services = catalog.services.filter((service) => service.specialty === specialty);
          if (services.length === 0) return null;
          return (
            <div key={specialty}>
              <h3 className="flex items-center gap-2 font-semibold text-ink">
                <Image
                  src={specialtyIcon(specialty)}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7"
                />
                {tSpecialty(specialty)}
              </h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const selected = state.service?.slug === service.slug;
                  // الفرع اللي في الـURL لسه مناسب للخدمة الجديدة؟ يبقى نعدّي خطوة الفرع
                  const branch = catalog.branches.find((item) => item.slug === state.branchSlug);
                  const branchFits =
                    branch &&
                    catalog.doctors.some(
                      (doctor) =>
                        doctor.specialty === specialty && doctor.branch_ids.includes(branch.id),
                    );
                  return (
                    <li key={service.slug} className={choiceCardClass(selected)}>
                      <SelectedCheck show={selected} />
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          state.update(
                            {
                              service: service.slug,
                              specialty,
                              doctor: keepDoctor(specialty),
                              slot: undefined,
                              with: undefined,
                              step: branchFits ? 'time' : 'branch',
                            },
                            { push: true },
                          )
                        }
                        className={cn(stretchedButtonClass, 'pe-8 font-semibold text-ink')}
                      >
                        {localized(service, 'name', locale)}
                      </button>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-4" aria-hidden />
                          {t('service.minutes', { minutes: service.duration_minutes })}
                        </span>
                        <span className="font-semibold text-ink">
                          {t('service.from', {
                            price: formatMoney(service.price_from_minor, service.currency, locale),
                          })}
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
