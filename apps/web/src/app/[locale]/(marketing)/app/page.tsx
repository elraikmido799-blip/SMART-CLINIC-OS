import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import {
  BellRing,
  CalendarCheck,
  Dumbbell,
  FileHeart,
  FolderOpen,
  ReceiptText,
  Smartphone,
} from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { LeadForm } from '@/components/shared/lead-form';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { Reveal } from '@/components/shared/reveal';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { StoreBadges } from '@/components/shared/store-badges';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('appPage');
  return { title: t('title'), description: t('metaDescription') };
}

// نفس أقسام بوابة المريض (المرحلة 6)، عشان الوعد هنا هو اللي الزائر هيلاقيه
const FEATURES = [
  { key: 'book', icon: CalendarCheck },
  { key: 'reminders', icon: BellRing },
  { key: 'passport', icon: FileHeart },
  { key: 'plans', icon: Dumbbell },
  { key: 'documents', icon: FolderOpen },
  { key: 'invoices', icon: ReceiptText },
] as const;

/**
 * تحميل التطبيق W-15. صورة 2.7 = صورة الموبايل بتاعة A2 (نفس اللي في الرئيسية).
 * التطبيق لسه مانزلش: بادجات "قريبًا" + فورم "بلّغني لما ينزل" (Lead) + البوابة على الويب دلوقتي.
 */
export default async function AppPage() {
  const t = await getTranslations('appPage');
  const tPromo = await getTranslations('appPromo');

  return (
    <>
      <section aria-labelledby="app-title" className="pt-4 lg:pt-6">
        <Container>
          <div className="relative grid items-center gap-8 overflow-hidden rounded-2xl bg-linear-to-r from-primary to-brand-to px-6 pt-10 text-white sm:px-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:pt-14 rtl:bg-linear-to-l">
            <div className="text-center lg:pb-14 lg:text-start">
              <div className="flex justify-center lg:justify-start">
                <PageBreadcrumb items={[{ label: t('title') }]} onDark />
              </div>
              <h1
                id="app-title"
                className="mt-5 font-heading text-4xl leading-tight font-bold sm:text-5xl"
              >
                {t('heading')}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90 lg:mx-0">{t('subtitle')}</p>
              <div className="mt-7 flex flex-col items-center gap-6 lg:items-start">
                <StoreBadges />
                <a href="#notify" className={brandButton({ tone: 'onDark', size: 'lg' })}>
                  <BellRing aria-hidden />
                  {t('notifyCta')}
                </a>
              </div>
            </div>
            <div className="mx-auto w-56 self-end sm:w-64 lg:w-72">
              <Image
                src="/images/home/app-phone.png"
                alt={tPromo('phoneAlt')}
                width={1086}
                height={1448}
                sizes="(min-width: 992px) 288px, 256px"
                preload
                className="h-auto w-full"
              />
            </div>
          </div>
        </Container>
      </section>

      <Reveal>
        <section aria-labelledby="features-title" className="py-12 lg:py-16">
          <Container>
            <SectionHeading id="features-title" title={t('featuresTitle')} />
            <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {FEATURES.map((feature) => (
                <RevealItem key={feature.key}>
                  <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mist text-primary">
                      <feature.icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-ink">
                        {t(`features.${feature.key}.title`)}
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        {t(`features.${feature.key}.body`)}
                      </p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </section>
      </Reveal>

      {/* بلّغني لما ينزل + البوابة شغالة دلوقتي على الويب */}
      <section
        id="notify"
        aria-labelledby="portal-title"
        className="scroll-mt-24 bg-mist/50 py-12 lg:py-16"
      >
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="text-center lg:text-start">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-card text-primary lg:mx-0">
              <Smartphone className="size-7" strokeWidth={1.5} aria-hidden />
            </span>
            <h2
              id="portal-title"
              className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl"
            >
              {t('portalTitle')}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">{t('portalBody')}</p>
            <Link
              href="/login"
              className={brandButton({ tone: 'outline', size: 'lg', className: 'mt-6' })}
            >
              {t('portalCta')}
            </Link>
          </div>
          <LeadForm
            landingPage="/app"
            idPrefix="app-notify"
            title={t('formTitle')}
            subtitle={t('formSubtitle')}
            submitLabel={t('formSubmit')}
          />
        </Container>
      </section>
    </>
  );
}
