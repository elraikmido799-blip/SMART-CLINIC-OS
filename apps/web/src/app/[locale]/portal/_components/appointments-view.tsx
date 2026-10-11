'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  CalendarClock,
  CalendarX,
  Loader2,
  MapPin,
  RotateCcw,
  UserRound,
  Video,
} from 'lucide-react';
import { formatDayParts, formatSlot, isLocale, localized } from '@oxygen/shared';
import { brandButton } from '@/components/shared/brand';
import { EmptyState } from '@/components/shared/empty-state';
import { SubmitErrorMessage } from '@/components/shared/field-message';
import { SlotPicker } from '@/components/shared/slot-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/i18n/navigation';
import { cairoDateOf, hoursUntil, isUpcoming } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Booking, Slot } from '@/types/booking';
import {
  useCancelBookingMutation,
  useGetMyBookingsQuery,
  useRescheduleBookingMutation,
} from '../_api/appointments.api';
import { PageHeader } from './page-header';
import { QueryError } from './query-error';
import { StatusBadge } from './status-badge';

// الإلغاء مجاني لحد قبل الميعاد بـ24 ساعة (سياسة الاسترداد)
const FREE_CANCEL_HOURS = 24;
// لينك الفيديو بيفتح قبل المكالمة بربع ساعة
const JOIN_BEFORE_HOURS = 0.25;

const isActiveBooking = (booking: Booking) =>
  (booking.status === 'confirmed' || booking.status === 'pending_payment') &&
  isUpcoming(booking.starts_at);

/**
 * المواعيد PP-02: الجاية (الأقرب الأول) واللي فاتت. كل ميعاد: تأجيل (SlotPicker في Dialog) · إلغاء (Dialog بالسياسة)
 * · ادفع دلوقتي · ادخل المكالمة (أونلاين) · احجز تاني. ?reschedule=<id> بيفتح التأجيل على طول (من الملخص).
 */
export function AppointmentsView() {
  const t = useTranslations('portal.appointments');
  const bookings = useGetMyBookingsQuery();
  const rescheduleParam = useSearchParams().get('reschedule');
  const [rescheduling, setRescheduling] = useState<string | null>(rescheduleParam);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const all = bookings.data ?? [];
  const upcoming = all
    .filter(isActiveBooking)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = all.filter((booking) => !isActiveBooking(booking));
  const find = (id: string | null) => all.find((booking) => booking.id === id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Link href="/book" className={brandButton({ tone: 'gold' })}>
            {t('book')}
          </Link>
        }
      />

      {bookings.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : bookings.isError ? (
        <QueryError onRetry={bookings.refetch} />
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">{t('upcoming', { count: upcoming.length })}</TabsTrigger>
            <TabsTrigger value="past">{t('past', { count: past.length })}</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-5">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                title={t('emptyUpcoming')}
                body={t('emptyUpcomingBody')}
                action={
                  <Link href="/book" className={brandButton({ tone: 'gold' })}>
                    {t('book')}
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((booking) => (
                  <li key={booking.id}>
                    <AppointmentCard
                      booking={booking}
                      onReschedule={() => setRescheduling(booking.id)}
                      onCancel={() => setCancelling(booking.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-5">
            {past.length === 0 ? (
              <EmptyState icon={CalendarClock} title={t('emptyPast')} />
            ) : (
              <ul className="space-y-3">
                {past.map((booking) => (
                  <li key={booking.id}>
                    <AppointmentCard booking={booking} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      )}

      {find(rescheduling) && (
        <RescheduleDialog booking={find(rescheduling)!} onClose={() => setRescheduling(null)} />
      )}
      {find(cancelling) && (
        <CancelDialog booking={find(cancelling)!} onClose={() => setCancelling(null)} />
      )}
    </div>
  );
}

type CardProps = { booking: Booking; onReschedule?: () => void; onCancel?: () => void };

function AppointmentCard({ booking, onReschedule, onCancel }: CardProps) {
  const t = useTranslations('portal.appointments');
  const locale = useLocale();
  if (!isLocale(locale)) return null;

  const day = formatDayParts(cairoDateOf(booking.starts_at), locale);
  const slot = formatSlot(booking.starts_at, locale);
  const active = isActiveBooking(booking);
  const canJoin =
    booking.mode === 'online' && active && hoursUntil(booking.starts_at) <= JOIN_BEFORE_HOURS;
  const bookAgain =
    booking.mode === 'online'
      ? { mode: 'online', specialty: booking.specialty }
      : {
          service: booking.service.slug,
          branch: booking.branch?.slug ?? '',
          doctor: booking.doctor.slug,
        };

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:p-5',
        booking.status === 'cancelled' && 'opacity-75',
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 sm:w-24 sm:flex-col sm:justify-center sm:gap-0 sm:text-center',
          active ? 'bg-mist text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <span className="text-sm font-semibold">{day.weekday}</span>
        <span className="font-heading text-lg font-bold sm:text-xl">{day.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-lg font-bold text-ink">
            {localized(booking.service, 'name', locale)}
          </h3>
          <StatusBadge status={booking.status} />
        </div>
        <dl className="mt-2 grid gap-1 text-sm text-ink sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t('time')}</dt>
            <CalendarClock className="size-4 shrink-0 text-primary" aria-hidden />
            <dd>
              <bdi>{slot.time}</bdi>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t('doctor')}</dt>
            <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
            <dd>{localized(booking.doctor, 'name', locale)}</dd>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <dt className="sr-only">{t('place')}</dt>
            {booking.branch ? (
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <Video className="size-4 shrink-0 text-primary" aria-hidden />
            )}
            <dd>
              {booking.branch
                ? t('branch', { name: localized(booking.branch, 'name', locale) })
                : t('online')}
              <span className="text-muted-foreground"> · </span>
              <bdi dir="ltr" className="text-muted-foreground">
                {booking.reference}
              </bdi>
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {active && booking.status === 'pending_payment' && (
            <Link
              href={{ pathname: '/checkout', query: { booking: booking.id } }}
              className={brandButton({ tone: 'gold' })}
            >
              {t('payNow')}
            </Link>
          )}
          {active &&
            booking.mode === 'online' &&
            booking.video_url &&
            (canJoin ? (
              <a
                href={booking.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className={brandButton({ tone: 'primary' })}
              >
                <Video aria-hidden />
                {t('join')}
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center text-sm text-muted-foreground">
                {t('joinLater')}
              </span>
            ))}
          {active && onReschedule && (
            <button
              type="button"
              onClick={onReschedule}
              className={brandButton({ tone: 'outline' })}
            >
              {t('reschedule')}
            </button>
          )}
          {active && booking.branch && (
            <a
              href={booking.branch.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className={brandButton({ tone: 'outline' })}
            >
              <MapPin aria-hidden />
              {t('directions')}
            </a>
          )}
          {active && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-destructive hover:underline"
            >
              {t('cancel')}
            </button>
          )}
          {!active && (
            <Link
              href={{ pathname: '/book', query: bookAgain }}
              className={brandButton({ tone: 'outline' })}
            >
              <RotateCcw className="rtl:-scale-x-100" aria-hidden />
              {t('bookAgain')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function RescheduleDialog({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const t = useTranslations('portal.appointments');
  const tForm = useTranslations('leadForm');
  const locale = useLocale();
  const [date, setDate] = useState<string | undefined>(cairoDateOf(booking.starts_at));
  const [slot, setSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<'taken' | 'other' | null>(null);
  const [reschedule, { isLoading }] = useRescheduleBookingMutation();
  if (!isLocale(locale)) return null;

  const confirm = async () => {
    if (!slot) return;
    setError(null);
    try {
      await reschedule({
        id: booking.id,
        starts_at: slot.starts_at,
        doctor_slug: slot.doctor_slug,
      }).unwrap();
      const when = formatSlot(slot.starts_at, locale);
      toast.success(t('rescheduled', { day: when.day, time: when.time }));
      onClose();
    } catch (caught) {
      setError((caught as { status?: number }).status === 409 ? 'taken' : 'other');
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('rescheduleTitle')}</DialogTitle>
          <DialogDescription>
            {t('rescheduleBody', {
              service: localized(booking.service, 'name', locale),
              doctor: localized(booking.doctor, 'name', locale),
            })}
          </DialogDescription>
        </DialogHeader>
        <SlotPicker
          query={{
            mode: booking.mode,
            specialty: booking.specialty,
            service: booking.mode === 'clinic' ? booking.service.slug : undefined,
            branch: booking.branch?.slug,
            doctor: booking.doctor.slug,
            exclude_booking: booking.id,
          }}
          date={date}
          onDateChange={(value) => {
            setDate(value);
            setSlot(null);
          }}
          value={slot?.starts_at}
          onSelect={setSlot}
        />
        {error === 'taken' && <SubmitErrorMessage>{t('slotTaken')}</SubmitErrorMessage>}
        {error === 'other' && <SubmitErrorMessage>{tForm('errors.server')}</SubmitErrorMessage>}
        <DialogFooter>
          <button type="button" onClick={onClose} className={brandButton({ tone: 'outline' })}>
            {t('keep')}
          </button>
          <button
            type="button"
            disabled={!slot || isLoading}
            onClick={() => void confirm()}
            className={brandButton({ tone: 'primary', className: 'disabled:opacity-60' })}
          >
            {isLoading && <Loader2 className="animate-spin" aria-hidden />}
            {t('confirmReschedule')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const t = useTranslations('portal.appointments');
  const tForm = useTranslations('leadForm');
  const locale = useLocale();
  const [cancel, { isLoading, isError }] = useCancelBookingMutation();
  if (!isLocale(locale)) return null;
  const free = hoursUntil(booking.starts_at) >= FREE_CANCEL_HOURS;
  const slot = formatSlot(booking.starts_at, locale);

  const confirm = async () => {
    try {
      await cancel(booking.id).unwrap();
      toast.success(t('cancelled'));
      onClose();
    } catch {
      // الرسالة تحت
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('cancelTitle')}</DialogTitle>
          <DialogDescription>
            {t('cancelBody', {
              service: localized(booking.service, 'name', locale),
              day: slot.day,
              time: slot.time,
            })}
          </DialogDescription>
        </DialogHeader>
        <p className={cn('rounded-lg p-3 text-sm text-ink', free ? 'bg-mist' : 'bg-warning/15')}>
          {free ? (booking.paid ? t('policyFreePaid') : t('policyFree')) : t('policyLate')}{' '}
          <Link href="/refund-policy" className="font-semibold text-primary underline">
            {t('policyLink')}
          </Link>
        </p>
        {isError && <SubmitErrorMessage>{tForm('errors.server')}</SubmitErrorMessage>}
        <DialogFooter>
          <button type="button" onClick={onClose} className={brandButton({ tone: 'primary' })}>
            {t('keep')}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void confirm()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-destructive px-5 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('confirmCancel')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
