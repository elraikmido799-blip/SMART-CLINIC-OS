'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { CircleCheck, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useCreateLeadMutation } from '@/api/leads.api';
import { brandButton } from '@/components/shared/brand';
import { FieldMessage, SubmitErrorMessage } from '@/components/shared/field-message';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { normalizeEgyptianMobile } from '@oxygen/shared';
import { isOffline, toSubmitError, type SubmitError } from '@/lib/submit-error';
import { cn } from '@/lib/utils';

const MESSAGE_MAX = 1000;

type LeadFormProps = {
  // بيتبعت مع الـLead عشان الـCRM يعرف الزائر جه منين (/contact · /offers/<slug> · /digital/<slug>)
  landingPage: string;
  // بادئة الـids عشان لو فيه فورمين في نفس الصفحة
  idPrefix: string;
  title: string;
  subtitle?: string;
  submitLabel: string;
  // خانة "رسالتك" (اختياري) — في "تواصل" بس
  withMessage?: boolean;
  // الدهبي لما الفورم هو الزرار الأساسي في الصفحة (العروض)، والتيل في الباقي
  tone?: 'primary' | 'gold';
  // "مهتم بإيه؟" (اختيار واحد إجباري). الاختيار بيتضاف للـlanding_page: /digital ← /digital/<value>
  interest?: { legend: string; options: { value: string; label: string }[]; defaultValue?: string };
};

/**
 * أي فورم Lead في الموقع ← الـCRM (useCreateLeadMutation) — DEC-36.
 * الحالات: بيتبعت (الزرار بيتقفل) · اتبعت (رسالة نجاح مكان الفورم) · خطأ (رسالة فوق الزرار، والكلام اللي اتكتب بيفضل).
 * الرقم بيتقبل بأي شكل (مسافات، +20، أرقام عربي) وبيتبعت "+201XXXXXXXXX".
 */
export function LeadForm({
  landingPage,
  idPrefix,
  title,
  subtitle,
  submitLabel,
  withMessage = false,
  tone = 'primary',
  interest,
}: LeadFormProps) {
  const t = useTranslations('leadForm');
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [sent, setSent] = useState(false);

  const hasInterest = Boolean(interest);
  const schema = useMemo(
    () =>
      z.object({
        full_name: z.string().trim().min(2, t('validation.name')),
        phone: z
          .string()
          .refine((value) => normalizeEgyptianMobile(value) !== null, t('validation.phone')),
        message: z
          .string()
          .trim()
          .max(MESSAGE_MAX, t('validation.messageMax', { max: MESSAGE_MAX })),
        interest: hasInterest ? z.string().min(1, t('validation.interest')) : z.string(),
      }),
    [t, hasInterest],
  );
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      phone: '',
      message: '',
      interest: interest?.defaultValue ?? '',
    },
  });

  const onSubmit = async (values: Values) => {
    setSubmitError(null);
    if (isOffline()) {
      setSubmitError('network');
      return;
    }
    try {
      await createLead({
        full_name: values.full_name,
        phone: normalizeEgyptianMobile(values.phone)!,
        message: values.message || undefined,
        landing_page: values.interest ? `${landingPage}/${values.interest}` : landingPage,
      }).unwrap();
      setSent(true);
      form.reset();
    } catch (error) {
      setSubmitError(toSubmitError(error));
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center"
      >
        <CircleCheck className="size-12 text-success" strokeWidth={1.5} aria-hidden />
        <h2 className="font-heading text-2xl font-bold text-ink">{t('success.title')}</h2>
        <p className="max-w-sm text-muted-foreground">{t('success.body')}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className={brandButton({ tone: 'outline', className: 'mt-2' })}
        >
          {t('success.again')}
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      aria-labelledby={`${idPrefix}-title`}
      className="rounded-2xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 id={`${idPrefix}-title`} className="font-heading text-2xl font-bold text-ink">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}

      <FieldGroup className="mt-6 gap-5">
        {interest && (
          <Controller
            name="interest"
            control={form.control}
            render={({ field, fieldState }) => (
              <fieldset
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? `${idPrefix}-interest-error` : undefined}
              >
                <legend className="mb-2 text-sm font-medium text-ink">{interest.legend}</legend>
                <div className="flex flex-wrap gap-2">
                  {interest.options.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                        field.value === option.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-field-border bg-card text-ink hover:border-primary',
                        fieldState.invalid && field.value !== option.value && 'border-destructive',
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        onBlur={field.onBlur}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div id={`${idPrefix}-interest-error`} className="mt-2">
                  <FieldMessage error={fieldState.error?.message} />
                </div>
              </fieldset>
            )}
          />
        )}
        <Controller
          name="full_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-name`} className="text-ink">
                {t('fields.name')}
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
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${idPrefix}-phone`} className="text-ink">
                {t('fields.phone')}
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
              <FieldDescription id={`${idPrefix}-phone-hint`}>
                {/* الرقم جوه <bdi dir="ltr"> عشان ميتقلبش في العربي (5678 1234 010) */}
                {t.rich('fields.phoneHint', {
                  num: (chunks) => <bdi dir="ltr">{chunks}</bdi>,
                })}
              </FieldDescription>
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        {withMessage && (
          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${idPrefix}-message`} className="text-ink">
                  {t('fields.message')}
                  <span className="font-normal text-muted-foreground"> {t('fields.optional')}</span>
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${idPrefix}-message`}
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  aria-invalid={fieldState.invalid}
                  className="min-h-28 resize-none border-field-border bg-card text-base"
                />
                <FieldMessage error={fieldState.error?.message} />
              </Field>
            )}
          />
        )}
      </FieldGroup>

      {submitError && <SubmitErrorMessage>{t(`errors.${submitError}`)}</SubmitErrorMessage>}

      <button
        type="submit"
        disabled={isLoading}
        className={brandButton({
          tone,
          size: 'lg',
          block: true,
          className: 'mt-6 disabled:opacity-70',
        })}
      >
        {isLoading && <Loader2 className="animate-spin" aria-hidden />}
        {isLoading ? t('sending') : submitLabel}
      </button>
      <p className="mt-3 text-center text-sm text-muted-foreground">{t('privacyNote')}</p>
    </form>
  );
}
