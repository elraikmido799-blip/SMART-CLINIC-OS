import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRight, CalendarCheck, Clock, MapPin, MessageCircle } from 'lucide-react';
import { formatTime, isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { LeadForm } from '@/components/shared/lead-form';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { whatsappUrl } from '@/lib/whatsapp';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contactPage');
  return { title: t('title'), description: t('metaDescription') };
}

/**
 * "تواصل" W-14. مفيش صورة تصميم (DEC-32).
 * الفورم الأول (هو الحاجة الأساسية هنا)، وجنبه الطرق التانية: واتساب · الحجز · الفروع باختصار.
 * التليفونات بتتضاف لما Oxygen يبعتوها (16 · 0.2) — مش هنحط أرقام وهمية (L-42).
 */
export default async function ContactPage() {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('contactPage');
  const tBranches = await getTranslations('branches');
  const tWhatsapp = await getTranslations('whatsapp');
  const branches = await getBranches();

  return (
    <section aria-labelledby="contact-title" className="py-10 lg:py-16">
      <Container>
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1 id="contact-title" className="font-heading text-4xl font-bold text-ink sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <LeadForm
            landingPage="/contact"
            idPrefix="contact"
            title={t('formTitle')}
            subtitle={t('formSubtitle')}
            submitLabel={t('send')}
            withMessage
          />

          <div className="space-y-4">
            {/* أسرع طريقة: واتساب */}
            <div className="rounded-2xl border border-border bg-mist p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <MessageCircle className="size-5 text-primary" aria-hidden />
                {t('whatsappTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('whatsappBody')}</p>
              <a
                href={whatsappUrl(tWhatsapp('defaultMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className={brandButton({ tone: 'primary', block: true, className: 'mt-4' })}
              >
                <MessageCircle aria-hidden />
                {tWhatsapp('cta')}
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <CalendarCheck className="size-5 text-primary" aria-hidden />
                {t('bookTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('bookBody')}</p>
              <Link
                href="/book"
                className={brandButton({ tone: 'outline', block: true, className: 'mt-4' })}
              >
                {t('bookCta')}
              </Link>
            </div>

            {/* الفروع باختصار: الاسم والمواعيد والاتجاهات، وكل فرع بيودّي لصفحته */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <MapPin className="size-5 text-primary" aria-hidden />
                {t('branchesTitle')}
              </h2>
              {!branches.ok ? (
                <SectionState state={branches.error} className="mt-4 py-6" />
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {branches.data.map((branch) => {
                    const name = localized(branch, 'name', locale);
                    return (
                      <li key={branch.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <Link
                            href={`/branches/${branch.slug}`}
                            className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-primary hover:underline"
                          >
                            {name}
                          </Link>
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="size-3.5 shrink-0" aria-hidden />
                            {tBranches('hours', {
                              opens: formatTime(branch.opens_at, locale),
                              closes: formatTime(branch.closes_at, locale),
                            })}
                          </p>
                        </div>
                        <a
                          href={branch.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          {tBranches('directions')}
                          <span className="sr-only"> — {name}</span>
                          <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
