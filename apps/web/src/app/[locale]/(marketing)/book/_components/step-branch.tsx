'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, Clock, MapPin, UserRound } from 'lucide-react';
import { formatTime, isLocale, localized } from '@oxygen/shared';
import { cn } from '@/lib/utils';
import type { BookingCatalog } from './catalog';
import { choiceCardClass, SelectedCheck, stretchedButtonClass } from './choice';
import { StepNav } from './step-nav';
import type { BookingState } from './use-booking-state';

type StepProps = { catalog: BookingCatalog; state: BookingState };

/**
 * الخطوة 2 — الفرع (العيادة بس). الفروع اللي فيها دكتور من التخصص ده (ولو اخترت دكتور، فروعه هو بس).
 * كل كارت: الاسم، والمواعيد، وعدد الأطباء، و"الاتجاهات" (لينك منفصل جوه الكارت).
 */
export function StepBranch({ catalog, state }: StepProps) {
  const t = useTranslations('booking');
  const tBranches = useTranslations('branches');
  const locale = useLocale();
  if (!isLocale(locale)) return null;

  const options = catalog.branches
    .map((branch) => ({
      branch,
      doctors: catalog.doctors.filter(
        (doctor) =>
          doctor.specialty === state.specialty &&
          doctor.branch_ids.includes(branch.id) &&
          (!state.doctor || doctor.slug === state.doctor.slug),
      ).length,
    }))
    .filter((option) => option.doctors > 0);

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
        {t('branch.title')}
      </h2>
      <p className="mt-1 text-muted-foreground">{t('branch.subtitle')}</p>

      {options.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border bg-card p-6 text-center text-ink">
          {t('branch.empty')}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {options.map(({ branch, doctors }) => {
            const selected = state.branch?.id === branch.id;
            const name = localized(branch, 'name', locale);
            return (
              <li key={branch.id} className={choiceCardClass(selected)}>
                <SelectedCheck show={selected} />
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
                    <MapPin className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        state.update(
                          { branch: branch.slug, slot: undefined, with: undefined, step: 'time' },
                          { push: true },
                        )
                      }
                      className={cn(
                        stretchedButtonClass,
                        'pe-8 font-heading text-lg font-bold text-ink',
                      )}
                    >
                      {t('branch.name', { name })}
                    </button>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-4 shrink-0" aria-hidden />
                      {tBranches('hours', {
                        opens: formatTime(branch.opens_at, locale),
                        closes: formatTime(branch.closes_at, locale),
                      })}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <UserRound className="size-4 shrink-0" aria-hidden />
                      {t('branch.doctors', { count: doctors })}
                    </p>
                    <a
                      href={branch.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {tBranches('directions')}
                      <span className="sr-only"> — {name}</span>
                      <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <StepNav onBack={() => state.goTo('service')} />
    </section>
  );
}
