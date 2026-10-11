import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SPECIALTIES } from '@oxygen/config';
import { getOnlineConsultation } from '@/api/public/content';
import { getProgram } from '@/api/public/programs';
import { getSpecialty } from '@/api/public/specialties';
import { brandButton, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { FaqList } from '@/components/shared/faq-section';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { Link } from '@/i18n/navigation';
import { SECRET_SEVEN_SLUG } from '@/lib/programs';
import { cn } from '@/lib/utils';
import { whatsappUrl } from '@/lib/whatsapp';
import type { PublicFaq } from '@/types/public';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faqsPage');
  return { title: t('title'), description: t('metaDescription') };
}

type Group = { id: string; title: string; faqs: PublicFaq[]; href: string; dot?: string };

/**
 * الأسئلة الشائعة (لينك الـFooter — مراجعة آخر المرحلة 4، L-56).
 * مفيش Endpoint جديد: نفس أسئلة كل تخصص + الاستشارة الأونلاين + Secret Seven، متجمعة في صفحة واحدة.
 * أي سؤال بيتعدّل من الداشبورد في مكانه بيتعدّل هنا كمان. المجموعة اللي جاتلها خطأ أو فاضية مش بتظهر.
 */
export default async function FaqsPage() {
  const t = await getTranslations('faqsPage');
  const tSpecialty = await getTranslations('specialtyNames');
  const tWhatsapp = await getTranslations('whatsapp');
  const [specialties, online, secretSeven] = await Promise.all([
    Promise.all(SPECIALTIES.map((slug) => getSpecialty(slug))),
    getOnlineConsultation(),
    getProgram(SECRET_SEVEN_SLUG),
  ]);

  const groups: Group[] = [
    ...SPECIALTIES.map((slug, index) => {
      const result = specialties[index];
      return {
        id: slug,
        title: tSpecialty(slug),
        faqs: result.ok ? result.data.faqs : [],
        href: `/specialties/${slug}`,
        dot: specialtyStyles[slug].dot,
      };
    }),
    {
      id: 'online',
      title: t('online'),
      faqs: online.ok ? online.data.faqs : [],
      href: '/online-consultation',
    },
    {
      id: SECRET_SEVEN_SLUG,
      title: t('secretSeven'),
      faqs: secretSeven.ok ? secretSeven.data.faqs : [],
      href: `/programs/${SECRET_SEVEN_SLUG}`,
    },
  ].filter((group) => group.faqs.length > 0);

  return (
    <section aria-labelledby="faqs-title" className="py-10 lg:py-16">
      <Container className="max-w-4xl">
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mt-4 text-center lg:text-start">
          <h1 id="faqs-title" className="font-heading text-4xl font-bold text-ink sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* انط للمجموعة */}
        <nav
          aria-label={t('jump')}
          className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start"
        >
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#faq-${group.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-ink transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {group.dot && <span className={cn('size-2 rounded-full', group.dot)} aria-hidden />}
              {group.title}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-12">
          {groups.map((group) => (
            <section
              key={group.id}
              id={`faq-${group.id}`}
              aria-labelledby={`faq-${group.id}-title`}
              className="scroll-mt-24"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2
                  id={`faq-${group.id}-title`}
                  className="flex items-center gap-2 font-heading text-2xl font-bold text-ink"
                >
                  {group.dot && (
                    <span className={cn('size-2.5 rounded-full', group.dot)} aria-hidden />
                  )}
                  {group.title}
                </h2>
                <Link
                  href={group.href}
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {t('more')}
                  <span className="sr-only"> — {group.title}</span>
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                </Link>
              </div>
              <FaqList faqs={group.faqs} className="mt-4" />
            </section>
          ))}
        </div>

        {/* ملقيتش إجابتك؟ */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl bg-mist p-8 text-center sm:flex-row sm:justify-between sm:text-start">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">{t('stillTitle')}</h2>
            <p className="mt-1 text-muted-foreground">{t('stillBody')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl(tWhatsapp('defaultMessage'))}
              target="_blank"
              rel="noopener noreferrer"
              className={brandButton({ tone: 'primary' })}
            >
              <MessageCircle aria-hidden />
              {tWhatsapp('cta')}
            </a>
            <Link href="/contact" className={brandButton({ tone: 'outline' })}>
              {t('contact')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
