import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { getDoctors } from '@/api/public/doctors';
import { getService, getServices } from '@/api/public/services';
import { BookingBanner } from '@/components/shared/booking-banner';
import { Container } from '@/components/shared/container';
import { DoctorsGridSection } from '@/components/shared/doctors-grid-section';
import { DotWave } from '@/components/shared/dot-wave';
import { FaqSection } from '@/components/shared/faq-section';
import { Reveal } from '@/components/shared/reveal';
import { SectionState } from '@/components/shared/section-state';
import { ServiceBookingCard } from './_components/service-booking-card';
import { ServiceDetails } from './_components/service-details';
import { ServiceHero } from './_components/service-hero';

/**
 * الخدمات بتتبني وقت الـBuild من /public/services. خدمة جديدة من الداشبورد
 * بتتبني أول ما حد يفتحها (dynamicParams الافتراضي)، ولو مش موجودة 404.
 */
export async function generateStaticParams() {
  const services = await getServices();
  return services.ok ? services.data.map((service) => ({ slug: service.slug })) : [];
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getService(slug);
  if (!result.ok) return {};
  const t = await getTranslations('servicePage');
  const name = localized(result.data, 'name', locale);
  return {
    title: name,
    description: t('metaDescription', { name, summary: localized(result.data, 'summary', locale) }),
  };
}

/**
 * صفحة الخدمة W-04. مفيش صورة تصميم ليها: مبنية بنفس قطع A4 (الـHero والأسئلة والشريط)
 * وكارت الحجز زي ملخص A6 (DEC-32).
 */
export default async function ServicePage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { slug } = await params;
  const [service, doctors, branches] = await Promise.all([
    getService(slug),
    getDoctors(),
    getBranches(),
  ]);

  if (!service.ok) {
    if (service.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={service.error} />
      </Container>
    );
  }

  const t = await getTranslations('servicePage');

  return (
    <>
      <ServiceHero service={service.data} />
      <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12 lg:py-14">
        {/* على الموبايل كارت الحجز قبل التفاصيل، عشان السعر والزرار يبانوا على طول */}
        <div className="lg:order-last">
          <ServiceBookingCard service={service.data} branches={branches} />
        </div>
        <ServiceDetails service={service.data} />
      </Container>
      <DotWave />
      <Reveal>
        <DoctorsGridSection
          title={t('doctors')}
          doctors={doctors}
          branches={branches}
          specialty={service.data.specialty}
        />
      </Reveal>
      <Reveal>
        <FaqSection faqs={service.data.faqs} />
      </Reveal>
      <BookingBanner
        title={t('bannerTitle')}
        cta={t('bookCta')}
        bookQuery={{ service: service.data.slug }}
      />
    </>
  );
}
