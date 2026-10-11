'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Download, Loader2, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { z } from 'zod';
import { brandButton } from '@/components/shared/brand';
import { FieldMessage } from '@/components/shared/field-message';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Link, useRouter } from '@/i18n/navigation';
import { todayInCairo } from '@/lib/dates';
import { formatEgyptianMobile } from '@/lib/phone';
import { cn } from '@/lib/utils';
import type { Consents, Profile } from '@/types/portal';
import {
  useDeleteMyAccountMutation,
  useGetProfileQuery,
  useRequestDataExportMutation,
  useUpdateProfileMutation,
} from '../_api/account.api';
import { PageHeader } from './page-header';
import { QueryError } from './query-error';

const CONSENTS: (keyof Consents)[] = [
  'reminders_whatsapp',
  'offers_whatsapp',
  'offers_sms',
  'progress_photos',
];

/**
 * البروفايل والخصوصية PP-08: البيانات (فورم) · الموافقات (Switch بيتحفظ على طول) · تصدير البيانات · حذف الحساب.
 * الرقم مش بيتغير من هنا (هو اللي بتدخل بيه) — "كلمنا".
 */
export function ProfileView() {
  const t = useTranslations('portal.profile');
  const profile = useGetProfileQuery();

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      {profile.isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : profile.isError || !profile.data ? (
        <QueryError onRetry={profile.refetch} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr] xl:items-start">
          <DetailsForm profile={profile.data} />
          <div className="space-y-6">
            <ConsentsCard consents={profile.data.consents} />
            <PrivacyCard />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsForm({ profile }: { profile: Profile }) {
  const t = useTranslations('portal.profile');
  const tForm = useTranslations('leadForm');
  const [update, { isLoading }] = useUpdateProfileMutation();
  const schema = useMemo(
    () =>
      z.object({
        full_name: z.string().trim().min(2, tForm('validation.name')),
        email: z.union([z.literal(''), z.email(t('emailInvalid'))]),
        birth_date: z.union([z.literal(''), z.iso.date()]),
        gender: z.union([z.literal(''), z.enum(['female', 'male'])]),
      }),
    [t, tForm],
  );
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name,
      email: profile.email ?? '',
      birth_date: profile.birth_date ?? '',
      gender: profile.gender ?? '',
    },
  });

  const onSubmit = async (values: Values) => {
    try {
      await update({
        full_name: values.full_name.trim(),
        email: values.email || null,
        birth_date: values.birth_date || null,
        gender: values.gender || null,
      }).unwrap();
      form.reset(values);
      toast.success(t('saved'));
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      aria-labelledby="details-title"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 id="details-title" className="flex items-center gap-2 font-semibold text-ink">
        <UserRound className="size-5 text-primary" aria-hidden />
        {t('details')}
      </h2>
      <FieldGroup className="mt-5 gap-5">
        <Controller
          name="full_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-name" className="text-ink">
                {tForm('fields.name')}
              </FieldLabel>
              <Input
                {...field}
                id="profile-name"
                autoComplete="name"
                aria-invalid={fieldState.invalid}
                className="h-11 border-field-border bg-card text-base"
              />
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="profile-phone" className="text-ink">
            {tForm('fields.phone')}
          </FieldLabel>
          <Input
            id="profile-phone"
            value={formatEgyptianMobile(profile.phone)}
            readOnly
            dir="ltr"
            aria-describedby="profile-phone-hint"
            className="h-11 border-dashed border-field-border bg-transparent text-base text-muted-foreground rtl:text-right"
          />
          <FieldDescription id="profile-phone-hint">
            {t.rich('phoneHint', {
              link: (chunks) => (
                <Link href="/contact" className="font-semibold text-primary underline">
                  {chunks}
                </Link>
              ),
            })}
          </FieldDescription>
        </Field>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-email" className="text-ink">
                {t('email')}{' '}
                <span className="font-normal text-muted-foreground">
                  {tForm('fields.optional')}
                </span>
              </FieldLabel>
              <Input
                {...field}
                id="profile-email"
                type="email"
                autoComplete="email"
                dir="ltr"
                aria-invalid={fieldState.invalid}
                className="h-11 border-field-border bg-card text-base rtl:text-right"
              />
              <FieldMessage error={fieldState.error?.message} />
            </Field>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="birth_date"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="profile-birth" className="text-ink">
                  {t('birthDate')}{' '}
                  <span className="font-normal text-muted-foreground">
                    {tForm('fields.optional')}
                  </span>
                </FieldLabel>
                <Input
                  {...field}
                  id="profile-birth"
                  type="date"
                  max={todayInCairo()}
                  className="h-11 border-field-border bg-card text-base"
                />
              </Field>
            )}
          />
          <Controller
            name="gender"
            control={form.control}
            render={({ field }) => (
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-ink">
                  {t('gender')}{' '}
                  <span className="font-normal text-muted-foreground">
                    {tForm('fields.optional')}
                  </span>
                </legend>
                <div className="flex gap-2">
                  {(['female', 'male'] as const).map((value) => (
                    <label
                      key={value}
                      className={cn(
                        'inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                        field.value === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-field-border bg-card text-ink hover:border-primary',
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        className="sr-only"
                      />
                      {t(`genders.${value}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          />
        </div>
      </FieldGroup>
      <button
        type="submit"
        disabled={isLoading || !form.formState.isDirty}
        className={brandButton({
          tone: 'primary',
          size: 'lg',
          className: 'mt-6 disabled:opacity-60',
        })}
      >
        {isLoading && <Loader2 className="animate-spin" aria-hidden />}
        {t('save')}
      </button>
    </form>
  );
}

function ConsentsCard({ consents }: { consents: Consents }) {
  const t = useTranslations('portal.profile');
  const [update] = useUpdateProfileMutation();

  const toggle = async (key: keyof Consents, value: boolean) => {
    try {
      await update({ consents: { [key]: value } }).unwrap();
      toast.success(t('consentSaved'));
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  return (
    <section
      aria-labelledby="consents-title"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 id="consents-title" className="flex items-center gap-2 font-semibold text-ink">
        <ShieldCheck className="size-5 text-primary" aria-hidden />
        {t('consents')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('consentsHint')}</p>
      <ul className="mt-4 divide-y divide-border">
        {CONSENTS.map((key) => (
          <li key={key} className="flex items-center justify-between gap-4 py-3">
            <label htmlFor={`consent-${key}`} className="cursor-pointer">
              <span className="block font-medium text-ink">{t(`consentItems.${key}.title`)}</span>
              <span className="block text-sm text-muted-foreground">
                {t(`consentItems.${key}.body`)}
              </span>
            </label>
            <Switch
              id={`consent-${key}`}
              checked={consents[key]}
              onCheckedChange={(value) => void toggle(key, value)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PrivacyCard() {
  const t = useTranslations('portal.profile');
  const router = useRouter();
  const [exportData, exporting] = useRequestDataExportMutation();
  const [deleteAccount, deleting] = useDeleteMyAccountMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const requestExport = async () => {
    try {
      await exportData().unwrap();
      toast.success(t('exportRequested'));
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  const removeAccount = async () => {
    try {
      await deleteAccount().unwrap();
      toast.success(t('deleted'));
      router.replace('/');
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  return (
    <section
      aria-labelledby="privacy-title"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 id="privacy-title" className="font-semibold text-ink">
        {t('privacy')}
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <p className="font-medium text-ink">{t('exportTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('exportBody')}</p>
          <button
            type="button"
            onClick={() => void requestExport()}
            disabled={exporting.isLoading}
            className={brandButton({ tone: 'outline', className: 'mt-3' })}
          >
            {exporting.isLoading ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Download aria-hidden />
            )}
            {t('exportCta')}
          </button>
        </div>
        <div className="border-t border-border pt-4">
          <p className="font-medium text-ink">{t('deleteTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('deleteBody')}</p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-md border border-destructive px-5 text-sm font-semibold text-ink hover:bg-destructive/5 [&_svg]:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
            {t('deleteCta')}
          </button>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(value) => {
          setConfirmOpen(value);
          if (!value) setUnderstood(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('deleteConfirmBody')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <Checkbox
              id="delete-understood"
              checked={understood}
              onCheckedChange={(value) => setUnderstood(value === true)}
              className="mt-0.5 size-5"
            />
            <label htmlFor="delete-understood" className="text-sm text-ink">
              {t('deleteUnderstood')}
            </label>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className={brandButton({ tone: 'primary' })}
            >
              {t('keepAccount')}
            </button>
            <button
              type="button"
              disabled={!understood || deleting.isLoading}
              onClick={() => void removeAccount()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-destructive px-5 text-sm font-semibold text-ink hover:bg-destructive/5 disabled:opacity-50"
            >
              {deleting.isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {t('deleteForever')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
