import { createFileRoute } from '@tanstack/react-router';
import { CampaignsPage } from '@/features/crm/components/campaigns-page';

// الحملات (D-23 · docs/20 · 6.4): جوه قسم الـCRM
export const Route = createFileRoute('/_app/crm/campaigns')({
  staticData: { nav: 'crm' },
  component: CampaignsPage,
});
