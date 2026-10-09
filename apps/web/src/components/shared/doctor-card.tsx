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
};

// كارت الطبيب (A0 · A2): من غير نجوم ولا قلب
export async function DoctorCard({ doctor, branches }: DoctorCardProps) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('doctorCard');
  const tSpecialty = await getTranslations('specialtyNames');
  const name = localized(doctor, 'name', locale);
  const branchNames = branches
    .filter((branch) => doctor.branch_ids.includes(branch.id))
    .map((branch) => localized(branch, 'name', locale));
  const styles = specialtyStyles[doctor.specialty];

  return (
    <article className="flex h-full items-center gap-4 rounded-lg border border-border bg-card p-4 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg">
      <ParticleRingImage
        src={doctor.photo_url}
        alt={doctor.photo_url ? name : t('noPhoto', { name })}
        sizes="128px"
        className="w-24 shrink-0 sm:w-28 xl:w-24"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-ink">{name}</h3>
        <p className={cn('mt-1 flex items-center gap-2 text-sm font-medium', styles.text)}>
          <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
          {tSpecialty(doctor.specialty)}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
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
          className={cn(brandButton({ tone: 'primary', block: true }), 'mt-3')}
          aria-label={t('bookWith', { name })}
        >
          {t('book')}
        </Link>
      </div>
    </article>
  );
}
