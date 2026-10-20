import { createFileRoute } from '@tanstack/react-router';
import { ContentPage } from '@/features/content/components/content-page';

// إدارة المحتوى (D-33 · docs/20 · 9.1)
export const Route = createFileRoute('/_app/content/')({
  staticData: { nav: 'content' },
  component: ContentPage,
});
