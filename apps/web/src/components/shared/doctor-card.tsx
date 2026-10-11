import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, BriefcaseMedical, MapPin } from 'lucide-react';
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

/**
 * كارت الطبيب (A0 · A2 · A5): من غير نجوم ولا قلب.
 * الكارت كله بيفتح البروفايل (لينك "شوف البروفايل" ممدود على الكارت كله)، وجواه زرار "احجز" واحد بس.
 * شكل واحد في كل الموقع (A5: الصورة فوق والكلام في النص)، فالمريض بيشوف نفس الكارت في كل صفحة (L-43).
 */
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
    <article
      className={cn(
        'group relative flex h-full flex-col items-center gap-4 rounded-lg border border-border bg-card p-5 text-center transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50',
      )}
    >
      <ParticleRingImage
        src={doctor.photo_url}
        alt={doctor.photo_url ? name : t('noPhoto', { name })}
        sizes="160px"
        className="w-40 shrink-0 transition-transform group-hover:scale-[1.03]"
      />
      <div className="flex w-full min-w-0 flex-1 flex-col items-center">
        <h3 className="font-semibold text-ink group-hover:text-primary">{name}</h3>
        <p className={cn('mt-1 flex items-center gap-2 text-sm font-medium', styles.text)}>
          <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
          {tSpecialty(doctor.specialty)}
        </p>
        <ul className="mt-2 flex-1 space-y-1 text-sm text-muted-foreground">
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
        <div className="mt-3 flex w-full items-center justify-between gap-3">
          {/* after:inset-0 بيمد اللينك على الكارت كله: أي ضغطة على الصورة أو الاسم بتفتح البروفايل */}
          <Link
            href={`/doctors/${doctor.slug}`}
            aria-label={t('profileOf', { name })}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold whitespace-nowrap text-primary after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
          >
            {t('profile')}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden
            />
          </Link>
          {/* relative z-10: الزرار فوق لينك الكارت، فبيروح للحجز مش للبروفايل */}
          <Link
            href={{ pathname: '/book', query: { doctor: doctor.slug } }}
            aria-label={t('bookWith', { name })}
            className={brandButton({ tone: 'primary', className: 'relative z-10 px-5' })}
          >
            {t('book')}
          </Link>
        </div>
      </div>
    </article>
  );
}
