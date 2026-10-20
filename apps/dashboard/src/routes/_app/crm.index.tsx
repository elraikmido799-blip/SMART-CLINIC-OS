import { createFileRoute } from '@tanstack/react-router';
import { CrmPage } from '@/features/crm/components/crm-page';
import { useCan } from '@/features/auth/use-me';
import { TasksPage } from '@/features/tasks/components/tasks-page';

// الـCRM Pipeline (D-20 · docs/20 · 6.1). للـAgent هو "My Leads" (وبيبقى الرئيسية كمان)
export const Route = createFileRoute('/_app/crm/')({
  staticData: { nav: 'crm' },
  component: CrmHome,
});

// الاستقبال بيدخل CRM بصلاحية المهام بس (من غير العملاء)، فأول شاشة ليه المهام
function CrmHome() {
  return useCan('leads.read') ? <CrmPage /> : <TasksPage />;
}
