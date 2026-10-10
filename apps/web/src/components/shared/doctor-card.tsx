import { getLocale, getTranslations } from 'next-intl/server';
import { BriefcaseMedical, MapPin } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { PublicBranch, PublicDoctor } from '@/types/public';
import { brandButton, specialtyStyles } from './brand';
import { ParticleRingImage } from './particle-ring-image';

type DoctorCardProps = {
  doctor: PublicDoctor;
  // عشان نكتب اسم الفرع. الفروع اللي مش موجودة بتتشال
  branches: PublicBranch[];
  // row: الصورة جنب الكلام (A2 · A4) · stacked: الصورة فوق والكلام في النص (A5)
  layout?: 'row' | 'stacked';
};

// كارت الطبيب (A0 · A2 · A5): من غير نجوم ولا قلب. الاسم بيودّي للبروفايل، و"احجز" لصفحة الحجز
export async function DoctorCard({ doctor, branches, layout = 'row' }: DoctorCardProps) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('doctorCard');
  const tSpecialty = await getTranslations('specialtyNames');
  const name = localized(doctor, 'name', locale);
  const branchNames = branches
    .filter((branch) => doctor.branch_ids.includes(branch.id))
    .map((branch) => localized(branch, 'name', locale));
  const styles = specialtyStyles[doctor.specialty];
  const stacked = layout === 'stacked';

  return (
    <article
      className={cn(
        'flex h-full gap-4 rounded-lg border border-border bg-card p-4 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg',
        stacked ? 'flex-col items-center p-5 text-center' : 'items-center',
      )}
    >
      <ParticleRingImage
        src={doctor.photo_url}
        alt={doctor.photo_url ? name : t('noPhoto', { name })}
        sizes={stacked ? '176px' : '128px'}
        className={cn('shrink-0', stacked ? 'w-40' : 'w-24 sm:w-28 xl:w-24')}
      />
      <div className={cn('min-w-0 flex-1', stacked && 'flex w-full flex-col items-center')}>
        <h3 className="font-semibold text-ink">
          <Link
            href={`/doctors/${doctor.slug}`}
            className="hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {name}
          </Link>
        </h3>
        <p className={cn('mt-1 flex items-center gap-2 text-sm font-medium', styles.text)}>
          <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
          {tSpecialty(doctor.specialty)}
        </p>
        <ul className={cn('mt-2 space-y-1 text-sm text-muted-foreground', stacked && 'flex-1')}>
          <li className="flex items-center gap-2">
            <BriefcaseMedical className="size-4 shrink-0" aria-hidden />
            {t('experience', { years: doctor.years_of_experience })}
          </li>
          {branchNames.length > 0 && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {branchNames.join(' · ')}
            </li>
          )}
        </ul>
        <Link
          href={{ pathname: '/book', query: { doctor: doctor.slug } }}
          className={cn(brandButton({ tone: 'primary', block: true }), stacked ? 'mt-4' : 'mt-3')}
          aria-label={t('bookWith', { name })}
        >
          {t('book')}
        </Link>
      </div>
    </article>
  );
}
