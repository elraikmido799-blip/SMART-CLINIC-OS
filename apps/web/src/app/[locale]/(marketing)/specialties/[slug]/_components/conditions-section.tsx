import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { cn } from '@/lib/utils';
import type { PublicSpecialtyDetail } from '@/types/public';

// "بنعالج إيه" (A4): مربعات صغيرة بأيقونات منقطة. الأيقونة null = دايرة منقطة بلون التخصص
export async function ConditionsSection({ specialty }: { specialty: PublicSpecialtyDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale) || specialty.conditions.length === 0) return null;
  const t = await getTranslations('specialtyPage');
  const styles = specialtyStyles[specialty.slug];

  return (
    <section aria-labelledby="conditions-title" className="py-12 lg:py-16">
      <Container>
        <SectionHeading id="conditions-title" title={t('conditionsTitle')} />
        <RevealGroup className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {specialty.conditions.map((condition) => (
            <RevealItem key={condition.id} className="min-w-0">
              <div className="flex h-full flex-col items-center gap-3 rounded-lg border border-border bg-card px-3 py-5 text-center">
                {condition.icon_url ? (
                  <Image
                    src={condition.icon_url}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14"
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'grid size-14 place-items-center rounded-full border-2 border-dotted border-current',
                      styles.text,
                    )}
                  >
                    <span className={cn('size-3 rounded-full', styles.dot)} />
                  </span>
                )}
                <p className="font-medium break-words text-ink">
                  {localized(condition, 'name', locale)}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
