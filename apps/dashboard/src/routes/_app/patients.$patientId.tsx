import { createFileRoute } from '@tanstack/react-router';
import { PatientPage } from '@/features/patients/components/patient-page';

// ملف المريض (بداية D-09 · docs/20 · 3.5، والـ360 كامل في 4.1)
export const Route = createFileRoute('/_app/patients/$patientId')({
  staticData: { nav: 'patients' },
  component: PatientPage,
});
