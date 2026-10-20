import { createFileRoute } from '@tanstack/react-router';
import { AuditPage } from '@/features/settings/components/audit-page';

// سجل العمليات (D-39 · docs/20 · 9.7)
export const Route = createFileRoute('/_app/settings/audit')({
  staticData: { nav: 'settings' },
  component: AuditPage,
});
