import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  BellRing,
  HeartHandshake,
  MessagesSquare,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { getPrograms } from '@/api/public/programs';
import { brandButton, specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { DottedSteps } from '@/components/shared/dotted-steps';
import { LeadForm } from '@/components/shared/lead-form';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { ProgramsSection } from '@/components/shared/programs-section';
import { Reveal } from '@/components/shared/reveal';
import { SectionHeading } from '@/components/shared/section-heading';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('digitalPage');
  return { title: t('title'), description: t('metaDescription') };
}

const BENEFITS = [
  { key: 'team', icon: Users },
  { key: 'app', icon: Smartphone },
  { key: 'chat', icon: MessagesSquare },
  { key: 'human', icon: HeartHandshake },
] as const;

const NEXT_STEPS = ['call', 'launch', 'priority'] as const;

/**
 * البرامج الرقمية W-10 (WEB-07: في الـMVP صفحة تعريف + فورم اهتمام بيعمل Lead). مفيش صورة تصميم (DEC-32).
 * المنتجات الـ4 هي نفسها البرامج الأونلاين، وتفاصيل كل واحد في /programs/[slug] — مفيش /digital/[slug] (DEC-37).
 * الفورم بيسأل "مهتم بإيه؟" وبيبعت landing_page: /digital/<slug>، فالـCRM يعرف المنتج.
 */
export default async function DigitalPage() {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('digitalPage');
  const programs = await getPrograms();
  const products = programs.ok ? programs.data : [];

  return (
    <>
      <section aria-labelledby="digital-title" className="pt-10 lg:pt-16">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div className="text-center lg:text-start">
            <div className="flex justify-center lg:justify-start">
              <PageBreadcrumb items={[{ label: t('title') }]} />
            </div>
            <p className="mt-5 inline-flex h-9 items-center gap-2 rounded-full border border-primary/30 bg-mist px-4 text-sm font-semibold text-primary">
              <Sparkles className="size-4" aria-hidden />
              {t('badge')}
            </p>
            <h1
              id="digital-title"
              className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl"
            >
              {t('heading')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground lg:mx-0">
              {t('subtitle')}
            </p>
            <a
              href="#interest"
              className={brandButton({ tone: 'gold', size: 'lg', className: 'mt-7' })}
            >
              <BellRing aria-hidden />
              {t('cta')}
            </a>
          </div>

          {/* الـ4 منتجات بلون كل تخصص: صورة المنتج لو موجودة (16 · 2.4)، وإلا أيقونة التخصص */}
          {products.length > 0 && (
            <ul aria-hidden className="grid grid-cols-2 gap-3 sm:gap-4">
              {products.slice(0, 4).map((product, index) => {
                const styles = specialtyStyles[product.specialty];
                return (
                  <li
                    key={product.id}
                    className={cn(
                      'relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-4 text-center',
                      styles.tint,
                      styles.border,
                      index % 2 === 1 && 'translate-y-6',
                    )}
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt=""
                        fill
                        sizes="(min-width: 992px) 20vw, 45vw"
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={specialtyIcon(product.specialty)}
                        alt=""
                        width={80}
                        height={80}
                        className="size-14 sm:size-20"
                      />
                    )}
                    <span
                      className={cn(
                        'relative rounded-full bg-card/90 px-3 py-1 text-xs font-semibold sm:text-sm',
                        styles.text,
                      )}
                    >
                      {localized(product, 'name', locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      <Reveal>
        <ProgramsSection programs={programs} />
      </Reveal>

      <DotWave />

      {/* ليه ديجيتال */}
      <Reveal>
        <section aria-labelledby="benefits-title" className="py-12 lg:py-16">
          <Container>
            <SectionHeading id="benefits-title" title={t('benefitsTitle')} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {BENEFITS.map((benefit) => (
                <li key={benefit.key} className="rounded-2xl border border-border bg-card p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-mist text-primary">
                    <benefit.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                    {t(`benefits.${benefit.key}.title`)}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{t(`benefits.${benefit.key}.body`)}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </Reveal>

      {/* سجّل اهتمامك: الفورم + هيحصل إيه بعد كده */}
      <section
        id="interest"
        aria-labelledby="interest-steps-title"
        className="scroll-mt-24 bg-mist/50 py-12 lg:py-16"
      >
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2
              id="interest-steps-title"
              className="font-heading text-3xl font-bold text-ink sm:text-4xl"
            >
              {t('nextTitle')}
            </h2>
            <p className="mt-2 text-muted-foreground">{t('nextSubtitle')}</p>
            <div className="mt-6">
              <DottedSteps
                steps={NEXT_STEPS.map((key) => ({
                  id: key,
                  title: t(`next.${key}.title`),
                  body: t(`next.${key}.body`),
                }))}
              />
            </div>
          </div>
          <LeadForm
            landingPage="/digital"
            idPrefix="digital"
            title={t('formTitle')}
            subtitle={t('formSubtitle')}
            submitLabel={t('formSubmit')}
            interest={
              products.length > 0
                ? {
                    legend: t('interestLegend'),
                    options: products.map((product) => ({
                      value: product.slug,
                      label: localized(product, 'name', locale),
                    })),
                  }
                : undefined
            }
          />
        </Container>
      </section>
    </>
  );
}
