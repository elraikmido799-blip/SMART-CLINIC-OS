import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 4.3)
export const Route = createFileRoute('/_app/clinical')({
  staticData: { nav: 'clinical' },
  component: () => <ComingSoon nav="clinical" step="4.3" />,
});
