import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// تقفيل الخزنة (D-07 · docs/20 · 3.7)
export const Route = createFileRoute('/_app/front-desk/closing')({
  staticData: { nav: 'frontDesk' },
  component: () => <ComingSoon nav="frontDesk" step="3.7" />,
});
