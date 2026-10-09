import { getBranches } from '@/api/public/branches';
import { getHomeContent } from '@/api/public/content';
import { getDoctors } from '@/api/public/doctors';
import { getPrograms } from '@/api/public/programs';
import { getSpecialties } from '@/api/public/specialties';
import { DotWave } from '@/components/shared/dot-wave';
import { Reveal } from '@/components/shared/reveal';
import { AppPromo } from './_components/app-promo';
import { BranchesSection } from './_components/branches-section';
import { DoctorsSection } from './_components/doctors-section';
import { Hero } from './_components/hero';
import { JourneySection } from './_components/journey-section';
import { ProgramsSection } from './_components/programs-section';
import { SpecialtiesSection } from './_components/specialties-section';
import { TrustBar } from './_components/trust-bar';

/**
 * الصفحة الرئيسية W-01 (A1 · A2 · A3).
 * كل الداتا بتتجاب مع بعض على السيرفر، وكل قسم بيتعامل مع الخطأ أو الفاضي بتاعه لوحده،
 * فلو Endpoint واحد وقع الصفحة بتكمل.
 */
export default async function HomePage() {
  const [content, specialties, doctors, branches, programs] = await Promise.all([
    getHomeContent(),
    getSpecialties(),
    getDoctors(),
    getBranches(),
    getPrograms(),
  ]);

  return (
    <>
      <Hero content={content} specialties={specialties} branches={branches} />
      <TrustBar content={content} />
      <DotWave className="-mt-4 sm:-mt-6" />
      <Reveal>
        <SpecialtiesSection specialties={specialties} />
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
