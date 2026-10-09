import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// خطوات Secret Seven بالترتيب. النصوص في messages (journey.steps) لحد ما Oxygen يبعتوا التفاصيل
const STEPS = ['1', '2', '3', '4', '5', '6', '7'] as const;
const LAST_STEP = STEPS[STEPS.length - 1];

/**
 * Secret Seven (A2 · A3): النقط بتتصف خطوة خطوة، وآخر خطوة بتقفل حلقة كاملة (فكرة الهوية).
 * كمبيوتر: بالعرض · موبايل: بالطول.
 */
export async function JourneySection() {
  const t = await getTranslations('journey');

  return (
    <section aria-labelledby="journey-title" className="py-14 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <div>
          <SectionHeading
            id="journey-title"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
          <Link
            href="/programs/secret-seven"
            className={cn(brandButton({ tone: 'primary' }), 'mt-6 w-full sm:w-auto')}
          >
            {t('cta')}
            <ArrowRight className="rtl:rotate-180" aria-hidden />
          </Link>
        </div>

        <ol className="relative grid gap-6 lg:grid-cols-7 lg:gap-2">
          {STEPS.map((step) => {
            const isLast = step === LAST_STEP;
            return (
              <li
                key={step}
                className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center"
              >
                {/* الخط المنقط اللي بيوصل الخطوة باللي بعدها */}
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute start-6 top-12 h-[calc(100%-1.5rem)] border-s-2 border-dotted border-primary/50 lg:start-[calc(50%+1.75rem)] lg:top-6 lg:h-0 lg:w-[calc(100%-3.5rem+0.5rem)] lg:border-s-0 lg:border-t-2"
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-background font-heading text-lg font-bold text-ink',
                    isLast
                      ? 'border-[3px] border-dotted border-brand-to'
                      : 'border-2 border-dotted border-primary',
                  )}
                >
                  {step}
                </span>
                <div className="pt-2 lg:pt-0">
                  <h3 className="font-semibold text-ink">{t(`steps.${step}.title`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`steps.${step}.body`)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
