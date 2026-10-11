import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/shared/container';
import { Skeleton } from '@/components/ui/skeleton';
import { ResultView } from '../_components/result-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkoutResult');
  return { title: t('successTitle'), robots: { index: false, follow: false } };
}

export default function CheckoutSuccessPage() {
  return (
    <Container className="py-10 lg:py-14">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-2xl rounded-2xl" />}>
        <ResultView outcome="success" />
      </Suspense>
    </Container>
  );
}
