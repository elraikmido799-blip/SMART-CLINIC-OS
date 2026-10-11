'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { BriefcaseMedical, Sparkles } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { SlotPicker } from '@/components/shared/slot-picker';
import { cn } from '@/lib/utils';
import type { BookingCatalog } from './catalog';
import { choiceCardClass, SelectedCheck, stretchedButtonClass } from './choice';
import { StepNav } from './step-nav';
import type { BookingState } from './use-booking-state';

type StepProps = { catalog: BookingCatalog; state: BookingState };

const DEFAULT_PHOTO = '/images/doctors/default.png';

/**
 * الخطوة 3 — الطبيب والميعاد (A7). "أي طبيب متاح" (الافتراضي: مواعيد أكتر) أو "اختار طبيب".
 * المواعيد من الـSlotPicker المشترك. في "أي طبيب" الميعاد بيرجع معاه الدكتور الفاضي (with في الـURL).
 */
export function StepTime({ catalog, state }: StepProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const [choose, setChoose] = useState(Boolean(state.doctor));
  if (!isLocale(locale) || !state.specialty) return null;

  const doctors = catalog.doctors.filter(
    (doctor) =>
      doctor.specialty === state.specialty &&
      (state.mode === 'online' || (state.branch && doctor.branch_ids.includes(state.branch.id))),
  );
  const waitingForDoctor = choose && doctors.length > 1 && !state.doctor;

  const setMode = (pick: boolean) => {
    setChoose(pick);
    // "أي طبيب" بيشيل الدكتور المختار، والميعاد بيتشال لأن المواعيد هتتغير
    if (!pick && state.doctor)
      state.update({ doctor: undefined, slot: undefined, with: undefined });
  };

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
        {t('time.title')}
      </h2>
      <p className="mt-1 text-muted-foreground">{t('time.subtitle')}</p>

      {doctors.length > 1 && (
        <div
          role="group"
          aria-label={t('time.doctorMode')}
          className="mt-5 inline-flex rounded-lg border border-border bg-card p-1"
        >
          {[
            { pick: false, label: t('time.any') },
            { pick: true, label: t('time.choose') },
          ].map((option) => (
            <button
              key={String(option.pick)}
              type="button"
              aria-pressed={choose === option.pick}
              onClick={() => setMode(option.pick)}
              className={cn(
                'h-10 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                choose === option.pick
                  ? 'bg-primary text-primary-foreground'
                  : 'text-ink hover:bg-mist',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {!choose && doctors.length > 1 && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden />
          {t('time.anyHint')}
        </p>
      )}

      {/* دكتور واحد بس: كارت معلومة (مفيش حاجة تختارها) */}
      {doctors.length === 1 && (
        <div className="mt-5 flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Image
            src={doctors[0].photo_url ?? DEFAULT_PHOTO}
            alt=""
            width={64}
            height={64}
            className="size-14 shrink-0 rounded-full border-2 border-dotted border-primary/50 bg-mist object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t('time.onlyDoctor')}</p>
            <p className="font-semibold text-ink">{localized(doctors[0], 'name', locale)}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BriefcaseMedical className="size-4 shrink-0" aria-hidden />
              {t('time.years', { years: doctors[0].years_of_experience })}
            </p>
          </div>
        </div>
      )}

      {choose && doctors.length > 1 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const selected = state.doctor?.slug === doctor.slug;
            return (
              <li key={doctor.slug} className={choiceCardClass(selected)}>
                <SelectedCheck show={selected} />
                <div className="flex items-center gap-3">
                  <Image
                    src={doctor.photo_url ?? DEFAULT_PHOTO}
                    alt=""
                    width={64}
                    height={64}
                    className="size-14 shrink-0 rounded-full border-2 border-dotted border-primary/50 bg-mist object-cover"
                  />
                  <div className="min-w-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        state.update({ doctor: doctor.slug, slot: undefined, with: undefined })
                      }
                      className={cn(stretchedButtonClass, 'pe-6 font-semibold text-ink')}
                    >
                      {localized(doctor, 'name', locale)}
                    </button>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BriefcaseMedical className="size-4 shrink-0" aria-hidden />
                      {t('time.years', { years: doctor.years_of_experience })}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        {waitingForDoctor ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
            {t('time.pickDoctorFirst')}
          </p>
        ) : (
          <SlotPicker
            query={{
              mode: state.mode,
              specialty: state.specialty,
              service: state.service?.slug,
              branch: state.branch?.slug,
              doctor: state.doctor?.slug,
            }}
            date={state.date}
            onDateChange={(date) => state.update({ date, slot: undefined, with: undefined })}
            value={state.slot}
            onSelect={(slot) => state.update({ slot: slot.starts_at, with: slot.doctor_slug })}
          />
        )}
      </div>

      <StepNav
        onBack={() => state.goTo(state.mode === 'online' ? 'service' : 'branch')}
        onNext={() => state.goTo('details')}
        nextDisabled={!state.slot}
      />
    </section>
  );
}
