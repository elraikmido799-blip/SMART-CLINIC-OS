import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, CalendarClock, Hash, MapPin, Video } from 'lucide-react';
import { formatMoney, formatSlot, isLocale, localized } from '@oxygen/shared';
import { specialtyIcon } from '@/components/shared/brand';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';

const DEFAULT_PHOTO = '/images/doctors/default.png';

type BookingDetailsProps = {
  booking: Booking;
  // الأسعار (الدفع والنجاح). في البوابة بتستخبى
  showPrice?: boolean;
  // خصم لسه مش متطبق على الحجز (كود اتكتب في صفحة الدفع)
  pendingDiscount?: number;
  className?: string;
};

/**
 * تفاصيل حجز واحد: الخدمة · الطبيب · الميعاد · المكان (فرع + اتجاهات، أو مكالمة فيديو) · رقم الحجز · السعر.
 * في الدفع والنجاح والفشل، والبوابة (المواعيد). من غير async فبيشتغل في السيرفر والمتصفح.
 */
export function BookingDetails({
  booking,
  showPrice = true,
  pendingDiscount,
  className,
}: BookingDetailsProps) {
  const t = useTranslations('bookingDetails');
  const tSpecialty = useTranslations('specialtyNames');
  const locale = useLocale();
  if (!isLocale(locale)) return null;

  const slot = formatSlot(booking.starts_at, locale);
  const discount = pendingDiscount ?? booking.discount_minor;
  const total = Math.max(0, booking.price_minor - discount);
  const money = (minor: number) => formatMoney(minor, booking.currency, locale);

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5', className)}>
      <div className="flex items-center gap-3">
        <Image
          src={specialtyIcon(booking.specialty)}
          alt=""
          width={44}
          height={44}
          className="size-11 shrink-0"
        />
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold text-ink">
            {localized(booking.service, 'name', locale)}
          </p>
          <p className="text-sm text-muted-foreground">
            {tSpecialty(booking.specialty)} ·{' '}
            {t('minutes', { minutes: booking.service.duration_minutes })}
          </p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-border border-t border-border">
        <div className="flex items-center gap-3 py-3">
          <dt className="sr-only">{t('doctor')}</dt>
          <Image
            src={booking.doctor.photo_url ?? DEFAULT_PHOTO}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full border-2 border-dotted border-primary/50 bg-mist object-cover"
          />
          <dd className="font-semibold text-ink">{localized(booking.doctor, 'name', locale)}</dd>
        </div>
        <div className="flex items-center gap-3 py-3">
          <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
            <CalendarClock className="size-5" aria-hidden />
            <span className="sr-only">{t('when')}</span>
          </dt>
          <dd className="font-semibold text-ink">
            {slot.day} · <bdi>{slot.time}</bdi>
          </dd>
        </div>
        <div className="flex items-start gap-3 py-3">
          <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
            {booking.branch ? (
              <MapPin className="size-5" aria-hidden />
            ) : (
              <Video className="size-5" aria-hidden />
            )}
            <span className="sr-only">{t('place')}</span>
          </dt>
          <dd className="min-w-0">
            {booking.branch ? (
              <>
                <span className="block font-semibold text-ink">
                  {t('branch', { name: localized(booking.branch, 'name', locale) })}
                </span>
                <a
                  href={booking.branch.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {t('directions')}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
                </a>
              </>
            ) : (
              <>
                <span className="block font-semibold text-ink">{t('online')}</span>
                <span className="block text-sm text-muted-foreground">{t('onlineHint')}</span>
              </>
            )}
          </dd>
        </div>
        <div className="flex items-center gap-3 py-3">
          <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
            <Hash className="size-5" aria-hidden />
            <span className="sr-only">{t('reference')}</span>
          </dt>
          <dd>
            <span className="block text-sm text-muted-foreground">{t('reference')}</span>
            <bdi dir="ltr" className="font-semibold tracking-wide text-ink">
              {booking.reference}
            </bdi>
          </dd>
        </div>
      </dl>

      {showPrice && (
        <dl className="mt-1 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('price')}</dt>
            <dd className="text-ink">{money(booking.price_minor)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('discount')}</dt>
              <dd className="font-semibold text-success">− {money(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-border pt-2">
            <dt className="font-semibold text-ink">{t('total')}</dt>
            <dd className="font-heading text-xl font-bold text-ink">{money(total)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
