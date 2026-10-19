import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 3.4)
export const Route = createFileRoute('/_app/front-desk')({
  staticData: { nav: 'frontDesk' },
  component: () => <ComingSoon nav="frontDesk" step="3.4" />,
});
