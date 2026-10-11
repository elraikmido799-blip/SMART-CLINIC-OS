import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoicesView } from '../_components/invoices-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('portal.nav');
  return { title: t('invoices') };
}

// PP-07 · 6.7 (16)
export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <InvoicesView />
    </Suspense>
  );
}
