import type { Specialty } from '@oxygen/config';
import type { PublicResult } from '@/api/public/fetch-public';
import type { PublicBranch, PublicDoctor } from '@/types/public';
import { Container } from './container';
import { DoctorCard } from './doctor-card';
import { RevealGroup, RevealItem } from './reveal-group';
import { SectionHeading } from './section-heading';
import { SectionState } from './section-state';

type DoctorsGridSectionProps = {
  title: string;
  doctors: PublicResult<PublicDoctor[]>;
  branches: PublicResult<PublicBranch[]>;
  specialty: Specialty;
};

/**
 * أطباء تخصص واحد (صفحة التخصص والخدمة). لو الأطباء فشلوا رسالة،
 * ولو التخصص ملوش أطباء لسه القسم مش بيظهر. لو الفروع فشلت الكروت من غير اسم الفرع.
 */
export function DoctorsGridSection({
  title,
  doctors,
  branches,
  specialty,
}: DoctorsGridSectionProps) {
  const list = doctors.ok ? doctors.data.filter((doctor) => doctor.specialty === specialty) : [];
  if (doctors.ok && list.length === 0) return null;

  return (
    <section aria-labelledby="doctors-grid-title" className="py-12 lg:py-16">
      <Container>
        <SectionHeading id="doctors-grid-title" title={title} />
        <div className="mt-8">
          {!doctors.ok ? (
            <SectionState state={doctors.error} />
          ) : (
            <RevealGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((doctor) => (
                <RevealItem key={doctor.id}>
                  <DoctorCard doctor={doctor} branches={branches.ok ? branches.data : []} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </Container>
    </section>
  );
}
