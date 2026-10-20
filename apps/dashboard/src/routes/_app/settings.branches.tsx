import { createFileRoute } from '@tanstack/react-router';
import { BranchesPage } from '@/features/settings/components/branches-page';

// الفروع والأوض ومواعيد العمل (D-36 · docs/20 · 9.4)
export const Route = createFileRoute('/_app/settings/branches')({
  staticData: { nav: 'settings' },
  component: BranchesPage,
});
