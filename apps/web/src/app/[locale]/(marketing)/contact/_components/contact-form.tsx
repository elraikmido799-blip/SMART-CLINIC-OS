'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useCreateLeadMutation } from '@/api/leads.api';
import { brandButton } from '@/components/shared/brand';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { normalizeEgyptianMobile } from '@/lib/phone';

const MESSAGE_MAX = 1000;

// كل الأخطاء اللي ممكن ترجع من POST /public/leads، وكل واحد ليه رسالة في contactPage.errors
type SubmitError = 'network' | 'rate-limited' | 'invalid' | 'server';

function toSubmitError(error: unknown): SubmitError {
  const status = (error as { status?: unknown } | null)?.status;
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') return 'network';
  if (status === 429) return 'rate-limited';
  if (status === 400 || status === 422) return 'invalid';
  return 'server';
}

/**
 * رسالة الخطأ تحت الخانة: الكلام بالكحلي وجنبه أيقونة حمرا، لأن الأحمر (#E5484D) على الأبيض
 * contrast بتاعه 3.9 بس، وده أقل من AA للكلام الصغير (4.5).
 */
function FieldMessage({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-ink">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      {error}
    </p>
  );
}

/**
 * فورم "تواصل" ← Lead في الـCRM (useCreateLeadMutation).
 * الحالات: بيتبعت (الزرار بيتقفل) · اتبعت (رسالة نجاح مكان الفورم) · خطأ (رسالة فوق الزرار، والكلام اللي اتكتب بيفضل).
 * الرقم بيتقبل بأي شكل (مسافات، +20، أرقام عربي) وبيتبعت "+201XXXXXXXXX".
 */
export function ContactForm() {
  const t = useTranslations('contactPage');
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [sent, setSent] = useState(false);

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
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', message: '' },
  });

  const onSubmit = async (values: Values) => {
    setSubmitError(null);
    // النت مقطوع: منبعتش أصلًا، والكلام يفضل
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSubmitError('network');
      return;
    }
    try {
      await createLead({
        full_name: values.full_name,
        phone: normalizeEgyptianMobile(values.phone)!,
        message: values.message || undefined,
        landing_page: '/contact',
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
      aria-labelledby="contact-form-title"
      className="rounded-2xl border border-border bg-card p-5 sm:p-8"
    >
      <h2 id="contact-form-title" className="font-heading text-2xl font-bold text-ink">
        {t('formTitle')}
      </h2>
      <p className="mt-1 text-muted-foreground">{t('formSubtitle')}</p>

      <FieldGroup className="mt-6 gap-5">
        <Controller
          name="full_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-name" className="text-ink">
                {t('fields.name')}
              </FieldLabel>
              <Input
                {...field}
                id="contact-name"
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
              <FieldLabel htmlFor="contact-phone" className="text-ink">
                {t('fields.phone')}
              </FieldLabel>
              <Input
                {...field}
                id="contact-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="01X XXXX XXXX"
                aria-invalid={fieldState.invalid}
                aria-describedby="contact-phone-hint"
                className="h-11 border-field-border bg-card text-base rtl:text-right"
              />
              <FieldDescription id="contact-phone-hint">
                {/* الرقم جوه <bdi dir="ltr"> عشان ميتقلبش في العربي (5678 1234 010) */}
                {t.rich('fields.phoneHint', {
                  num: (chunks) => <bdi dir="ltr">{chunks}</bdi>,
                })}
              </FieldDescription>
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-message" className="text-ink">
                {t('fields.message')}
                <span className="font-normal text-muted-foreground"> {t('fields.optional')}</span>
              </FieldLabel>
              <Textarea
                {...field}
                id="contact-message"
                rows={4}
                maxLength={MESSAGE_MAX}
                aria-invalid={fieldState.invalid}
                className="min-h-28 border-field-border bg-card text-base"
              />
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
      </FieldGroup>

      {submitError && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-ink"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          {t(`errors.${submitError}`)}
        </p>
      )}

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
        {isLoading ? t('sending') : t('send')}
      </button>
      <p className="mt-3 text-center text-sm text-muted-foreground">{t('privacyNote')}</p>
    </form>
  );
}
