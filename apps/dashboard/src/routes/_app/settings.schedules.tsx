import { createFileRoute } from '@tanstack/react-router';
import { SchedulesPage } from '@/features/settings/components/schedules-page';

// جداول الدكاترة والإجازات (D-37 · docs/20 · 9.5)
export const Route = createFileRoute('/_app/settings/schedules')({
  staticData: { nav: 'settings' },
  component: SchedulesPage,
});
