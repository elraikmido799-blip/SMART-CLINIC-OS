import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPrograms } from '@/api/public/programs';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { JourneySection } from '@/components/shared/journey-section';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { ProgramsSection } from '@/components/shared/programs-section';
import { Reveal } from '@/components/shared/reveal';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('programsPage');
  return { title: t('title'), description: t('metaDescription') };
}

// صفحة البرامج W-09: Secret Seven الأول (البرنامج المميز)، وبعده البرامج الأونلاين — نفس أقسام الرئيسية (A2)
export default async function ProgramsPage() {
  const t = await getTranslations('programsPage');
  const programs = await getPrograms();

  return (
    <>
      <Container className="pt-10 lg:pt-16">
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">{t('title')}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
      </Container>
      <Reveal>
        <JourneySection />
      </Reveal>
      <DotWave />
      <Reveal>
        <ProgramsSection programs={programs} />
      </Reveal>
    </>
  );
}
