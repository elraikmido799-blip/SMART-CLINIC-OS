import { getLocale, getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';
import { isLocale } from '@oxygen/shared';
import { specialtyStyles } from '@/components/shared/brand';
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
          {/* خطوات منقطة زي Secret Seven: دواير منقطة متوصلة بخط منقط (A0) */}
          <ol className="mt-5">
            {expect.map((item, index) => (
              <li key={item} className="relative flex gap-4 pb-6 last:pb-0">
                {index < expect.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute start-[1.125rem] top-10 bottom-1 border-s-2 border-dotted border-primary/40"
                  />
                )}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-dotted border-primary bg-card text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <p className="pt-1.5 text-base text-ink">{item}</p>
              </li>
            ))}
          </ol>
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
