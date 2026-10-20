import { createFileRoute } from '@tanstack/react-router';
import { IntegrationsPage } from '@/features/settings/components/integrations-page';

// الربط مع الخدمات (D-38 · docs/20 · 9.6)
export const Route = createFileRoute('/_app/settings/integrations')({
  staticData: { nav: 'settings' },
  component: IntegrationsPage,
});
