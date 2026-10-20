import { createFileRoute } from '@tanstack/react-router';
import { JourneyPage } from '@/features/dashboards/components/journey-page';

// رحلة المريض (D-30 · docs/20 · 8.3)
export const Route = createFileRoute('/_app/dashboards/journey')({
  staticData: { nav: 'dashboards' },
  component: JourneyPage,
});
