import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { getDoctors } from '@/api/public/doctors';
import { getPrograms } from '@/api/public/programs';
import { getSpecialty } from '@/api/public/specialties';
import { BookingBanner } from '@/components/shared/booking-banner';
import { Container } from '@/components/shared/container';
import { DoctorsGridSection } from '@/components/shared/doctors-grid-section';
import { DotWave } from '@/components/shared/dot-wave';
import { FaqSection } from '@/components/shared/faq-section';
import { Reveal } from '@/components/shared/reveal';
import { SectionState } from '@/components/shared/section-state';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { ConditionsSection } from './_components/conditions-section';
import { ServicesSection } from './_components/services-section';
import { SpecialtyHero } from './_components/specialty-hero';

// التخصصات الـ4 ثابتة (packages/config)، فأي slug تاني = 404 على طول
export const dynamicParams = false;

export function generateStaticParams() {
  return SPECIALTIES.map((slug) => ({ slug }));
}

const isSpecialty = (slug: string): slug is Specialty =>
  (SPECIALTIES as readonly string[]).includes(slug);

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/specialties/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSpecialty(slug)) return {};
  const result = await getSpecialty(slug);
  if (!result.ok) return {};
  const t = await getTranslations('specialtyPage');
  const name = localized(result.data, 'name', locale);
  return {
    title: name,
    description: t('metaDescription', { name, tagline: localized(result.data, 'tagline', locale) }),
  };
}

/**
 * صفحة التخصص W-03 (A4 · A8).
 * التخصص نفسه لو فشل = الصفحة كلها 404 أو رسالة خطأ. الأطباء والبرامج لو فشلوا، قسمهم بس اللي بيتأثر.
 */
export default async function SpecialtyPage({ params }: PageProps<'/[locale]/specialties/[slug]'>) {
  const { slug } = await params;
  if (!isSpecialty(slug)) notFound();

  const [specialty, doctors, branches, programs] = await Promise.all([
    getSpecialty(slug),
    getDoctors(),
    getBranches(),
    getPrograms(),
  ]);

  if (!specialty.ok) {
    if (specialty.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={specialty.error} />
      </Container>
    );
  }

  const t = await getTranslations('specialtyPage');
  return (
    <>
      <SpecialtyHero specialty={specialty.data} />
      <Reveal>
        <ConditionsSection specialty={specialty.data} />
      </Reveal>
      <DotWave />
      <Reveal>
        <ServicesSection specialty={specialty.data} programs={programs} />
      </Reveal>

      <Reveal>
        <DoctorsGridSection
          title={t('doctorsTitle')}
          doctors={doctors}
          branches={branches}
          match={(doctor) => doctor.specialty === slug}
        />
      </Reveal>
      <Reveal>
        <FaqSection faqs={specialty.data.faqs} />
      </Reveal>
      <BookingBanner
        title={t('bannerTitle')}
        cta={t('bookAssessment')}
        bookQuery={{ specialty: slug }}
      />
    </>
  );
}
