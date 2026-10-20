import { createFileRoute } from '@tanstack/react-router';
import { StaffPage } from '@/features/settings/components/staff-page';

// الموظفين والأدوار (D-35 · docs/20 · 9.3)
export const Route = createFileRoute('/_app/settings/staff')({
  staticData: { nav: 'settings' },
  component: StaffPage,
});
