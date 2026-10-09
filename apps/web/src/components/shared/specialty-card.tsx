import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { PublicSpecialty } from '@/types/public';
import { specialtyStyles } from './brand';

// مربع التخصص (A1): أيقونة منقطة بلون التخصص على خلفية فاتحة من نفس اللون
export async function SpecialtyCard({ specialty }: { specialty: PublicSpecialty }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('specialtyCard');
  const styles = specialtyStyles[specialty.slug];
  const name = localized(specialty, 'name', locale);

  return (
    <Link
      href={`/specialties/${specialty.slug}`}
      className={cn(
        'group flex h-full flex-col rounded-lg border p-4 transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-6',
        styles.tint,
        styles.border,
      )}
    >
      <Image
        src={specialty.icon_url}
        alt=""
        width={64}
        height={64}
        className="size-12 sm:size-16"
      />
      <h3 className={cn('mt-3 font-heading text-lg font-bold sm:mt-4 sm:text-xl', styles.text)}>
        {name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {localized(specialty, 'summary', locale)}
      </p>
      <span
        className={cn('mt-4 inline-flex items-center gap-1 text-sm font-semibold', styles.text)}
      >
        {t('learnMore')}
        <span className="sr-only"> — {name}</span>
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
