import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 6.1)
export const Route = createFileRoute('/_app/crm')({
  staticData: { nav: 'crm' },
  component: () => <ComingSoon nav="crm" step="6.1" />,
});
