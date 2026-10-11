import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { SearchX } from 'lucide-react';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { getDoctors } from '@/api/public/doctors';
import { brandButton, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { DoctorCard } from '@/components/shared/doctor-card';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { BranchFilter } from './_components/branch-filter';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('doctorsPage');
  return { title: t('title'), description: t('metaDescription') };
}

const isSpecialty = (value: unknown): value is Specialty =>
  typeof value === 'string' && (SPECIALTIES as readonly string[]).includes(value);

/**
 * صفحة الأطباء W-05 (A5 الشمال). الفلاتر في الـURL (?specialty= · ?branch=)، والفلترة على السيرفر
 * من نفس /public/doctors. قيمة غلط في الـURL بتتجاهل كأنها مش موجودة.
 */
export default async function DoctorsPage({ searchParams }: PageProps<'/[locale]/doctors'>) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('doctorsPage');
  const tSpecialty = await getTranslations('specialtyNames');
  const params = await searchParams;
  const [doctors, branches] = await Promise.all([getDoctors(), getBranches()]);

  const branchList = branches.ok ? branches.data : [];
  const specialty = isSpecialty(params.specialty) ? params.specialty : undefined;
  const branch = branchList.find((item) => item.slug === params.branch);
  const filtered = doctors.ok
    ? doctors.data.filter(
        (doctor) =>
          (!specialty || doctor.specialty === specialty) &&
          (!branch || doctor.branch_ids.includes(branch.id)),
      )
    : [];

  // لينك الشيب: بيغيّر التخصص ويسيب الفرع زي ما هو
  const chipHref = (value?: Specialty) => ({
    pathname: '/doctors',
    query: {
      ...(value && { specialty: value }),
      ...(branch && { branch: branch.slug }),
    },
  });

  return (
    <section aria-labelledby="doctors-page-title" className="py-10 lg:py-16">
      <Container>
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1
            id="doctors-page-title"
            className="font-heading text-4xl font-bold text-ink sm:text-5xl"
          >
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* الفلاتر */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <nav
            aria-label={t('filterLabel')}
            className="flex flex-wrap justify-center gap-2 lg:justify-start"
          >
            {[undefined, ...SPECIALTIES].map((value) => {
              const active = value === specialty;
              return (
                <Link
                  key={value ?? 'all'}
                  href={chipHref(value)}
                  scroll={false}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-ink hover:border-primary',
                  )}
                >
                  {value && (
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        active ? 'bg-white' : specialtyStyles[value].dot,
                      )}
                      aria-hidden
                    />
                  )}
                  {value ? tSpecialty(value) : t('all')}
                </Link>
              );
            })}
          </nav>
          <BranchFilter
            branches={branchList.map((item) => ({
              value: item.slug,
              label: localized(item, 'name', locale),
            }))}
            specialty={specialty}
            branch={branch?.slug}
          />
        </div>

        <div className="mt-8">
          {!doctors.ok ? (
            <SectionState state={doctors.error} />
          ) : doctors.data.length === 0 ? (
            <SectionState state="empty" />
          ) : filtered.length === 0 ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center"
            >
              <SearchX className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
              <p className="font-semibold text-ink">{t('noMatch')}</p>
              <Link href="/doctors" scroll={false} className={brandButton({ tone: 'outline' })}>
                {t('clearFilters')}
              </Link>
            </div>
          ) : (
            // الـkey بيتغير مع الفلتر، فالـList بتتعمل من جديد والكروت بتظهر تاني.
            // من غيره الكروت الجديدة بتفضل مستخبية، لأن "الظهور مع الـScroll" اشتغل مرة واحدة قبل كده (P-18)
            <RevealGroup
              key={`${specialty ?? 'all'}-${branch?.slug ?? 'all'}`}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((doctor) => (
                <RevealItem key={doctor.id}>
                  <DoctorCard doctor={doctor} branches={branchList} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </Container>
    </section>
  );
}
