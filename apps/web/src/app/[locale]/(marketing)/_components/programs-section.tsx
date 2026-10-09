import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';
import { formatMoney, isLocale, localized } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { cn } from '@/lib/utils';
import type { PublicProgram } from '@/types/public';

// البرامج الأونلاين (A2)
export async function ProgramsSection({ programs }: { programs: PublicResult<PublicProgram[]> }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('programs');

  return (
    <section aria-labelledby="programs-title" className="py-14 lg:py-20">
      <Container>
        <SectionHeading id="programs-title" title={t('title')} subtitle={t('subtitle')} />
        <div className="mt-8">
          {!programs.ok ? (
            <SectionState state={programs.error} />
          ) : programs.data.length === 0 ? (
            <SectionState state="empty" />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {programs.data.map((program) => {
                const styles = specialtyStyles[program.specialty];
                const features = locale === 'ar' ? program.features_ar : program.features_en;
                return (
                  <li key={program.id}>
                    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-5">
                      <div className="flex items-center gap-3">
                        <Image
                          src={specialtyIcon(program.specialty)}
                          alt=""
                          width={40}
                          height={40}
                          className="size-10"
                        />
                        <h3 className="font-semibold text-ink">
                          {localized(program, 'name', locale)}
                        </h3>
                      </div>
                      <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                        {features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              className={cn('mt-0.5 size-4 shrink-0', styles.text)}
                              aria-hidden
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 rounded-md bg-mist px-3 py-2 text-sm font-semibold text-primary">
                        {t('priceFrom', {
                          price: formatMoney(program.price_from_minor, program.currency, locale),
                        })}
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
