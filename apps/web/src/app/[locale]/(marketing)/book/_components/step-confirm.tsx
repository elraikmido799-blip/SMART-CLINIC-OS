'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Info, Store, TimerReset } from 'lucide-react';
import { useCreateBookingMutation } from '@/api/bookings.api';
import { SubmitErrorMessage } from '@/components/shared/field-message';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Link, useRouter } from '@/i18n/navigation';
import { isOffline, toSubmitError, type SubmitError } from '@/lib/submit-error';
import { cn } from '@/lib/utils';
import { StepNav } from './step-nav';
import type { BookingState } from './use-booking-state';

const NOTES_MAX = 500;

type PaymentMethod = 'clinic' | 'online';
type ConfirmError = 'slot-taken' | 'signed-out' | SubmitError;

function toConfirmError(error: unknown): ConfirmError {
  const status = (error as { status?: unknown } | null)?.status;
  if (status === 409) return 'slot-taken';
  if (status === 401) return 'signed-out';
  return toSubmitError(error);
}

/**
 * الخطوة 5 — التأكيد والدفع. الملخص جنبها (BookingSummary)، وهنا: طريقة الدفع + ملاحظات + سياسة الإلغاء.
 * العيادة: ادفع في العيادة (الافتراضي) أو أونلاين دلوقتي. الأونلاين: الدفع أونلاين بس.
 * الميعاد اتحجز من حد تاني (409) = "اختار ميعاد تاني" بيرجّعك للمواعيد.
 * بعد الحجز: الدفع أونلاين ← /checkout · الدفع في العيادة ← /checkout/success.
 */
export function StepConfirm({ state }: { state: BookingState }) {
  const t = useTranslations('booking');
  const tForm = useTranslations('leadForm');
  const router = useRouter();
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const methods: PaymentMethod[] = state.mode === 'online' ? ['online'] : ['clinic', 'online'];
  const [method, setMethod] = useState<PaymentMethod>(methods[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<ConfirmError | null>(null);

  const confirm = async () => {
    if (!state.slot || !state.slotDoctor || !state.specialty) return;
    setError(null);
    if (isOffline()) {
      setError('network');
      return;
    }
    try {
      const booking = await createBooking({
        mode: state.mode,
        specialty: state.specialty,
        service_slug: state.service?.slug ?? null,
        branch_id: state.branch?.id ?? null,
        doctor_slug: state.slotDoctor.slug,
        starts_at: state.slot,
        payment_method: method,
        program_slug: state.program?.slug ?? null,
        notes: notes.trim() || null,
      }).unwrap();
      router.push({
        pathname: method === 'online' ? '/checkout' : '/checkout/success',
        query: { booking: booking.id },
      });
    } catch (caught) {
      setError(toConfirmError(caught));
    }
  };

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
        {t('confirm.title')}
      </h2>
      <p className="mt-1 text-muted-foreground">{t('confirm.subtitle')}</p>

      <fieldset className="mt-6">
        <legend className="font-heading text-lg font-bold text-ink">{t('confirm.payTitle')}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {methods.map((value) => {
            const selected = method === value;
            const Icon = value === 'clinic' ? Store : CreditCard;
            return (
              <label
                key={value}
                className={cn(
                  'relative flex cursor-pointer gap-3 rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                  selected
                    ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
                    : 'border-border hover:border-primary/60',
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={selected}
                  onChange={() => setMethod(value)}
                  className="mt-1 size-4 accent-primary"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <Icon className="size-4 text-primary" aria-hidden />
                    {t(`confirm.methods.${value}.title`)}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {t(`confirm.methods.${value}.body`)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field className="mt-6">
        <FieldLabel htmlFor="booking-notes" className="text-ink">
          {t('confirm.notes')}
          <span className="font-normal text-muted-foreground"> {tForm('fields.optional')}</span>
        </FieldLabel>
        <Textarea
          id="booking-notes"
          rows={3}
          maxLength={NOTES_MAX}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t('confirm.notesPlaceholder')}
          className="min-h-24 resize-none border-field-border bg-card text-base"
        />
      </Field>

      <p className="mt-6 flex gap-3 rounded-lg bg-mist p-4 text-sm text-ink">
        <TimerReset className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <span>
          {t.rich('confirm.policy', {
            link: (chunks) => (
              <Link href="/refund-policy" className="font-semibold text-primary underline">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </p>

      {error === 'slot-taken' ? (
        <div
          role="alert"
          className="mt-5 flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-ink sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            {t('confirm.slotTaken')}
          </p>
          <button
            type="button"
            onClick={() =>
              state.update({ slot: undefined, with: undefined, step: 'time' }, { push: true })
            }
            className="inline-flex min-h-11 shrink-0 items-center font-semibold text-primary hover:underline"
          >
            {t('confirm.pickAnother')}
          </button>
        </div>
      ) : error === 'signed-out' ? (
        <SubmitErrorMessage>{t('confirm.signedOut')}</SubmitErrorMessage>
      ) : (
        error && <SubmitErrorMessage>{tForm(`errors.${error}`)}</SubmitErrorMessage>
      )}

      <StepNav
        onBack={() => state.goTo('details')}
        onNext={() => void confirm()}
        loading={isLoading}
        nextLabel={method === 'online' ? t('confirm.toPayment') : t('confirm.submit')}
      />
    </section>
  );
}
