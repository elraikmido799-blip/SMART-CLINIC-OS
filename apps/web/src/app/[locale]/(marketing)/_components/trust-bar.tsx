import { Fragment } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatNumber, isLocale } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { Container } from '@/components/shared/container';
import type { HomeContent } from '@/types/public';

const STATS = ['specialties', 'branches', 'specialists', 'patients'] as const;
// الأرقام دي "أكتر من" (20+ أخصائي)، والباقي رقم مظبوط
const APPROXIMATE: ReadonlySet<(typeof STATS)[number]> = new Set(['specialists', 'patients']);

// شريط الأرقام (A1). لو المحتوى فشل بيستخبى: الأرقام مش أساسية للصفحة
export async function TrustBar({ content }: { content: PublicResult<HomeContent> }) {
  if (!content.ok) return null;
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('trust');

  return (
    <section aria-label={t('label')} className="bg-mist">
      <Container>
        <dl className="grid grid-cols-2 gap-6 py-8 sm:flex sm:items-center sm:justify-center sm:gap-8 lg:gap-12">
          {STATS.map((stat, index) => {
            const value = formatNumber(content.data.stats[stat], locale);
            return (
              <Fragment key={stat}>
                {index > 0 && (
                  <span
                    className="hidden size-1.5 shrink-0 rounded-full bg-primary sm:block"
                    aria-hidden
                  />
                )}
                {/* dt قبل dd في الـHTML، والرقم بيظهر الأول بالـflex */}
                <div className="flex flex-col-reverse gap-0.5 sm:flex-row-reverse sm:items-baseline sm:gap-2">
                  <dt className="text-sm text-muted-foreground">{t(stat)}</dt>
                  <dd className="font-heading text-2xl font-bold text-ink">
                    {APPROXIMATE.has(stat) ? t('atLeast', { value }) : value}
                  </dd>
                </div>
              </Fragment>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}
