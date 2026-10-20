import { createFileRoute } from '@tanstack/react-router';
import { TemplatesPage } from '@/features/settings/components/templates-page';

// قوالب الإشعارات (D-34 · docs/20 · 9.2)
export const Route = createFileRoute('/_app/settings/templates')({
  staticData: { nav: 'settings' },
  component: TemplatesPage,
});
