import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 5.1)
export const Route = createFileRoute('/_app/programs')({
  staticData: { nav: 'programs' },
  component: () => <ComingSoon nav="programs" step="5.1" />,
});
