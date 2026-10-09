'use client';

import { useTransition } from 'react';
import { RotateCw } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { brandButton } from './brand';

// بيطلب داتا الصفحة من السيرفر تاني من غير Reload كامل
export function RetryButton({ label }: { label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className={cn(brandButton({ tone: 'outline' }), 'disabled:opacity-60')}
    >
      <RotateCw className={cn(isPending && 'animate-spin')} aria-hidden />
      {label}
    </button>
  );
}
