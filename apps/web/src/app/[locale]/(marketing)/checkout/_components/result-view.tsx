'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarDays,
  CalendarPlus,
  Check,
  CircleAlert,
  Download,
  MessageCircle,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { useGetBookingQuery } from '@/api/bookings.api';
import { BookingDetails } from '@/components/shared/booking-details';
import { brandButton } from '@/components/shared/brand';
import { SignInGate } from '@/components/shared/sign-in-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from '@/lib/calendar';
import { cn } from '@/lib/utils';
import { whatsappUrl } from '@/lib/whatsapp';
import type { Booking } from '@/types/booking';

type Outcome = 'success' | 'failed';

/**
 * نتيجة الحجز/الدفع (W-16 · صور 2.10 لسه): /checkout/success و /checkout/failed.
 * النجاح: الحالة (اتدفع · هتدفع في العيادة) + التفاصيل + "ضيف للتقويم" + مواعيدي + الأبلكيشن.
 * الفشل: "مفيش فلوس اتخصمت" + جرّب تاني + واتساب.
 */
export function ResultView({ outcome }: { outcome: Outcome }) {
  const t = useTranslations('checkoutResult');
  const bookingId = useSearchParams().get('booking') ?? '';
  return (
    <SignInGate title={t('signInTitle')}>
      <ResultContent bookingId={bookingId} outcome={outcome} />
    </SignInGate>
  );
}

function ResultContent({ bookingId, outcome }: { bookingId: string; outcome: Outcome }) {
  const t = useTranslations('checkoutResult');
  const booking = useGetBookingQuery(bookingId, { skip: !bookingId });

  if (booking.isLoading) {
    return (
      <div aria-busy className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="mx-auto size-24 rounded-full" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }
  if (!booking.data) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">{t('notFound')}</h1>
        <Link href="/book" className={brandButton({ tone: 'primary', className: 'mt-6' })}>
          {t('bookNew')}
        </Link>
      </div>
    );
  }
  return outcome === 'success' ? (
    <Success booking={booking.data} />
  ) : (
    <Failed booking={booking.data} />
  );
}

// علامة كبيرة جوه دايرة منقطة (لحد ما رسومات 2.10 تيجي)
function Badge({ tone }: { tone: Outcome }) {
  return (
    <span
      className={cn(
        'mx-auto grid size-24 place-items-center rounded-full border-[3px] border-dotted',
        tone === 'success' ? 'border-primary bg-mist' : 'border-destructive/50 bg-destructive/5',
      )}
    >
      <span
        className={cn(
          'grid size-16 place-items-center rounded-full text-white',
          tone === 'success' ? 'bg-primary' : 'bg-destructive',
        )}
      >
        {tone === 'success' ? (
          <Check className="size-9" strokeWidth={2.5} aria-hidden />
        ) : (
          <CircleAlert className="size-9" aria-hidden />
        )}
      </span>
    </span>
  );
}

function Success({ booking }: { booking: Booking }) {
  const t = useTranslations('checkoutResult');
  const locale = useLocale();
  if (!isLocale(locale)) return null;

  const status = booking.paid
    ? 'paid'
    : booking.payment_method === 'clinic'
      ? 'payAtClinic'
      : 'pending';
  const event: CalendarEvent = {
    id: booking.id,
    title: t('calendarTitle', { service: localized(booking.service, 'name', locale) }),
    description: t('calendarDescription', {
      doctor: localized(booking.doctor, 'name', locale),
      reference: booking.reference,
    }),
    location: booking.branch
      ? `Oxygen ${localized(booking.branch, 'name', locale)} — ${booking.branch.maps_url}`
      : (booking.video_url ?? 'Online'),
    startsAt: booking.starts_at,
    durationMinutes: booking.service.duration_minutes,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center" role="status">
        <Badge tone="success" />
        <h1 className="mt-5 font-heading text-3xl font-bold text-ink sm:text-4xl">
          {t('successTitle')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{t(`status.${status}`)}</p>
      </div>

      <BookingDetails booking={booking} className="mt-8" />

      {booking.mode === 'online' && (
        <p className="mt-4 rounded-lg bg-mist p-4 text-sm text-ink">{t('onlineNote')}</p>
      )}

      <section
        aria-labelledby="calendar-title"
        className="mt-6 rounded-2xl border border-border bg-card p-5"
      >
        <h2 id="calendar-title" className="flex items-center gap-2 font-semibold text-ink">
          <CalendarPlus className="size-5 text-primary" aria-hidden />
          {t('calendarHeading')}
        </h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className={brandButton({ tone: 'outline' })}
          >
            {t('googleCalendar')}
          </a>
          <button
            type="button"
            onClick={() => downloadIcs(event, `oxygen-${booking.reference}.ics`)}
            className={brandButton({ tone: 'outline' })}
          >
            <Download aria-hidden />
            {t('icsFile')}
          </button>
        </div>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/portal/appointments" className={brandButton({ tone: 'primary', size: 'lg' })}>
          <CalendarDays aria-hidden />
          {t('myAppointments')}
        </Link>
        <Link href="/app" className={brandButton({ tone: 'outline', size: 'lg' })}>
          <Smartphone aria-hidden />
          {t('getApp')}
        </Link>
      </div>
    </div>
  );
}

function Failed({ booking }: { booking: Booking }) {
  const t = useTranslations('checkoutResult');
  const tWhatsapp = useTranslations('whatsapp');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center" role="alert">
        <Badge tone="failed" />
        <h1 className="mt-5 font-heading text-3xl font-bold text-ink sm:text-4xl">
          {t('failedTitle')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{t('failedBody')}</p>
      </div>

      <ul className="mx-auto mt-6 max-w-md list-disc space-y-1 ps-5 text-muted-foreground marker:text-primary">
        <li>{t('reasons.balance')}</li>
        <li>{t('reasons.details')}</li>
        <li>{t('reasons.bank')}</li>
      </ul>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href={{ pathname: '/checkout', query: { booking: booking.id } }}
          className={brandButton({ tone: 'gold', size: 'lg' })}
        >
          <RotateCcw className="rtl:-scale-x-100" aria-hidden />
          {t('tryAgain')}
        </Link>
        <a
          href={whatsappUrl(t('whatsappMessage', { reference: booking.reference }))}
          target="_blank"
          rel="noopener noreferrer"
          className={brandButton({ tone: 'outline', size: 'lg' })}
        >
          <MessageCircle aria-hidden />
          {tWhatsapp('cta')}
        </a>
      </div>

      <BookingDetails booking={booking} className="mt-8" />
    </div>
  );
}
