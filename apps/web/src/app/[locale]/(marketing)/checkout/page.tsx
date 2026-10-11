import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ClientMessages } from '@/components/client-messages';
import { Container } from '@/components/shared/container';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckoutView } from './_components/checkout-view';

// صفحات الدفع مش بتظهر في جوجل (16 · 7.1)
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkout');
  return { title: t('title'), robots: { index: false, follow: false } };
}

/** الدفع W-16 (16 · 5.2). كله في المتصفح: الحجز بتاع المريض اللي داخل (?booking=). */
export default function CheckoutPage() {
  return (
    <Container className="py-10 lg:py-14">
      <ClientMessages namespaces={['checkout', 'bookingDetails', 'otp', 'signInGate']}>
        <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
          <CheckoutView />
        </Suspense>
      </ClientMessages>
    </Container>
  );
}
