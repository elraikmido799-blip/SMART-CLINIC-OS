import { getTranslations } from 'next-intl/server';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { specialtyStyles } from './brand';

type SpecialtyChipsProps = {
  // الصفحة اللي الفلتر بيغيّر الـURL بتاعها (/doctors · /learn)
  pathname: string;
  active?: Specialty;
  // فلاتر تانية في الـURL بتفضل زي ما هي (زي ?branch= في الأطباء)
  keep?: Record<string, string>;
  label: string;
  allLabel: string;
};

/**
 * فلتر التخصص (A5): "الكل" + شيب لكل تخصص بنقطة بلونه، واللي مختار Teal.
 * لينكات عادية (?specialty=) فبتشتغل قبل ما الـJS يحمّل، والـBack بيرجّع الفلتر (DEC-33).
 */
export async function SpecialtyChips({
  pathname,
  active,
  keep,
  label,
  allLabel,
}: SpecialtyChipsProps) {
  const tSpecialty = await getTranslations('specialtyNames');

  return (
    <nav aria-label={label} className="flex flex-wrap justify-center gap-2 lg:justify-start">
      {[undefined, ...SPECIALTIES].map((value) => {
        const isActive = value === active;
        return (
          <Link
            key={value ?? 'all'}
            href={{ pathname, query: { ...(value && { specialty: value }), ...keep } }}
            scroll={false}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-ink hover:border-primary',
            )}
          >
            {value && (
              <span
                className={cn(
                  'size-2 rounded-full',
                  isActive ? 'bg-white' : specialtyStyles[value].dot,
                )}
                aria-hidden
              />
            )}
            {value ? tSpecialty(value) : allLabel}
          </Link>
        );
      })}
    </nav>
  );
}
