import { getLocale, getTranslations } from 'next-intl/server';
import { CalendarDays, MapPin } from 'lucide-react';
import { formatWeekday, isLocale, localized } from '@oxygen/shared';
import { specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { ParticleRingImage } from '@/components/shared/particle-ring-image';
import { cn } from '@/lib/utils';
import type { PublicBranch, PublicDoctorDetail } from '@/types/public';

type DoctorProfileHeroProps = {
  doctor: PublicDoctorDetail;
  // لو الفروع فشلت، "متاح في" بيستخبى
  branches: PublicBranch[];
};

// رأس البروفايل (A5 اليمين): الصورة في حلقة النقط + الاسم واللقب والتخصص والنبذة + الفروع والأيام
export async function DoctorProfileHero({ doctor, branches }: DoctorProfileHeroProps) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('doctorProfile');
  const tNav = await getTranslations('nav');
  const tCard = await getTranslations('doctorCard');
  const tSpecialty = await getTranslations('specialtyNames');
  const name = localized(doctor, 'name', locale);
  const styles = specialtyStyles[doctor.specialty];
  const schedule = doctor.schedule.flatMap((entry) => {
    const branch = branches.find((item) => item.id === entry.branch_id);
    return branch ? [{ branch, days: entry.days }] : [];
  });

  return (
    <section aria-labelledby="doctor-name" className="pt-6 lg:pt-10">
      <Container className="grid items-center gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-14">
        <ParticleRingImage
          src={doctor.photo_url}
          alt={doctor.photo_url ? name : tCard('noPhoto', { name })}
          sizes="(min-width: 992px) 360px, 288px"
          preload
          className="mx-auto w-full max-w-72 lg:max-w-none"
          ringClassName="motion-safe:animate-breathe"
        />
        <div className="text-center lg:text-start">
          <div className="flex justify-center lg:justify-start">
            <PageBreadcrumb
              items={[{ label: tNav('doctors'), href: '/doctors' }, { label: name }]}
            />
          </div>
          <h1
            id="doctor-name"
            className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl"
          >
            {name}
          </h1>
          <p className="mt-2 text-xl text-muted-foreground">{localized(doctor, 'title', locale)}</p>
          <p
            className={cn(
              'mt-4 inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold',
              styles.text,
              styles.border,
              styles.tint,
            )}
          >
            <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
            {tSpecialty(doctor.specialty)}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink lg:mx-0">
            {localized(doctor, 'bio', locale)}
          </p>

          {schedule.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-muted-foreground">{t('availableAt')}</h2>
              <ul className="mt-2 flex flex-col items-center gap-3 lg:items-start">
                {schedule.map(({ branch, days }) => (
                  <li
                    key={branch.id}
                    className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-ink"
                  >
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <MapPin className="size-4 text-primary" aria-hidden />
                      {localized(branch, 'name', locale)}
                    </span>
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-4 text-primary" aria-hidden />
                      {days.map((day) => formatWeekday(day, locale, 'short')).join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
