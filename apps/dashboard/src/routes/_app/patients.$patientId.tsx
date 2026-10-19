import { createFileRoute } from '@tanstack/react-router';
import { PatientPage } from '@/features/patients/components/patient-page';
import { isPatientTab, type PatientTab } from '@/features/patients/tabs';

export type PatientSearch = { tab?: PatientTab };

// ملف المريض 360 (D-09 · docs/20 · 4.1). ?tab= = التاب المفتوح (اللينك بيتبعت)
export const Route = createFileRoute('/_app/patients/$patientId')({
  staticData: { nav: 'patients' },
  validateSearch: (search: Record<string, unknown>): PatientSearch => ({
    tab: isPatientTab(search.tab) && search.tab !== 'overview' ? search.tab : undefined,
  }),
  component: PatientPage,
});
