import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 9.1)
export const Route = createFileRoute('/_app/content')({
  staticData: { nav: 'content' },
  component: () => <ComingSoon nav="content" step="9.1" />,
});
