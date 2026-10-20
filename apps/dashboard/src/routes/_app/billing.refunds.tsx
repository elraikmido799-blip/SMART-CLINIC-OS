import { createFileRoute } from '@tanstack/react-router';
import { RefundsPage } from '@/features/billing/components/refunds-page';

// موافقات المرتجعات (D-27 · docs/20 · 7.4): جوه قسم الحسابات
export const Route = createFileRoute('/_app/billing/refunds')({
  staticData: { nav: 'billing' },
  component: RefundsPage,
});
