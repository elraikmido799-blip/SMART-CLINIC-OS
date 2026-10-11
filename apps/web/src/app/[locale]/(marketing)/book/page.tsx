import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getBranches } from '@/api/public/branches';
import { getOnlineConsultation } from '@/api/public/content';
import { getDoctors } from '@/api/public/doctors';
import { getProgram, getPrograms } from '@/api/public/programs';
import { getServices } from '@/api/public/services';
import { Container } from '@/components/shared/container';
import { SectionState } from '@/components/shared/section-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SECRET_SEVEN_SLUG } from '@/lib/programs';
import { BookingWizard } from './_components/booking-wizard';
import type { BookingCatalog } from './_components/catalog';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking');
  return { title: t('metaTitle'), description: t('metaDescription') };
}

/**
 * صفحة الحجز W-07 (16 · 5.1). الداتا الثابتة (الخدمات والفروع والأطباء والأسعار) بتتجاب هنا على السيرفر
 * وتتبعت للـWizard، والمواعيد بس من المتصفح. أي حاجة أساسية فشلت = رسالة بدل Wizard ناقص.
 */
export default async function BookPage() {
  const t = await getTranslations('booking');
  const [services, branches, doctors, online, programs, secretSeven] = await Promise.all([
    getServices(),
    getBranches(),
    getDoctors(),
    getOnlineConsultation(),
    getPrograms(),
    getProgram(SECRET_SEVEN_SLUG),
  ]);

  const failed = [services, branches, doctors].find((result) => !result.ok);

  return (
    <section aria-labelledby="book-title" className="py-8 lg:py-12">
      <Container>
        <h1 id="book-title" className="sr-only">
          {t('metaTitle')}
        </h1>
        {failed && !failed.ok ? (
          <SectionState state={failed.error} className="py-16" />
        ) : services.ok && branches.ok && doctors.ok ? (
          <Suspense fallback={<WizardSkeleton />}>
            <BookingWizard
              catalog={
                {
                  services: services.data,
                  branches: branches.data,
                  doctors: doctors.data,
                  online: online.ok ? online.data.specialties : [],
                  onlineCurrency: online.ok ? online.data.currency : 'EGP',
                  programs: [
                    ...(secretSeven.ok ? [secretSeven.data] : []),
                    ...(programs.ok ? programs.data : []),
                  ].map(({ slug, name_ar, name_en, specialty }) => ({
                    slug,
                    name_ar,
                    name_en,
                    specialty,
                  })),
                } satisfies BookingCatalog
              }
            />
          </Suspense>
        ) : null}
      </Container>
    </section>
  );
}

// الـWizard بيقرا الـURL في المتصفح، فلحد ما يحمّل: شكل الخطوات والكارتين
function WizardSkeleton() {
  return (
    <div aria-busy className="space-y-8">
      <Skeleton className="mx-auto h-14 w-full max-w-3xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
