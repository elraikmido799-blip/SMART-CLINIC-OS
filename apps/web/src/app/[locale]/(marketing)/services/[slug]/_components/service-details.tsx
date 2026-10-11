import { getLocale, getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';
import { isLocale } from '@oxygen/shared';
import { specialtyStyles } from '@/components/shared/brand';
import { DottedSteps } from '@/components/shared/dotted-steps';
import { cn } from '@/lib/utils';
import type { PublicServiceDetail } from '@/types/public';

// "مناسبة لمين" · "هتلاقي إيه" (خطوات مرقّمة بنقط) · "تجهّز إزاي". أي List فاضية القسم بتاعها مش بيظهر
export async function ServiceDetails({ service }: { service: PublicServiceDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('servicePage');
  const styles = specialtyStyles[service.specialty];
  const ar = locale === 'ar';
  const suitableFor = ar ? service.suitable_for_ar : service.suitable_for_en;
  const expect = ar ? service.expect_ar : service.expect_en;
  const preparation = ar ? service.preparation_ar : service.preparation_en;

  return (
    <div className="space-y-10">
      {suitableFor.length > 0 && (
        <section aria-labelledby="suitable-title">
          <h2 id="suitable-title" className="font-heading text-2xl font-bold text-ink">
            {t('suitableFor')}
          </h2>
          <ul className="mt-4 space-y-3">
            {suitableFor.map((item) => (
              <li key={item} className="flex items-start gap-3 text-base text-ink">
                <Check className={cn('mt-1 size-5 shrink-0', styles.text)} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {expect.length > 0 && (
        <section aria-labelledby="expect-title">
          <h2 id="expect-title" className="font-heading text-2xl font-bold text-ink">
            {t('expect')}
          </h2>
          <div className="mt-5">
            <DottedSteps steps={expect.map((item) => ({ id: item, title: item }))} />
          </div>
        </section>
      )}

      {preparation.length > 0 && (
        <section aria-labelledby="preparation-title" className="rounded-lg bg-mist p-5 sm:p-6">
          <h2 id="preparation-title" className="font-heading text-xl font-bold text-ink">
            {t('preparation')}
          </h2>
          <ul className="mt-3 list-disc space-y-2 ps-5 text-base text-ink marker:text-primary">
            {preparation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
