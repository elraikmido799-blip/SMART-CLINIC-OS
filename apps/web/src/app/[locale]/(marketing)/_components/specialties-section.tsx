import { getTranslations } from 'next-intl/server';
import type { PublicResult } from '@/api/public/fetch-public';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { SpecialtyCard } from '@/components/shared/specialty-card';
import type { PublicSpecialty } from '@/types/public';

export async function SpecialtiesSection({
  specialties,
}: {
  specialties: PublicResult<PublicSpecialty[]>;
}) {
  const t = await getTranslations('specialtiesSection');

  return (
    <section aria-labelledby="specialties-title" className="py-14 lg:py-20">
      <Container>
        <SectionHeading id="specialties-title" title={t('title')} subtitle={t('subtitle')} />
        <div className="mt-8">
          {!specialties.ok ? (
            <SectionState state={specialties.error} />
          ) : specialties.data.length === 0 ? (
            <SectionState state="empty" />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {specialties.data.map((specialty) => (
                <li key={specialty.id}>
                  <SpecialtyCard specialty={specialty} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
