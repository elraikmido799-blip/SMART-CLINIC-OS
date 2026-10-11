import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';
import { PackagesView } from '../_components/packages-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('portal.nav');
  return { title: t('packages') };
}

// PP-06 · 6.6 (16)
export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <PackagesView />
    </Suspense>
  );
}
