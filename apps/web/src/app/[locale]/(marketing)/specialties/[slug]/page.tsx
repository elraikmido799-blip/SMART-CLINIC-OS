import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { getDoctors } from '@/api/public/doctors';
import { getPrograms } from '@/api/public/programs';
import { getSpecialty } from '@/api/public/specialties';
import { Container } from '@/components/shared/container';
import { DoctorCard } from '@/components/shared/doctor-card';
import { DotWave } from '@/components/shared/dot-wave';
import { Reveal } from '@/components/shared/reveal';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { BookingBanner } from './_components/booking-banner';
import { ConditionsSection } from './_components/conditions-section';
import { FaqSection } from './_components/faq-section';
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
  const specialtyDoctors = doctors.ok
    ? doctors.data.filter((doctor) => doctor.specialty === slug)
    : [];

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

      {/* الأطباء: لو فشلوا رسالة، ولو التخصص ملوش أطباء لسه القسم مش بيظهر */}
      {(!doctors.ok || specialtyDoctors.length > 0) && (
        <Reveal>
          <section aria-labelledby="specialty-doctors-title" className="py-12 lg:py-16">
            <Container>
              <SectionHeading id="specialty-doctors-title" title={t('doctorsTitle')} />
              <div className="mt-8">
                {!doctors.ok ? (
                  <SectionState state={doctors.error} />
                ) : (
                  <RevealGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {specialtyDoctors.map((doctor) => (
                      <RevealItem key={doctor.id}>
                        <DoctorCard doctor={doctor} branches={branches.ok ? branches.data : []} />
                      </RevealItem>
                    ))}
                  </RevealGroup>
                )}
              </div>
            </Container>
          </section>
        </Reveal>
      )}

      <Reveal>
        <FaqSection faqs={specialty.data.faqs} />
      </Reveal>
      <BookingBanner specialty={slug} />
    </>
  );
}
