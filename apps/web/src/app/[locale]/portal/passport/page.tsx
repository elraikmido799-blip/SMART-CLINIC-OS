import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';
import { PassportView } from '../_components/passport-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('portal.nav');
  return { title: t('passport') };
}

// PP-03 · 6.3 (16)
export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <PassportView />
    </Suspense>
  );
}
