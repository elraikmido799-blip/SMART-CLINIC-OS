import { createFileRoute } from '@tanstack/react-router';
import { CrmPage } from '@/features/crm/components/crm-page';

// الـCRM Pipeline (D-20 · docs/20 · 6.1). للـAgent هو "My Leads" (وبيبقى الرئيسية كمان)
export const Route = createFileRoute('/_app/crm/')({
  staticData: { nav: 'crm' },
  component: CrmPage,
});
