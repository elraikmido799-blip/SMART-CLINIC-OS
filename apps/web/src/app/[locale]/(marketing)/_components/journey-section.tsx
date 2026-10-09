import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { JourneySteps } from './journey-steps';

// خطوات Secret Seven بالترتيب. النصوص في messages (journey.steps) لحد ما Oxygen يبعتوا التفاصيل
const STEPS = ['1', '2', '3', '4', '5', '6', '7'] as const;

/**
 * Secret Seven (A2 · A3).
 * من 1280px: العنوان جنب الخطوات. أقل من كده: العنوان فوق في النص، والخطوات تحته.
 */
export async function JourneySection() {
  const t = await getTranslations('journey');
  const steps = STEPS.map((number) => ({
    number,
    title: t(`steps.${number}.title`),
    body: t(`steps.${number}.body`),
  }));

  return (
    <section aria-labelledby="journey-title" className="py-14 lg:py-20">
      <Container className="grid gap-10 xl:grid-cols-[minmax(0,20rem)_1fr] xl:items-start">
        <div className="flex flex-col items-center xl:items-start">
          <SectionHeading
            id="journey-title"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            className="lg:mx-auto lg:text-center xl:mx-0 xl:text-start"
          />
          <Link
            href="/programs/secret-seven"
            className={cn(brandButton({ tone: 'primary' }), 'group mt-6 w-full sm:w-auto')}
          >
            {t('cta')}
            <ArrowRight
              className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <JourneySteps steps={steps} />
      </Container>
    </section>
  );
}
