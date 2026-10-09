import { getTranslations } from 'next-intl/server';
import type { PublicResult } from '@/api/public/fetch-public';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionState } from '@/components/shared/section-state';
import { SpecialtyCard } from '@/components/shared/specialty-card';
import type { PublicSpecialty } from '@/types/public';

// عمود واحد تحت 400px: أسامي زي Physiotherapy مش بتساع في نص شاشة 320
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
