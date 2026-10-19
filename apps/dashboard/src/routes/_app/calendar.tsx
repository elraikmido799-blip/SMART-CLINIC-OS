import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 3.2)
export const Route = createFileRoute('/_app/calendar')({
  staticData: { nav: 'calendar' },
  component: () => <ComingSoon nav="calendar" step="3.2" />,
});
