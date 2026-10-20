import { createFileRoute } from '@tanstack/react-router';
import { CatalogPage } from '@/features/catalog/components/catalog-page';

// الكتالوج (D-24 · docs/20 · 7.1). أكواد الخصم في /catalog/codes (7.2)
export const Route = createFileRoute('/_app/catalog/')({
  staticData: { nav: 'catalog' },
  component: CatalogPage,
});
