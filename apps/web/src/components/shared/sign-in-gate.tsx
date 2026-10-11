'use client';

import { useTranslations } from 'next-intl';
import { LockKeyhole } from 'lucide-react';
import { useGetMeQuery } from '@/api/auth.api';
import { Skeleton } from '@/components/ui/skeleton';
import { PhoneOtpForm } from './phone-otp-form';

/**
 * أي صفحة محتاجة دخول (الدفع · النجاح · البوابة): لو مش داخل، الدخول بيظهر مكانها
 * (رقم الموبايل + الكود) وبعده الصفحة نفسها بتظهر، من غير ما يروح لصفحة تانية ويرجع.
 */
export function SignInGate({ children, title }: { children: React.ReactNode; title?: string }) {
  const t = useTranslations('signInGate');
  const me = useGetMeQuery();

  if (me.isLoading) {
    return (
      <div aria-busy className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!me.isSuccess) {
    return (
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-mist text-primary">
            <LockKeyhole className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-ink">{title ?? t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('body')}</p>
        </div>
        <div className="mt-6">
          <PhoneOtpForm idPrefix="gate" submitLabel={t('submit')} onSignedIn={() => undefined} />
        </div>
      </div>
    );
  }

  return children;
}
