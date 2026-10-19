import { createFileRoute } from '@tanstack/react-router';
import { ProgramsManagePage } from '@/features/programs/components/programs-manage-page';

// قايمة البرامج (D-18 · docs/20 · 5.1)
export const Route = createFileRoute('/_app/programs/builder/')({
  staticData: { nav: 'programs' },
  component: ProgramsManagePage,
});
