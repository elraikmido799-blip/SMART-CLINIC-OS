import { createFileRoute } from '@tanstack/react-router';
import { InvoicesPage } from '@/features/billing/components/invoices-page';

// الفواتير والمدفوعات (D-26 · docs/20 · 7.3). موافقات المرتجعات في /billing/refunds (7.4)
export const Route = createFileRoute('/_app/billing/')({
  staticData: { nav: 'billing' },
  component: InvoicesPage,
});
