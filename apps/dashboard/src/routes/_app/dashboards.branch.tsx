import { createFileRoute } from '@tanstack/react-router';
import { BranchPage } from '@/features/dashboards/components/branch-page';

// داشبورد الفرع (D-29 · docs/20 · 8.2)
export const Route = createFileRoute('/_app/dashboards/branch')({
  staticData: { nav: 'dashboards' },
  component: BranchPage,
});
