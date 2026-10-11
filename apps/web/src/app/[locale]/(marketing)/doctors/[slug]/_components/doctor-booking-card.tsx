import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { formatSlot, isLocale, localized } from '@oxygen/shared';
import { brandButton } from '@/components/shared/brand';
import { Link } from '@/i18n/navigation';
import type { PublicDoctorDetail } from '@/types/public';

/**
 * كارت "احجز مع د. …" (A5): أقرب مواعيد + الزرار الدهبي (الوحيد في الصفحة).
 * Sticky على الكمبيوتر. المواعيد هنا للعرض: الميعاد بيتبعت لصفحة الحجز، وهي بتتأكد إنه لسه فاضي.
 */
export async function DoctorBookingCard({ doctor }: { doctor: PublicDoctorDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('doctorProfile');
  const name = localized(doctor, 'name', locale);

  return (
    <section
      aria-labelledby="doctor-booking-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24"
    >
      <h2 id="doctor-booking-title" className="font-heading text-xl font-bold text-ink">
        {t('bookWith', { name })}
      </h2>

      {doctor.next_slots.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">{t('nextSlots')}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {doctor.next_slots.map((slot) => {
              const { day, time } = formatSlot(slot.starts_at, locale);
              return (
                <li key={slot.starts_at}>
                  <Link
                    href={{
                      pathname: '/book',
                      query: { doctor: doctor.slug, slot: slot.starts_at },
                    }}
                    aria-label={t('slotLabel', { day, time })}
                    className="flex min-h-14 flex-col items-center justify-center rounded-md border border-field-border bg-card px-2 py-2 text-center transition-colors hover:border-primary hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="text-sm text-muted-foreground">{day}</span>
                    <span className="text-sm font-semibold text-ink">{time}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{t('noSlots')}</p>
      )}

      <Link
        href={{ pathname: '/book', query: { doctor: doctor.slug } }}
        className={brandButton({ tone: 'gold', size: 'lg', block: true, className: 'mt-5' })}
      >
        {t('book')}
      </Link>
      <Link
        href={{ pathname: '/book', query: { doctor: doctor.slug } }}
        className="mt-2 flex h-11 items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        {t('allTimes')}
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
      </Link>
    </section>
  );
}
