import { createFileRoute } from '@tanstack/react-router';
import { ProgramsBoardPage } from '@/features/programs/components/programs-board-page';

// البرامج: لوحة المرضى حسب المرحلة (D-19 · docs/20 · 5.2). بنّاء البرامج في /programs/builder (5.1)
export const Route = createFileRoute('/_app/programs/')({
  staticData: { nav: 'programs' },
  component: ProgramsBoardPage,
});
