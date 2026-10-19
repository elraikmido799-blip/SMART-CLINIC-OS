import { createFileRoute } from '@tanstack/react-router';
import { PatientsPage } from '@/features/patients/components/patients-page';

// المرضى: البحث (D-08 · docs/20 · 3.5). البحث في الـURL (?q=)
export const Route = createFileRoute('/_app/patients/')({
  staticData: { nav: 'patients' },
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
  }),
  component: PatientsPage,
});
