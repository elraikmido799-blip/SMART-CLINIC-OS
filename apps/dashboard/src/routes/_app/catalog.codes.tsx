import { createFileRoute } from '@tanstack/react-router';
import { CodesPage } from '@/features/catalog/components/codes-page';

// أكواد الخصم (D-25 · docs/20 · 7.2): جوه قسم الكتالوج
export const Route = createFileRoute('/_app/catalog/codes')({
  staticData: { nav: 'catalog' },
  component: CodesPage,
});
