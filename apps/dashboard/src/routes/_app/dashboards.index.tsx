import { createFileRoute } from '@tanstack/react-router';
import { useCan } from '@/features/auth/use-me';
import { BranchPage } from '@/features/dashboards/components/branch-page';
import { ExecutivePage } from '@/features/dashboards/components/executive-page';

// داشبورد الـCEO (D-28 · docs/20 · 8.1). داشبورد الفرع والـFunnel في 8.2 و8.3
export const Route = createFileRoute('/_app/dashboards/')({
  staticData: { nav: 'dashboards' },
  component: DashboardsHome,
});

// الـCEO ومدير العمليات (كل الفروع) بيبدأوا بالتنفيذي، ومدير الفرع بداشبورد فرعه
function DashboardsHome() {
  return useCan('dashboards.all') ? <ExecutivePage /> : <BranchPage />;
}
