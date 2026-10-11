import { getLocale } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { getHomeContent } from '@/api/public/content';
import { getDoctors } from '@/api/public/doctors';
import { getOffers } from '@/api/public/offers';
import { getPrograms } from '@/api/public/programs';
import { getSpecialties } from '@/api/public/specialties';
import { DotWave } from '@/components/shared/dot-wave';
import { JsonLd } from '@/components/shared/json-ld';
import { Reveal } from '@/components/shared/reveal';
import { env } from '@/lib/env';
import { absoluteUrl, SCHEMA_SPECIALTY } from '@/lib/seo';
import { AppPromo } from './_components/app-promo';
import { BranchesSection } from './_components/branches-section';
import { DoctorsSection } from './_components/doctors-section';
import { Hero } from './_components/hero';
import { OffersStrip } from './_components/offers-strip';
import { JourneySection } from '@/components/shared/journey-section';
import { ProgramsSection } from '@/components/shared/programs-section';
import { SpecialtiesSection } from './_components/specialties-section';
import { TrustBar } from '@/components/shared/trust-bar';

/**
 * الصفحة الرئيسية W-01 (A1 · A2 · A3).
 * كل الداتا بتتجاب مع بعض على السيرفر، وكل قسم بيتعامل مع الخطأ أو الفاضي بتاعه لوحده،
 * فلو Endpoint واحد وقع الصفحة بتكمل.
 */
export default async function HomePage() {
  const [content, specialties, doctors, branches, programs, offers] = await Promise.all([
    getHomeContent(),
    getSpecialties(),
    getDoctors(),
    getBranches(),
    getPrograms(),
    getOffers(),
  ]);

  const locale = await getLocale();
  if (!isLocale(locale)) return null;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MedicalOrganization',
          name: 'Oxygen',
          url: absoluteUrl(locale),
          logo: new URL('/logo.png', env.siteUrl).toString(),
          medicalSpecialty: Object.values(SCHEMA_SPECIALTY),
          ...(branches.ok && {
            department: branches.data.map((branch) => ({
              '@type': 'MedicalClinic',
              name: `Oxygen ${localized(branch, 'name', locale)}`,
              url: absoluteUrl(locale, `/branches/${branch.slug}`),
              geo: {
                '@type': 'GeoCoordinates',
                latitude: branch.latitude,
                longitude: branch.longitude,
              },
            })),
          }),
        }}
      />
      <Hero content={content} specialties={specialties} branches={branches} />
      <TrustBar content={content} />
      <DotWave className="-mt-4 sm:-mt-6" />
      <Reveal>
        <SpecialtiesSection specialties={specialties} />
      </Reveal>
      <Reveal>
        <OffersStrip offers={offers} />
      </Reveal>
      <Reveal>
        <JourneySection />
      </Reveal>
      <DotWave />
      <Reveal>
        <ProgramsSection programs={programs} />
      </Reveal>
      <Reveal>
        <DoctorsSection doctors={doctors} branches={branches} />
      </Reveal>
      <DotWave />
      <Reveal>
        <BranchesSection branches={branches} />
      </Reveal>
      <AppPromo />
    </>
  );
}
