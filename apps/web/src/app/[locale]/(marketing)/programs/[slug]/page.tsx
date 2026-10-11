import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Check, Info, MessageCircle, ReceiptText } from 'lucide-react';
import { formatMoney, isLocale, localized } from '@oxygen/shared';
import { getProgram, getPrograms } from '@/api/public/programs';
import { BookingBanner } from '@/components/shared/booking-banner';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { DottedSteps } from '@/components/shared/dotted-steps';
import { FaqSection } from '@/components/shared/faq-section';
import { Reveal } from '@/components/shared/reveal';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { whatsappUrl } from '@/lib/whatsapp';
import { SECRET_SEVEN_SLUG } from '@/lib/programs';
import { ProgramHero } from './_components/program-hero';

// البرامج الأونلاين من الـList + Secret Seven (مش في الـList). البرنامج الجديد بيتبني أول ما حد يفتحه (DEC-32)
export async function generateStaticParams() {
  const programs = await getPrograms();
  const slugs = programs.ok ? programs.data.map((program) => program.slug) : [];
  return [SECRET_SEVEN_SLUG, ...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/programs/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getProgram(slug);
  if (!result.ok) return {};
  const t = await getTranslations('programPage');
  const name = localized(result.data, 'name', locale);
  return {
    title: name,
    description: t('metaDescription', { name, summary: localized(result.data, 'summary', locale) }),
  };
}

/**
 * صفحة البرنامج W-09 (Secret Seven + البرامج الأونلاين). مفيش صورة تصميم: نفس قطع الصفحات اللي قبلها (DEC-32).
 * من غير وعود طبية: الخطة ومدتها بتتحدد بعد التقييم، وده مكتوب جنب زرار البداية.
 */
export default async function ProgramPage({ params }: PageProps<'/[locale]/programs/[slug]'>) {
  const { slug } = await params;
  const program = await getProgram(slug);

  if (!program.ok) {
    if (program.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={program.error} />
      </Container>
    );
  }

  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('programPage');
  const tWhatsapp = await getTranslations('whatsapp');
  const data = program.data;
  const isSignature = data.slug === SECRET_SEVEN_SLUG;
  const ar = locale === 'ar';
  const forWhom = ar ? data.for_whom_ar : data.for_whom_en;
  const cta = isSignature ? t('startCta') : t('joinCta');

  return (
    <>
      <ProgramHero program={data} />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12 lg:py-14">
        {/* كارت البداية: على الموبايل قبل التفاصيل، وSticky على الكمبيوتر */}
        <section
          aria-label={cta}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24 lg:order-last"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
              <ReceiptText className="size-5" aria-hidden />
            </span>
            <p className="font-semibold text-ink">
              {data.price_from_minor === null
                ? t('priceOnAssessment')
                : t('priceFrom', {
                    price: formatMoney(data.price_from_minor, data.currency, locale),
                  })}
            </p>
          </div>
          <Link
            href={{ pathname: '/book', query: { program: data.slug } }}
            className={brandButton({ tone: 'gold', size: 'lg', block: true, className: 'mt-5' })}
          >
            {cta}
          </Link>
          <a
            href={whatsappUrl(tWhatsapp('defaultMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            className={brandButton({ tone: 'outline', size: 'lg', block: true, className: 'mt-3' })}
          >
            <MessageCircle aria-hidden />
            {tWhatsapp('cta')}
          </a>
          <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {t('note')}
          </p>
        </section>

        <div className="space-y-10">
          {forWhom.length > 0 && (
            <section aria-labelledby="for-whom-title">
              <h2 id="for-whom-title" className="font-heading text-2xl font-bold text-ink">
                {t('forWhom')}
              </h2>
              <ul className="mt-4 space-y-3">
                {forWhom.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-ink">
                    <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.stages.length > 0 && (
            <section aria-labelledby="stages-title">
              <h2 id="stages-title" className="font-heading text-2xl font-bold text-ink">
                {isSignature ? t('stagesSignature') : t('stagesOnline')}
              </h2>
              <div className="mt-5">
                <DottedSteps
                  closing={isSignature}
                  steps={data.stages.map((stage) => {
                    const includes = ar ? stage.includes_ar : stage.includes_en;
                    return {
                      id: stage.id,
                      title: localized(stage, 'title', locale),
                      body: localized(stage, 'body', locale),
                      extra:
                        includes.length > 0 ? (
                          <ul aria-label={t('includes')} className="mt-2 flex flex-wrap gap-2">
                            {includes.map((item) => (
                              <li
                                key={item}
                                className="rounded-full bg-mist px-3 py-1 text-sm text-ink"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : undefined,
                    };
                  })}
                />
              </div>
            </section>
          )}
        </div>
      </Container>
      <DotWave />
      <Reveal>
        <FaqSection faqs={data.faqs} />
      </Reveal>
      <BookingBanner title={t('bannerTitle')} cta={cta} bookQuery={{ program: data.slug }} />
    </>
  );
}
