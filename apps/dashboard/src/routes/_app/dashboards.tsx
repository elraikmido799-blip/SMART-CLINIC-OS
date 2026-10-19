import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 8.1)
export const Route = createFileRoute('/_app/dashboards')({
  staticData: { nav: 'dashboards' },
  component: () => <ComingSoon nav="dashboards" step="8.1" />,
});
