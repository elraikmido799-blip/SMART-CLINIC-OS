'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, PencilLine, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/api/auth.api';
import { brandButton } from '@/components/shared/brand';
import { FieldMessage, SubmitErrorMessage } from '@/components/shared/field-message';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Link } from '@/i18n/navigation';
import { env } from '@/lib/env';
import { formatEgyptianMobile, normalizeEgyptianMobile } from '@/lib/phone';
import { isOffline, toSubmitError, type SubmitError } from '@/lib/submit-error';
import type { Me } from '@/types/auth';

const CODE_LENGTH = 6;

type PhoneOtpFormProps = {
  // بادئة الـids (لو فيه فورمين في الصفحة)
  idPrefix: string;
  // في الحجز بنسأل عن الاسم (مريض جديد)، وفي صفحة الدخول لأ
  askName?: boolean;
  submitLabel: string;
  onSignedIn: (me: Me) => void;
};

type CodeError = 'wrong' | SubmitError;

function toCodeError(error: unknown): CodeError {
  const code = (error as { data?: { code?: string } } | null)?.data?.code;
  if (code === 'INVALID_CODE' || code === 'OTP_NOT_REQUESTED') return 'wrong';
  return toSubmitError(error);
}

/**
 * الدخول برقم الموبايل (W-17) على مرحلتين: الرقم (والاسم) ← كود من 6 أرقام.
 * الكود بيتبعت لوحده أول ما الـ6 أرقام يكتملوا، و"ابعت الكود تاني" بعداد.
 * في الحجز (خطوة "بياناتك") وفي صفحة الدخول. في الـMocks الكود 123456، وبيظهر تحت الخانة.
 */
export function PhoneOtpForm({
  idPrefix,
  askName = false,
  submitLabel,
  onSignedIn,
}: PhoneOtpFormProps) {
  const t = useTranslations('otp');
  const tForm = useTranslations('leadForm');
  const [sendOtp, sending] = useSendOtpMutation();
  const [verifyOtp, verifying] = useVerifyOtpMutation();
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sendError, setSendError] = useState<SubmitError | null>(null);
  const [codeError, setCodeError] = useState<CodeError | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // عداد "ابعت الكود تاني": بينقص ثانية كل ثانية لحد الصفر
  useEffect(() => {
    if (!phone) return;
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [phone]);

  const schema = useMemo(
    () =>
      z.object({
        full_name: askName ? z.string().trim().min(2, tForm('validation.name')) : z.string(),
        phone: z
          .string()
          .refine((value) => normalizeEgyptianMobile(value) !== null, tForm('validation.phone')),
      }),
    [askName, tForm],
  );
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '' },
  });

  const requestCode = async (target: string) => {
    setSendError(null);
    setCodeError(null);
    if (isOffline()) {
      setSendError('network');
      return false;
    }
    try {
      const result = await sendOtp({ phone: target }).unwrap();
      setSecondsLeft(result.resend_after_seconds);
      return true;
    } catch (error) {
      setSendError(toSubmitError(error));
      return false;
    }
  };

  const onSubmitPhone = async (values: Values) => {
    const normalized = normalizeEgyptianMobile(values.phone)!;
    if (await requestCode(normalized)) {
      setPhone(normalized);
      setName(values.full_name);
      setCode('');
    }
  };

  const submitCode = async (value: string) => {
    if (!phone || value.length !== CODE_LENGTH) return;
    setCodeError(null);
    try {
      const me = await verifyOtp({
        phone,
        code: value,
        ...(askName && { full_name: name }),
      }).unwrap();
      onSignedIn(me);
    } catch (error) {
      setCodeError(toCodeError(error));
      setCode('');
    }
  };

  if (phone) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-mist text-primary">
          <ShieldCheck className="size-6" aria-hidden />
        </span>
        <h3 className="mt-4 font-heading text-xl font-bold text-ink">{t('codeTitle')}</h3>
        <p className="mt-1 text-muted-foreground">
          {t.rich('codeSent', {
            phone: () => (
              <bdi dir="ltr" className="font-semibold text-ink">
                {formatEgyptianMobile(phone)}
              </bdi>
            ),
          })}{' '}
          <button
            type="button"
            onClick={() => {
              setPhone(null);
              setCodeError(null);
            }}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <PencilLine className="size-4" aria-hidden />
            {t('changeNumber')}
          </button>
        </p>

        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submitCode(code);
          }}
        >
          <label htmlFor={`${idPrefix}-code`} className="text-sm font-medium text-ink">
            {t('codeLabel')}
          </label>
          <div dir="ltr" className="mt-2 flex justify-start rtl:justify-end">
            <InputOTP
              id={`${idPrefix}-code`}
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(value) => {
                setCode(value);
                if (value.length === CODE_LENGTH) void submitCode(value);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              disabled={verifying.isLoading}
              aria-invalid={codeError === 'wrong'}
              aria-describedby={`${idPrefix}-code-hint`}
            >
              <InputOTPGroup>
                {Array.from({ length: CODE_LENGTH }, (_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    aria-invalid={codeError === 'wrong'}
                    className="size-12 bg-card text-lg font-semibold text-ink sm:size-14"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p id={`${idPrefix}-code-hint`} className="mt-2 text-sm text-muted-foreground">
            {env.apiMocking ? t('demoHint', { code: '123456' }) : t('codeHint')}
          </p>
          {codeError && (
            <div className="mt-3">
              {codeError === 'wrong' ? (
                <FieldMessage error={t('wrongCode')} />
              ) : (
                <SubmitErrorMessage>{tForm(`errors.${codeError}`)}</SubmitErrorMessage>
              )}
            </div>
          )}
          {sendError && <SubmitErrorMessage>{tForm(`errors.${sendError}`)}</SubmitErrorMessage>}

          <button
            type="submit"
            disabled={code.length !== CODE_LENGTH || verifying.isLoading}
            className={brandButton({
              tone: 'gold',
              size: 'lg',
              block: true,
              className: 'mt-6 disabled:cursor-not-allowed disabled:opacity-60',
            })}
          >
            {verifying.isLoading && <Loader2 className="animate-spin" aria-hidden />}
            {verifying.isLoading ? t('verifying') : submitLabel}
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
            {secondsLeft > 0 ? (
              t('resendIn', { seconds: secondsLeft })
            ) : (
              <button
                type="button"
                onClick={() => void requestCode(phone)}
                disabled={sending.isLoading}
                className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
              >
                {t('resend')}
              </button>
            )}
          </p>
        </form>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmitPhone)}
      className="rounded-2xl border border-border bg-card p-5 sm:p-8"
    >
      <FieldGroup className="gap-5">
        {askName && (
          <Controller
            name="full_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${idPrefix}-name`} className="text-ink">
                  {tForm('fields.name')}
                </FieldLabel>
                <Input
                  {...field}
                  id={`${idPrefix}-name`}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  className="h-11 border-field-border bg-card text-base"
                />
                <FieldMessage error={fieldState.error?.message} />
              </Field>
            )}
          />
        )}
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-phone`} className="text-ink">
                {tForm('fields.phone')}
              </FieldLabel>
              <Input
                {...field}
                id={`${idPrefix}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="01X XXXX XXXX"
                aria-invalid={fieldState.invalid}
                aria-describedby={`${idPrefix}-phone-hint`}
                className="h-11 border-field-border bg-card text-base rtl:text-right"
              />
              <FieldDescription id={`${idPrefix}-phone-hint`}>{t('phoneHint')}</FieldDescription>
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
      </FieldGroup>

      {sendError && <SubmitErrorMessage>{tForm(`errors.${sendError}`)}</SubmitErrorMessage>}

      <button
        type="submit"
        disabled={sending.isLoading}
        className={brandButton({
          tone: 'gold',
          size: 'lg',
          block: true,
          className: 'mt-6 disabled:opacity-70',
        })}
      >
        {sending.isLoading && <Loader2 className="animate-spin" aria-hidden />}
        {sending.isLoading ? tForm('sending') : t('sendCode')}
      </button>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        {t.rich('agree', {
          terms: (chunks) => (
            <Link href="/terms" className="font-semibold text-primary hover:underline">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
