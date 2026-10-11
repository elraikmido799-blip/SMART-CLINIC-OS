'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Smartphone,
  TicketPercent,
} from 'lucide-react';
import { formatMoney, isLocale } from '@oxygen/shared';
import { useGetBookingQuery } from '@/api/bookings.api';
import {
  useCompleteDemoPaymentMutation,
  useStartPaymentMutation,
  useValidateCouponMutation,
} from '@/api/payments.api';
import { BookingDetails } from '@/components/shared/booking-details';
import { brandButton } from '@/components/shared/brand';
import { FieldMessage, SubmitErrorMessage } from '@/components/shared/field-message';
import { SignInGate } from '@/components/shared/sign-in-gate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useRouter } from '@/i18n/navigation';
import { isOffline, toSubmitError, type SubmitError } from '@/lib/submit-error';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/booking';
import type { Coupon, PaymentMethod } from '@/types/payment';

const METHODS: { value: PaymentMethod; icon: typeof CreditCard }[] = [
  { value: 'card', icon: CreditCard },
  { value: 'wallet', icon: Smartphone },
];

/** الدفع W-16: لازم دخول، والحجز من ?booking=. لو الحجز اتدفع خلاص: لينك للنجاح بدل الدفع تاني. */
export function CheckoutView() {
  const t = useTranslations('checkout');
  const bookingId = useSearchParams().get('booking') ?? '';

  return (
    <SignInGate title={t('signInTitle')}>
      {bookingId ? <CheckoutContent bookingId={bookingId} /> : <MissingBooking />}
    </SignInGate>
  );
}

function MissingBooking() {
  const t = useTranslations('checkout');
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink">{t('notFoundTitle')}</h1>
      <p className="mt-2 text-muted-foreground">{t('notFoundBody')}</p>
      <Link href="/book" className={brandButton({ tone: 'primary', className: 'mt-6' })}>
        {t('bookNew')}
      </Link>
    </div>
  );
}

function CheckoutContent({ bookingId }: { bookingId: string }) {
  const t = useTranslations('checkout');
  const booking = useGetBookingQuery(bookingId);

  if (booking.isLoading) {
    return (
      <div aria-busy className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }
  if (!booking.data) return <MissingBooking />;
  if (booking.data.paid) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" strokeWidth={1.5} aria-hidden />
        <h1 className="mt-3 font-heading text-2xl font-bold text-ink">{t('alreadyPaid')}</h1>
        <Link
          href={{ pathname: '/checkout/success', query: { booking: bookingId } }}
          className={brandButton({ tone: 'primary', className: 'mt-6' })}
        >
          {t('viewBooking')}
        </Link>
      </div>
    );
  }
  return <PaymentForm booking={booking.data} />;
}

type CouponError = 'invalid' | 'expired' | SubmitError;

function PaymentForm({ booking }: { booking: Booking }) {
  const t = useTranslations('checkout');
  const tForm = useTranslations('leadForm');
  const locale = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<CouponError | null>(null);
  const [payError, setPayError] = useState<SubmitError | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [validateCoupon, validating] = useValidateCouponMutation();
  const [startPayment, starting] = useStartPaymentMutation();
  const [completeDemo, completing] = useCompleteDemoPaymentMutation();
  if (!isLocale(locale)) return null;

  const total = Math.max(0, booking.price_minor - (coupon?.discount_minor ?? 0));

  const applyCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setCouponError(null);
    try {
      setCoupon(await validateCoupon({ code, booking_id: booking.id }).unwrap());
    } catch (error) {
      const errorCode = (error as { data?: { code?: string } }).data?.code;
      setCoupon(null);
      setCouponError(
        errorCode === 'INVALID_COUPON'
          ? 'invalid'
          : errorCode === 'COUPON_EXPIRED'
            ? 'expired'
            : toSubmitError(error),
      );
    }
  };

  const pay = async () => {
    setPayError(null);
    if (isOffline()) {
      setPayError('network');
      return;
    }
    try {
      const result = await startPayment({
        booking_id: booking.id,
        method,
        coupon_code: coupon?.code ?? null,
      }).unwrap();
      // الحقيقة: صفحة الدفع بتاعة الشركة، وهي اللي بترجّع لـ/checkout/success أو /failed
      if (result.redirect_url) window.location.assign(result.redirect_url);
      else setPaymentId(result.payment_id);
    } catch (error) {
      setPayError(toSubmitError(error));
    }
  };

  const finishDemo = async (result: 'success' | 'failed') => {
    if (!paymentId) return;
    await completeDemo({ payment_id: paymentId, result });
    router.push({
      pathname: result === 'success' ? '/checkout/success' : '/checkout/failed',
      query: { booking: booking.id },
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-8">
        <h1 className="font-heading text-3xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>

        <fieldset className="mt-6">
          <legend className="font-heading text-lg font-bold text-ink">{t('methodTitle')}</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {METHODS.map(({ value, icon: Icon }) => {
              const selected = method === value;
              return (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                    selected
                      ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
                      : 'border-border hover:border-primary/60',
                  )}
                >
                  <input
                    type="radio"
                    name="method"
                    value={value}
                    checked={selected}
                    onChange={() => setMethod(value)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span>
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      <Icon className="size-4 text-primary" aria-hidden />
                      {t(`methods.${value}.title`)}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {t(`methods.${value}.body`)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <form onSubmit={applyCoupon} className="mt-6">
          <label htmlFor="coupon" className="flex items-center gap-2 font-semibold text-ink">
            <TicketPercent className="size-4 text-primary" aria-hidden />
            {t('couponLabel')}
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              id="coupon"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setCouponError(null);
              }}
              dir="ltr"
              autoComplete="off"
              aria-invalid={Boolean(couponError)}
              aria-describedby="coupon-message"
              className="h-11 max-w-60 border-field-border bg-card text-base uppercase rtl:text-right"
            />
            <button
              type="submit"
              disabled={validating.isLoading || !code.trim()}
              className={brandButton({ tone: 'outline', className: 'disabled:opacity-60' })}
            >
              {validating.isLoading && <Loader2 className="animate-spin" aria-hidden />}
              {t('apply')}
            </button>
          </div>
          <div id="coupon-message" className="mt-2" aria-live="polite">
            {coupon && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
                <CheckCircle2 className="size-4" aria-hidden />
                {t('couponApplied', {
                  code: coupon.code,
                  amount: formatMoney(coupon.discount_minor, booking.currency, locale),
                })}
              </p>
            )}
            {couponError &&
              (couponError === 'invalid' || couponError === 'expired' ? (
                <FieldMessage error={t(`couponErrors.${couponError}`)} />
              ) : (
                <FieldMessage error={tForm(`errors.${couponError}`)} />
              ))}
          </div>
        </form>

        {payError && <SubmitErrorMessage>{tForm(`errors.${payError}`)}</SubmitErrorMessage>}

        <button
          type="button"
          onClick={() => void pay()}
          disabled={starting.isLoading}
          className={brandButton({
            tone: 'gold',
            size: 'lg',
            block: true,
            className: 'mt-8 disabled:opacity-70',
          })}
        >
          {starting.isLoading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <LockKeyhole aria-hidden />
          )}
          {t('pay', { amount: formatMoney(total, booking.currency, locale) })}
        </button>
        <p className="mt-3 text-center text-sm text-muted-foreground">{t('secure')}</p>
      </div>

      <div className="lg:sticky lg:top-24">
        <h2 className="mb-3 font-heading text-xl font-bold text-ink">{t('summary')}</h2>
        <BookingDetails booking={booking} pendingDiscount={coupon?.discount_minor} />
      </div>

      {/* صفحة الدفع التجريبية (الـMocks بس): مكان صفحة شركة الدفع */}
      <Dialog open={paymentId !== null} onOpenChange={(open) => !open && setPaymentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('demo.title')}</DialogTitle>
            <DialogDescription>{t('demo.body')}</DialogDescription>
          </DialogHeader>
          <p className="rounded-lg bg-mist p-3 text-center font-heading text-2xl font-bold text-ink">
            {formatMoney(total, booking.currency, locale)}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={completing.isLoading}
              onClick={() => void finishDemo('failed')}
              className={brandButton({ tone: 'outline' })}
            >
              {t('demo.fail')}
            </button>
            <button
              type="button"
              disabled={completing.isLoading}
              onClick={() => void finishDemo('success')}
              className={brandButton({ tone: 'primary' })}
            >
              {completing.isLoading && <Loader2 className="animate-spin" aria-hidden />}
              {t('demo.succeed')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
