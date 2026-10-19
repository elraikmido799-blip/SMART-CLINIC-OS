import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 8.4)
export const Route = createFileRoute('/_app/reports')({
  staticData: { nav: 'reports' },
  component: () => <ComingSoon nav="reports" step="8.4" />,
});
