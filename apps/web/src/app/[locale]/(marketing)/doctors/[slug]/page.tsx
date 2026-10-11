import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { GraduationCap, Languages } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { getDoctor, getDoctors } from '@/api/public/doctors';
import { getServices } from '@/api/public/services';
import { BookingBanner } from '@/components/shared/booking-banner';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { SectionState } from '@/components/shared/section-state';
import { ServiceList } from '@/components/shared/service-list';
import { DoctorBookingCard } from './_components/doctor-booking-card';
import { JsonLd } from '@/components/shared/json-ld';
import { env } from '@/lib/env';
import { absoluteUrl, SCHEMA_SPECIALTY } from '@/lib/seo';
import { DoctorProfileHero } from './_components/doctor-profile-hero';

// الأطباء بيتبنوا وقت الـBuild، والدكتور الجديد من الداشبورد بيتبني أول ما حد يفتحه (زي الخدمات — DEC-32)
export async function generateStaticParams() {
  const doctors = await getDoctors();
  return doctors.ok ? doctors.data.map((doctor) => ({ slug: doctor.slug })) : [];
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/doctors/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getDoctor(slug);
  if (!result.ok) return {};
  const t = await getTranslations('doctorProfile');
  const name = localized(result.data, 'name', locale);
  return {
    title: name,
    description: t('metaDescription', { name, title: localized(result.data, 'title', locale) }),
  };
}

/**
 * بروفايل الطبيب W-05 (A5 اليمين). الدكتور لو فشل = 404 أو رسالة.
 * الخدمات والفروع لو فشلوا، القسم بتاعهم بس اللي بيستخبى.
 */
export default async function DoctorPage({ params }: PageProps<'/[locale]/doctors/[slug]'>) {
  const { slug } = await params;
  const [doctor, branches, services] = await Promise.all([
    getDoctor(slug),
    getBranches(),
    getServices(),
  ]);

  if (!doctor.ok) {
    if (doctor.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={doctor.error} />
      </Container>
    );
  }

  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('doctorProfile');
  const name = localized(doctor.data, 'name', locale);
  const doctorServices = services.ok
    ? services.data.filter((service) => doctor.data.service_slugs.includes(service.slug))
    : [];
  const education = locale === 'ar' ? doctor.data.education_ar : doctor.data.education_en;
  const languages = locale === 'ar' ? doctor.data.languages_ar : doctor.data.languages_en;

  const doctorBranches = branches.ok
    ? branches.data.filter((item) => doctor.data.branch_ids.includes(item.id))
    : [];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Physician',
          name,
          url: absoluteUrl(locale, `/doctors/${doctor.data.slug}`),
          medicalSpecialty: SCHEMA_SPECIALTY[doctor.data.specialty],
          ...(doctor.data.photo_url && {
            image: new URL(doctor.data.photo_url, env.siteUrl).toString(),
          }),
          ...(languages.length > 0 && { knowsLanguage: languages }),
          worksFor: doctorBranches.map((item) => ({
            '@type': 'MedicalClinic',
            name: `Oxygen ${localized(item, 'name', locale)}`,
            url: absoluteUrl(locale, `/branches/${item.slug}`),
          })),
        }}
      />
      <DoctorProfileHero doctor={doctor.data} branches={branches.ok ? branches.data : []} />
      <DotWave className="mt-6" />
      <Container className="grid gap-10 pb-10 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12 lg:pb-14">
        {/* على الموبايل كارت الحجز قبل الخدمات (مراجعة A5) */}
        <div className="lg:order-last">
          <DoctorBookingCard doctor={doctor.data} />
        </div>

        <div className="space-y-10">
          {doctorServices.length > 0 && (
            <section aria-labelledby="doctor-services-title">
              <h2 id="doctor-services-title" className="font-heading text-2xl font-bold text-ink">
                {t('services')}
              </h2>
              <div className="mt-4">
                <ServiceList services={doctorServices} />
              </div>
            </section>
          )}

          {/* التعليم واللغات بيظهروا بس لو الداتا موجودة (مراجعة A5) */}
          {(education || languages.length > 0) && (
            <section aria-labelledby="doctor-about-title">
              <h2 id="doctor-about-title" className="font-heading text-2xl font-bold text-ink">
                {t('about', { name })}
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {education && (
                  <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
                    <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-sm text-muted-foreground">{t('education')}</dt>
                      <dd className="mt-1 font-medium text-ink">{education}</dd>
                    </div>
                  </div>
                )}
                {languages.length > 0 && (
                  <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
                    <Languages className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-sm text-muted-foreground">{t('languages')}</dt>
                      <dd className="mt-1 font-medium text-ink">{languages.join(' · ')}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>
      </Container>
      <BookingBanner
        title={t('bannerTitle')}
        cta={t('bookWith', { name })}
        bookQuery={{ doctor: doctor.data.slug }}
      />
    </>
  );
}
