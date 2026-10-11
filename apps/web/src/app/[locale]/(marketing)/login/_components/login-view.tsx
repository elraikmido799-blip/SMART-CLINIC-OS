'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LOCALES } from '@oxygen/shared';
import { CircleUserRound, Loader2 } from 'lucide-react';
import { useGetMeQuery, useLogoutMutation } from '@/api/auth.api';
import { brandButton } from '@/components/shared/brand';
import { PhoneOtpForm } from '@/components/shared/phone-otp-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useRouter } from '@/i18n/navigation';
import { formatEgyptianMobile } from '@/lib/phone';

// ?next= لازم يبقى صفحة جوه الموقع (مش لينك بره) — غير كده بيروح البوابة.
// اللغة بتتشال من أوله لو موجودة (/ar/faqs ← /faqs)، لأن الـRouter بيحطها لوحده (P-22)
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/portal';
  const prefix = LOCALES.find(
    (locale) => value === `/${locale}` || value.startsWith(`/${locale}/`),
  );
  return prefix ? value.slice(prefix.length + 1) || '/' : value;
}

/**
 * الدخول W-17: رقم الموبايل ← الكود ← البوابة (أو الصفحة اللي جه منها ?next=).
 * لو داخل خلاص: "إنت داخل باسم …" + البوابة + خروج.
 */
export function LoginView() {
  const t = useTranslations('login');
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const me = useGetMeQuery();
  const [logout, loggingOut] = useLogoutMutation();

  if (me.isLoading) {
    return (
      <div aria-busy className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (me.data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
        <CircleUserRound className="mx-auto size-14 text-primary" strokeWidth={1.25} aria-hidden />
        <h1 className="mt-3 font-heading text-2xl font-bold text-ink">
          {t('signedInTitle', { name: me.data.full_name || t('patient') })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          <bdi dir="ltr">{formatEgyptianMobile(me.data.phone)}</bdi>
        </p>
        <Link
          href={next}
          className={brandButton({ tone: 'primary', size: 'lg', block: true, className: 'mt-6' })}
        >
          {t('toPortal')}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={loggingOut.isLoading}
          className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
        >
          {loggingOut.isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {t('signOut')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      <div className="mt-6">
        <PhoneOtpForm
          idPrefix="login"
          submitLabel={t('submit')}
          onSignedIn={() => router.replace(next)}
        />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.rich('newHere', {
          book: (chunks) => (
            <Link href="/book" className="font-semibold text-primary hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
