import { createFileRoute } from '@tanstack/react-router';
import { FormsPage } from '@/features/form-builder/components/forms-page';

// قايمة فورمات الكشف (D-17 · docs/20 · 4.9)
export const Route = createFileRoute('/_app/clinical/forms/')({
  staticData: { nav: 'clinical' },
  component: FormsPage,
});
