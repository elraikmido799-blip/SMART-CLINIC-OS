import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  Info,
  Link2,
  MessageCircle,
  Video,
} from 'lucide-react';
import { formatMoney, isLocale } from '@oxygen/shared';
import { getOnlineConsultation } from '@/api/public/content';
import { BookingBanner } from '@/components/shared/booking-banner';
import { brandButton, specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { FaqSection } from '@/components/shared/faq-section';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { Reveal } from '@/components/shared/reveal';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { whatsappUrl } from '@/lib/whatsapp';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('onlineConsultationPage');
  return { title: t('title'), description: t('metaDescription') };
}

// الخطوات التلاتة: احجز وادفع ← اللينك يوصلك ← ادخل المكالمة
const STEPS = [
  { key: 'book', icon: CalendarCheck },
  { key: 'link', icon: Link2 },
  { key: 'call', icon: Video },
] as const;

const REQUIREMENTS = ['device', 'internet', 'place', 'reports'] as const;

// الحجز الأونلاين بيفتح الـWizard على "أونلاين" (من غير خطوة الفرع) — 16 · 5.1
const ONLINE_QUERY = { mode: 'online' };

/**
 * الاستشارة الأونلاين W-08 (WEB-06: حجز + دفع + لينك فيديو). مفيش صورة تصميم (DEC-32)، وصورة 2.5 لسه:
 * لحد ما تيجي، رمز Oxygen في الـHero. السعر والمدة لكل تخصص من الـAPI، والكارت كله بيفتح الحجز بالتخصص.
 */
export default async function OnlineConsultationPage() {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('onlineConsultationPage');
  const tSpecialty = await getTranslations('specialtyNames');
  const tWhatsapp = await getTranslations('whatsapp');
  const content = await getOnlineConsultation();

  const prices = content.ok ? content.data.specialties.map((item) => item.price_minor) : [];
  const fromPrice =
    content.ok && prices.length > 0
      ? formatMoney(Math.min(...prices), content.data.currency, locale)
      : null;

  return (
    <>
      <section aria-labelledby="online-title" className="pt-4 lg:pt-6">
        <Container>
          <div className="grid items-center gap-8 overflow-hidden rounded-2xl border border-border bg-mist px-5 py-8 text-center sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:py-12 lg:text-start">
            <div>
              <div className="flex justify-center lg:justify-start">
                <PageBreadcrumb items={[{ label: t('title') }]} />
              </div>
              <p className="mt-5 inline-flex h-9 items-center gap-2 rounded-full border border-primary/30 bg-card px-4 text-sm font-semibold text-primary">
                <Video className="size-4" aria-hidden />
                {t('badge')}
              </p>
              <h1
                id="online-title"
                className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl"
              >
                {t('heading')}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground lg:mx-0">
                {t('subtitle')}
              </p>
              {fromPrice && (
                <p className="mt-4 font-semibold text-ink">
                  {t('priceFrom', { price: fromPrice })}
                </p>
              )}
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href={{ pathname: '/book', query: ONLINE_QUERY }}
                  className={brandButton({ tone: 'gold', size: 'lg' })}
                >
                  {t('cta')}
                </Link>
                <a
                  href={whatsappUrl(t('whatsappMessage'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={brandButton({ tone: 'outline', size: 'lg' })}
                >
                  <MessageCircle aria-hidden />
                  {tWhatsapp('cta')}
                </a>
              </div>
            </div>
            {content.ok && content.data.image_url ? (
              <Image
                src={content.data.image_url}
                alt=""
                width={1536}
                height={1024}
                sizes="(min-width: 992px) 36vw, 90vw"
                preload
                className="mx-auto h-auto w-full max-w-md rounded-2xl"
              />
            ) : (
              <div className="relative order-first mx-auto lg:order-none">
                <Image
                  src="/images/shared/logo-symbol.png"
                  alt=""
                  width={160}
                  height={160}
                  className="size-28 sm:size-36 lg:size-44"
                />
                <span className="absolute -end-2 -bottom-2 grid size-12 place-items-center rounded-full border-4 border-mist bg-primary text-primary-foreground lg:size-14">
                  <Video className="size-5 lg:size-6" aria-hidden />
                </span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* بتشتغل إزاي: 3 خطوات بس */}
      <Reveal>
        <section aria-labelledby="how-title" className="py-12 lg:py-16">
          <Container>
            <SectionHeading id="how-title" title={t('howTitle')} />
            <ol className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
              {STEPS.map((step, index) => (
                <li
                  key={step.key}
                  className="relative rounded-2xl border border-border bg-card p-6 text-center md:text-start"
                >
                  <div className="flex items-center justify-center gap-3 md:justify-start">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-dotted border-primary text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <step.icon className="size-6 text-primary" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                    {t(`steps.${step.key}.title`)}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{t(`steps.${step.key}.body`)}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      </Reveal>

      {/* التخصصات المتاحة: السعر والمدة، والكارت كله بيفتح الحجز بالتخصص */}
      <section aria-labelledby="specialties-title" className="bg-mist/50 py-12 lg:py-16">
        <Container>
          <SectionHeading
            id="specialties-title"
            title={t('specialtiesTitle')}
            subtitle={t('specialtiesSubtitle')}
          />
          {!content.ok ? (
            <SectionState state={content.error} className="mt-8" />
          ) : (
            <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {content.data.specialties.map((item) => {
                const styles = specialtyStyles[item.specialty];
                const name = tSpecialty(item.specialty);
                return (
                  <RevealItem key={item.specialty}>
                    <article
                      className={cn(
                        'group relative flex h-full flex-col rounded-2xl border p-5 transition-shadow hover:shadow-md has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50',
                        styles.tint,
                        styles.border,
                      )}
                    >
                      <Image
                        src={specialtyIcon(item.specialty)}
                        alt=""
                        width={64}
                        height={64}
                        className="size-14"
                      />
                      <h3 className="mt-3 font-heading text-xl font-bold text-ink">{name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" aria-hidden />
                        {t('minutes', { minutes: item.duration_minutes })}
                      </p>
                      <p className="mt-4 font-heading text-2xl font-bold text-ink">
                        {formatMoney(item.price_minor, content.data.currency, locale)}
                      </p>
                      <Link
                        href={{
                          pathname: '/book',
                          query: { ...ONLINE_QUERY, specialty: item.specialty },
                        }}
                        className={cn(
                          'mt-auto inline-flex min-h-11 items-center gap-1 pt-4 text-sm font-semibold focus-visible:outline-none',
                          styles.text,
                          'after:absolute after:inset-0 after:rounded-2xl',
                        )}
                      >
                        {t('bookSpecialty')}
                        <span className="sr-only"> — {name}</span>
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </article>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          )}
        </Container>
      </section>

      {/* محتاج إيه + مش للطوارئ */}
      <Reveal>
        <section aria-labelledby="needs-title" className="py-12 lg:py-16">
          <Container className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
            <div>
              <h2 id="needs-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                {t('needsTitle')}
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {REQUIREMENTS.map((key) => (
                  <li
                    key={key}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-ink"
                  >
                    <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    {t(`needs.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="flex gap-3 rounded-2xl bg-mist p-5 text-ink">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <span>
                  <strong className="block font-semibold">{t('inPersonTitle')}</strong>
                  {t('inPersonBody')}
                </span>
              </p>
              <p
                role="note"
                className="flex gap-3 rounded-2xl border border-destructive/30 bg-card p-5 text-ink"
              >
                <Info className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
                <span>
                  <strong className="block font-semibold">{t('emergencyTitle')}</strong>
                  {t('emergencyBody')}
                </span>
              </p>
            </div>
          </Container>
        </section>
      </Reveal>

      {content.ok && content.data.faqs.length > 0 && (
        <>
          <DotWave />
          <Reveal>
            <FaqSection faqs={content.data.faqs} />
          </Reveal>
        </>
      )}

      <BookingBanner title={t('bannerTitle')} cta={t('cta')} bookQuery={ONLINE_QUERY} />
    </>
  );
}
