import { createFileRoute } from '@tanstack/react-router';
import { ExercisesPage } from '@/features/exercises/components/exercises-page';

// مكتبة التمارين (D-16 · docs/20 · 4.5)
export const Route = createFileRoute('/_app/clinical/exercises')({
  staticData: { nav: 'clinical' },
  component: ExercisesPage,
});
