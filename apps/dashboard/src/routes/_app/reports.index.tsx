import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/features/reports/components/reports-page';

// التقارير والتصدير (D-32 · docs/20 · 8.4)
export const Route = createFileRoute('/_app/reports/')({
  staticData: { nav: 'reports' },
  component: ReportsPage,
});
