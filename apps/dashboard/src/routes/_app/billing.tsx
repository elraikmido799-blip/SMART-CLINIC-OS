import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 7.3)
export const Route = createFileRoute('/_app/billing')({
  staticData: { nav: 'billing' },
  component: () => <ComingSoon nav="billing" step="7.3" />,
});
