import { createFileRoute } from '@tanstack/react-router';
import { EncounterPage } from '@/features/encounters/components/encounter-page';

// شاشة الكشف (D-11 · docs/20 · 4.3). الـid = id الكشف، والكشف بيتفتح من "ابدأ كشف" على الميعاد
export const Route = createFileRoute('/_app/encounters/$encounterId')({
  staticData: { nav: 'clinical' },
  component: EncounterPage,
});
