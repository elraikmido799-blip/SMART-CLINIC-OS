import { createFileRoute } from '@tanstack/react-router';
import { ComingSoon } from '@/components/coming-soon';

// مكان مؤقت لحد ما الشاشة تتبني (docs/20 · 7.1)
export const Route = createFileRoute('/_app/catalog')({
  staticData: { nav: 'catalog' },
  component: () => <ComingSoon nav="catalog" step="7.1" />,
});
