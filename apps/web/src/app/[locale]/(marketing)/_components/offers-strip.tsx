import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, CalendarClock, Tag } from 'lucide-react';
import { formatDate, formatMoney, isLocale, localized } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { Link } from '@/i18n/navigation';
import { isOfferActive, offerSavingPercent } from '@/lib/offers';
import { cn } from '@/lib/utils';
import type { PublicOffer } from '@/types/public';

const MAX_OFFERS = 4;

/**
 * شريط "عروض الشهر" (خطة 4.14 · L-55): كارت لكل عرض **شغال**، والكارت كله بيفتح صفحة العرض.
 * لو مفيش عرض شغال أو الـEndpoint وقع، القسم مش بيظهر خالص (العروض إضافة، مش أساس الصفحة).
 */
export async function OffersStrip({ offers }: { offers: PublicResult<PublicOffer[]> }) {
  const locale = await getLocale();
  if (!isLocale(locale) || !offers.ok) return null;
  const active = offers.data.filter(isOfferActive).slice(0, MAX_OFFERS);
  if (active.length === 0) return null;
  const t = await getTranslations('offersStrip');

  return (
    <section aria-labelledby="offers-strip-title" className="py-12 lg:py-16">
      <Container>
        <SectionHeading
          id="offers-strip-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <RevealGroup className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {active.map((offer) => {
            const styles = offer.specialty ? specialtyStyles[offer.specialty] : null;
            const title = localized(offer, 'title', locale);
            const saving = offerSavingPercent(offer);
            return (
              <RevealItem key={offer.id}>
                <article className="group relative grid h-full overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 sm:grid-cols-[180px_1fr]">
                  <div
                    className={cn(
                      'relative grid min-h-36 place-items-center',
                      styles ? styles.tint : 'bg-mist',
                    )}
                  >
                    {offer.image_url ? (
                      <Image
                        src={offer.image_url}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 180px, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={
                          offer.specialty
                            ? specialtyIcon(offer.specialty)
                            : '/images/shared/logo-symbol.png'
                        }
                        alt=""
                        width={96}
                        height={96}
                        className="size-20"
                      />
                    )}
                    {saving > 0 && (
                      <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
                        <Tag className="size-3.5" aria-hidden />
                        {t.rich('save', {
                          percent: saving,
                          num: (chunks) => <bdi dir="ltr">{chunks}</bdi>,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col p-5">
                    {offer.ends_at && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarClock className="size-4" aria-hidden />
                        {t('endsOn', { date: formatDate(offer.ends_at, locale) })}
                      </p>
                    )}
                    <h3 className="mt-2 font-heading text-xl font-bold text-ink">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {localized(offer, 'subtitle', locale)}
                    </p>
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                      <span className="font-heading text-2xl font-bold text-ink">
                        <span className="sr-only">{t('priceNow')} </span>
                        {formatMoney(offer.price_after_minor, offer.currency, locale)}
                      </span>
                      <span className="text-muted-foreground line-through">
                        <span className="sr-only">{t('priceBefore')} </span>
                        {formatMoney(offer.price_before_minor, offer.currency, locale)}
                      </span>
                    </p>
                    <Link
                      href={`/offers/${offer.slug}`}
                      className="mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-sm font-semibold text-primary after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
                    >
                      {t('cta')}
                      <span className="sr-only"> — {title}</span>
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
