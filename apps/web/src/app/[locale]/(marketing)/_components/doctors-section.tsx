import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import type { PublicResult } from '@/api/public/fetch-public';
import { Container } from '@/components/shared/container';
import { DoctorCard } from '@/components/shared/doctor-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import type { PublicBranch, PublicDoctor } from '@/types/public';

// الرئيسية بتعرض أول 4 بس، والباقي في صفحة الأطباء
const HOME_DOCTORS_LIMIT = 4;

type DoctorsSectionProps = {
  doctors: PublicResult<PublicDoctor[]>;
  branches: PublicResult<PublicBranch[]>;
};

export async function DoctorsSection({ doctors, branches }: DoctorsSectionProps) {
  const t = await getTranslations('doctors');
  // لو الفروع فشلت، الكروت بتظهر من غير اسم الفرع
  const branchList = branches.ok ? branches.data : [];

  return (
    <section aria-labelledby="doctors-title" className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="doctors-title" title={t('title')} subtitle={t('subtitle')} />
          <Link
            href="/doctors"
            className="inline-flex h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t('viewAll')}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        <div className="mt-8">
          {!doctors.ok ? (
            <SectionState state={doctors.error} />
          ) : doctors.data.length === 0 ? (
            <SectionState state="empty" />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {doctors.data.slice(0, HOME_DOCTORS_LIMIT).map((doctor) => (
                <li key={doctor.id}>
                  <DoctorCard doctor={doctor} branches={branchList} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
