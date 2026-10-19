'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { CircleCheck, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useRequestAccountDeletionMutation } from '@/api/account-deletion.api';
import { brandButton } from '@/components/shared/brand';
import { FieldMessage, SubmitErrorMessage } from '@/components/shared/field-message';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { normalizeEgyptianMobile } from '@oxygen/shared';
import { isOffline, toSubmitError, type SubmitError } from '@/lib/submit-error';

const REASON_MAX = 500;

/**
 * طلب حذف الحساب من غير Login (Google Play وApp Store طالبين صفحة زي دي).
 * نفس طريقة الفورمات (DEC-36): الخانات ورسايلها من leadForm، و"أنا فاهم" إجباري قبل الإرسال.
 */
export function DeleteAccountForm() {
  const t = useTranslations('deleteAccount');
  const tForm = useTranslations('leadForm');
  const [requestDeletion, { isLoading }] = useRequestAccountDeletionMutation();
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [sent, setSent] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        full_name: z.string().trim().min(2, tForm('validation.name')),
        phone: z
          .string()
          .refine((value) => normalizeEgyptianMobile(value) !== null, tForm('validation.phone')),
        reason: z
          .string()
          .trim()
          .max(REASON_MAX, tForm('validation.messageMax', { max: REASON_MAX })),
        confirm: z.boolean().refine(Boolean, t('confirmRequired')),
      }),
    [t, tForm],
  );
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', reason: '', confirm: false },
  });

  const onSubmit = async (values: Values) => {
    setSubmitError(null);
    if (isOffline()) {
      setSubmitError('network');
      return;
    }
    try {
      await requestDeletion({
        full_name: values.full_name,
        phone: normalizeEgyptianMobile(values.phone)!,
        reason: values.reason || undefined,
      }).unwrap();
      setSent(true);
    } catch (error) {
      setSubmitError(toSubmitError(error));
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center"
      >
        <CircleCheck className="size-12 text-success" strokeWidth={1.5} aria-hidden />
        <h2 className="font-heading text-2xl font-bold text-ink">{t('successTitle')}</h2>
        <p className="max-w-sm text-muted-foreground">{t('successBody')}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      aria-labelledby="delete-title"
      className="mt-10 max-w-prose rounded-2xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 id="delete-title" className="font-heading text-2xl font-bold text-ink">
        {t('formTitle')}
      </h2>
      <p className="mt-1 text-muted-foreground">{t('formSubtitle')}</p>

      <FieldGroup className="mt-6 gap-5">
        <Controller
          name="full_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="delete-name" className="text-ink">
                {tForm('fields.name')}
              </FieldLabel>
              <Input
                {...field}
                id="delete-name"
                autoComplete="name"
                aria-invalid={fieldState.invalid}
                className="h-11 border-field-border bg-card text-base"
              />
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="delete-phone" className="text-ink">
                {t('phoneLabel')}
              </FieldLabel>
              <Input
                {...field}
                id="delete-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="01X XXXX XXXX"
                aria-invalid={fieldState.invalid}
                aria-describedby="delete-phone-hint"
                className="h-11 border-field-border bg-card text-base rtl:text-right"
              />
              <FieldDescription id="delete-phone-hint">
                {tForm.rich('fields.phoneHint', {
                  num: (chunks) => <bdi dir="ltr">{chunks}</bdi>,
                })}
              </FieldDescription>
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="delete-reason" className="text-ink">
                {t('reasonLabel')}
                <span className="font-normal text-muted-foreground">
                  {' '}
                  {tForm('fields.optional')}
                </span>
              </FieldLabel>
              <Textarea
                {...field}
                id="delete-reason"
                rows={3}
                maxLength={REASON_MAX}
                aria-invalid={fieldState.invalid}
                className="min-h-24 resize-none border-field-border bg-card text-base"
              />
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        <Controller
          name="confirm"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="delete-confirm"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  className="mt-0.5 size-5"
                />
                <FieldLabel htmlFor="delete-confirm" className="leading-snug font-normal text-ink">
                  {t('confirm')}
                </FieldLabel>
              </div>
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
      </FieldGroup>

      {submitError && <SubmitErrorMessage>{tForm(`errors.${submitError}`)}</SubmitErrorMessage>}

      <button
        type="submit"
        disabled={isLoading}
        className={brandButton({
          tone: 'primary',
          size: 'lg',
          block: true,
          className: 'mt-6 disabled:opacity-70',
        })}
      >
        {isLoading && <Loader2 className="animate-spin" aria-hidden />}
        {isLoading ? tForm('sending') : t('submit')}
      </button>
    </form>
  );
}
