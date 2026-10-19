'use client';

import { useTranslations } from 'next-intl';
import { CircleUserRound, Loader2 } from 'lucide-react';
import { useLogoutMutation } from '@/api/auth.api';
import { PhoneOtpForm } from '@/components/shared/phone-otp-form';
import { formatEgyptianMobile } from '@oxygen/shared';
import type { Me } from '@/types/auth';
import { StepNav } from './step-nav';
import type { BookingState } from './use-booking-state';

type StepDetailsProps = { state: BookingState; me: Me | undefined };

/**
 * الخطوة 4 — بياناتك. لو داخل: "هتحجز باسم …" + "مش إنت؟". لو مش داخل: الاسم والرقم ← كود OTP،
 * وأول ما الكود يتأكد بيروح للتأكيد على طول (الحساب بيتعمل لوحده للمريض الجديد).
 */
export function StepDetails({ state, me }: StepDetailsProps) {
  const t = useTranslations('booking');
  const [logout, loggingOut] = useLogoutMutation();
  const back = () => state.goTo('time');

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" className="font-heading text-2xl font-bold text-ink sm:text-3xl">
        {t('details.title')}
      </h2>
      <p className="mt-1 text-muted-foreground">
        {me ? t('details.signedInSubtitle') : t('details.subtitle')}
      </p>

      <div className="mt-6 max-w-xl">
        {me ? (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <CircleUserRound
              className="size-12 shrink-0 text-primary"
              strokeWidth={1.25}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{me.full_name || t('details.noName')}</p>
              <p className="text-sm text-muted-foreground">
                <bdi dir="ltr">{formatEgyptianMobile(me.phone)}</bdi>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loggingOut.isLoading}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {loggingOut.isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {t('details.notYou')}
            </button>
          </div>
        ) : (
          <PhoneOtpForm
            idPrefix="booking"
            askName
            tone="gold"
            submitLabel={t('details.verify')}
            onSignedIn={() => state.update({ step: 'confirm' }, { push: true })}
          />
        )}
      </div>

      <StepNav onBack={back} onNext={me ? () => state.goTo('confirm') : undefined} />
    </section>
  );
}
