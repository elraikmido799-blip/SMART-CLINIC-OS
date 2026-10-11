import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { CalendarClock, Check, TimerOff } from 'lucide-react';
import { formatDate, formatMoney, isLocale, localized } from '@oxygen/shared';
import { getOffer, getOffers } from '@/api/public/offers';
import { brandButton, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { FaqSection } from '@/components/shared/faq-section';
import { LeadForm } from '@/components/shared/lead-form';
import { ParticleRingImage } from '@/components/shared/particle-ring-image';
import { Reveal } from '@/components/shared/reveal';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// العرض بيخلص بالتاريخ، فالصفحة بتتبني تاني كل 5 دقايق حتى مع الـMocks (DEC-11)
export const revalidate = 300;

export async function generateStaticParams() {
  const offers = await getOffers();
  return offers.ok ? offers.data.map((offer) => ({ slug: offer.slug })) : [];
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/offers/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getOffer(slug);
  if (!result.ok) return {};
  return {
    title: localized(result.data, 'title', locale),
    description: localized(result.data, 'subtitle', locale),
    ...(result.data.image_url && { openGraph: { images: [result.data.image_url] } }),
  };
}

// النهارده بتوقيت مصر "YYYY-MM-DD" (en-CA بيكتب التاريخ بالشكل ده)
const todayInCairo = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());

/**
 * صفحة العرض W-12: Template واحد لأي حملة (بتيجي من الإعلانات، فمش في الـNavbar).
 * الفورم هو الزرار الأساسي (دهبي) جنب العرض. لما العرض يخلص: "العرض خلص" + تواصل/حجز بدل الفورم.
 * مفيش صورة تصميم (DEC-32).
 */
export default async function OfferPage({ params }: PageProps<'/[locale]/offers/[slug]'>) {
  const { slug } = await params;
  const offer = await getOffer(slug);

  if (!offer.ok) {
    if (offer.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={offer.error} />
      </Container>
    );
  }

  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('offerPage');
  const data = offer.data;
  const ar = locale === 'ar';
  const title = localized(data, 'title', locale);
  const benefits = ar ? data.benefits_ar : data.benefits_en;
  const terms = ar ? data.terms_ar : data.terms_en;
  const ended = data.ends_at !== null && data.ends_at < todayInCairo();
  const savingPercent = Math.round(
    (1 - data.price_after_minor / Math.max(data.price_before_minor, 1)) * 100,
  );
  const styles = data.specialty ? specialtyStyles[data.specialty] : null;

  return (
    <>
      <section aria-labelledby="offer-title" className="pt-6 pb-10 lg:pt-10 lg:pb-14">
        <Container className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-14">
          <div className="text-center lg:text-start">
            {data.image_url && (
              <ParticleRingImage
                src={data.image_url}
                alt=""
                sizes="240px"
                preload
                className="mx-auto mb-6 w-full max-w-60 lg:mx-0"
              />
            )}
            <p
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold',
                ended
                  ? 'border-border bg-card text-muted-foreground'
                  : styles
                    ? [styles.text, styles.border, styles.tint]
                    : 'border-primary/30 bg-mist text-primary',
              )}
            >
              {ended ? (
                <TimerOff className="size-4" aria-hidden />
              ) : (
                <CalendarClock className="size-4" aria-hidden />
              )}
              {ended
                ? t('ended')
                : data.ends_at
                  ? t('endsOn', { date: formatDate(data.ends_at, locale) })
                  : t('limited')}
            </p>
            <h1
              id="offer-title"
              className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl"
            >
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground lg:mx-0">
              {localized(data, 'subtitle', locale)}
            </p>

            {/* السعر: بعد كبير، وقبل عليه شرطة، ونسبة التوفير */}
            <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 lg:justify-start">
              <p className="font-heading text-4xl font-bold text-ink">
                <span className="sr-only">{t('priceNow')} </span>
                {formatMoney(data.price_after_minor, data.currency, locale)}
              </p>
              <p className="text-xl text-muted-foreground line-through">
                <span className="sr-only">{t('priceBefore')} </span>
                {formatMoney(data.price_before_minor, data.currency, locale)}
              </p>
              {savingPercent > 0 && (
                <p className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-primary">
                  {t('save', { percent: savingPercent })}
                </p>
              )}
            </div>

            {benefits.length > 0 && (
              <ul className="mx-auto mt-8 max-w-md space-y-3 text-start lg:mx-0">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-base text-ink">
                    <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            {ended ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center"
              >
                <TimerOff className="size-10 text-primary" strokeWidth={1.5} aria-hidden />
                <h2 className="font-heading text-2xl font-bold text-ink">{t('endedTitle')}</h2>
                <p className="text-muted-foreground">{t('endedBody')}</p>
                <div className="mt-2 grid w-full gap-3">
                  <Link href="/book" className={brandButton({ tone: 'primary', block: true })}>
                    {t('endedBook')}
                  </Link>
                  <Link href="/contact" className={brandButton({ tone: 'outline', block: true })}>
                    {t('endedContact')}
                  </Link>
                </div>
              </div>
            ) : (
              <LeadForm
                landingPage={`/offers/${data.slug}`}
                idPrefix="offer"
                title={t('formTitle')}
                subtitle={t('formSubtitle')}
                submitLabel={t('formSubmit')}
                tone="gold"
              />
            )}
          </div>
        </Container>
      </section>

      {terms.length > 0 && (
        <>
          <DotWave />
          <section aria-labelledby="terms-title" className="py-10">
            <Container className="max-w-3xl">
              <h2 id="terms-title" className="font-heading text-xl font-bold text-ink">
                {t('terms')}
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm text-muted-foreground marker:text-primary">
                {terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </Container>
          </section>
        </>
      )}
      <Reveal>
        <FaqSection faqs={data.faqs} />
      </Reveal>
    </>
  );
}
