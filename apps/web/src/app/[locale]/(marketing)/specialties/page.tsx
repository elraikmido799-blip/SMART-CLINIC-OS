import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSpecialties } from '@/api/public/specialties';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionState } from '@/components/shared/section-state';
import { SpecialtyCard } from '@/components/shared/specialty-card';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('specialtiesPage');
  return { title: t('title'), description: t('metaDescription') };
}

// صفحة التخصصات W-03: نفس مربعات الرئيسية، وكل واحد بيودّي لصفحة التخصص
export default async function SpecialtiesPage() {
  const t = await getTranslations('specialtiesPage');
  const specialties = await getSpecialties();

  return (
    <section aria-labelledby="specialties-page-title" className="py-10 lg:py-16">
      <Container>
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1
            id="specialties-page-title"
            className="font-heading text-4xl font-bold text-ink sm:text-5xl"
          >
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mt-10">
          {!specialties.ok ? (
            <SectionState state={specialties.error} />
          ) : specialties.data.length === 0 ? (
            <SectionState state="empty" />
          ) : (
            <RevealGroup className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {specialties.data.map((specialty) => (
                <RevealItem key={specialty.id} className="min-w-0">
                  <SpecialtyCard specialty={specialty} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </Container>
    </section>
  );
}
