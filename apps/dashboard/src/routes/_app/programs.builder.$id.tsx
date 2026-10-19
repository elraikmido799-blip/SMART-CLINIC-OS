import { createFileRoute } from '@tanstack/react-router';
import { ProgramBuilderPage } from '@/features/programs/components/program-builder-page';

// بنّاء البرنامج (D-18 · docs/20 · 5.1). §id§ = id البرنامج، أو "new" لبرنامج جديد
export const Route = createFileRoute('/_app/programs/builder/$id')({
  staticData: { nav: 'programs' },
  component: ProgramBuilderPage,
});
