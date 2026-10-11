import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatTime, isLocale, localized } from '@oxygen/shared';
import { getBranch, getBranches } from '@/api/public/branches';
import { getDoctors } from '@/api/public/doctors';
import { getSpecialties } from '@/api/public/specialties';
import { BookingBanner } from '@/components/shared/booking-banner';
import { Container } from '@/components/shared/container';
import { DoctorsGridSection } from '@/components/shared/doctors-grid-section';
import { DotWave } from '@/components/shared/dot-wave';
import { Reveal } from '@/components/shared/reveal';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { SpecialtyCard } from '@/components/shared/specialty-card';
import { JsonLd } from '@/components/shared/json-ld';
import { absoluteUrl, openingHours, SCHEMA_SPECIALTY } from '@/lib/seo';
import { BranchHero } from './_components/branch-hero';

// الفروع بتتبني وقت الـBuild، والفرع الجديد من الداشبورد بيتبني أول ما حد يفتحه (DEC-32)
export async function generateStaticParams() {
  const branches = await getBranches();
  return branches.ok ? branches.data.map((branch) => ({ slug: branch.slug })) : [];
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/branches/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getBranch(slug);
  if (!result.ok) return {};
  const t = await getTranslations('branchPage');
  const tBranches = await getTranslations('branches');
  // العنوان اسم الفرع بس: الـtemplate بيزوّد "· Oxygen" (من غير "Oxygen New Cairo · Oxygen")
  return {
    title: localized(result.data, 'name', locale),
    description: t('metaDescription', {
      name: localized(result.data, 'name', locale),
      address: localized(result.data, 'address', locale),
      hours: tBranches('hours', {
        opens: formatTime(result.data.opens_at, locale),
        closes: formatTime(result.data.closes_at, locale),
      }),
    }),
  };
}

/**
 * صفحة الفرع W-06. مفيش صورة تصميم ليها: نفس قطع الصفحات اللي قبلها (DEC-32).
 * التخصصات والأطباء لو فشلوا، قسمهم بس اللي بيتأثر. الصور بتظهر لما Oxygen يرفعوها.
 */
export default async function BranchPage({ params }: PageProps<'/[locale]/branches/[slug]'>) {
  const { slug } = await params;
  const [branch, specialties, doctors, branches] = await Promise.all([
    getBranch(slug),
    getSpecialties(),
    getDoctors(),
    getBranches(),
  ]);

  if (!branch.ok) {
    if (branch.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={branch.error} />
      </Container>
    );
  }

  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('branchPage');
  const name = localized(branch.data, 'name', locale);
  const branchSpecialties = specialties.ok
    ? specialties.data.filter((item) => branch.data.specialties.includes(item.slug))
    : [];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MedicalClinic',
          name: `Oxygen ${name}`,
          url: absoluteUrl(locale, `/branches/${branch.data.slug}`),
          address: {
            '@type': 'PostalAddress',
            streetAddress: localized(branch.data, 'address', locale),
            addressCountry: 'EG',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: branch.data.latitude,
            longitude: branch.data.longitude,
          },
          ...(branch.data.phone && { telephone: branch.data.phone }),
          openingHours: openingHours(branch.data.opens_at, branch.data.closes_at),
          medicalSpecialty: branch.data.specialties.map((item) => SCHEMA_SPECIALTY[item]),
          hasMap: branch.data.maps_url,
        }}
      />
      <BranchHero branch={branch.data} />
      <DotWave className="mt-8" />

      {(!specialties.ok || branchSpecialties.length > 0) && (
        <Reveal>
          <section aria-labelledby="branch-specialties-title" className="py-12 lg:py-16">
            <Container>
              <SectionHeading id="branch-specialties-title" title={t('specialties')} />
              <div className="mt-8">
                {!specialties.ok ? (
                  <SectionState state={specialties.error} />
                ) : (
                  <RevealGroup className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    {branchSpecialties.map((specialty) => (
                      <RevealItem key={specialty.id} className="min-w-0">
                        <SpecialtyCard specialty={specialty} />
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
        <DoctorsGridSection
          title={t('doctors')}
          doctors={doctors}
          branches={branches}
          match={(doctor) => doctor.branch_ids.includes(branch.data.id)}
        />
      </Reveal>

      {branch.data.photos.length > 0 && (
        <Reveal>
          <section aria-labelledby="branch-photos-title" className="py-12 lg:py-16">
            <Container>
              <SectionHeading id="branch-photos-title" title={t('photos')} />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {branch.data.photos.map((photo) => (
                  <li
                    key={photo.url}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-mist"
                  >
                    <Image
                      src={photo.url}
                      alt={localized(photo, 'alt', locale)}
                      fill
                      sizes="(min-width: 992px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        </Reveal>
      )}

      <BookingBanner
        title={t('bannerTitle', { name })}
        cta={t('book')}
        bookQuery={{ branch: branch.data.slug }}
      />
    </>
  );
}
