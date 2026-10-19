import { createFileRoute } from '@tanstack/react-router';
import { BuilderPage } from '@/features/form-builder/components/builder-page';

// بنّاء فورم الكشف (D-17 · docs/20 · 4.9). الـcode = كود الفورم (physio_initial_assessment…)
export const Route = createFileRoute('/_app/clinical/forms/$code')({
  staticData: { nav: 'clinical' },
  component: BuilderPage,
});
