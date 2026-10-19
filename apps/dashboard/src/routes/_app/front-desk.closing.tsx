import { createFileRoute } from '@tanstack/react-router';
import { ClosingPage } from '@/features/billing/components/closing-page';

// تقفيل الخزنة (D-07 · docs/20 · 3.7)
export const Route = createFileRoute('/_app/front-desk/closing')({
  staticData: { nav: 'frontDesk' },
  component: ClosingPage,
});
