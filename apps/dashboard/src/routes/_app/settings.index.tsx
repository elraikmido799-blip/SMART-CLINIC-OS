import { createFileRoute } from '@tanstack/react-router';
import { SettingsHome } from '@/features/settings/components/settings-tabs';

// الإعدادات: بتفتح أول قسم متاح للموظف (docs/20 · المرحلة 9)
export const Route = createFileRoute('/_app/settings/')({
  staticData: { nav: 'settings' },
  component: SettingsHome,
});
