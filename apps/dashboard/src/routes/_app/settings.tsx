import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 9.3)
export const Route = createFileRoute('/_app/settings')({
  staticData: { nav: 'settings' },
  component: () => <ComingSoon nav="settings" step="9.3" />,
});
