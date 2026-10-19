import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 4.1)
export const Route = createFileRoute('/_app/patients')({
  staticData: { nav: 'patients' },
  component: () => <ComingSoon nav="patients" step="4.1" />,
});
