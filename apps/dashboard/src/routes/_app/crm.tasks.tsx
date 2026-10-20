import { createFileRoute } from '@tanstack/react-router';
import { TasksPage } from '@/features/tasks/components/tasks-page';

// المهام والمتابعات (D-22 · docs/20 · 6.3): جوه قسم الـCRM
export const Route = createFileRoute('/_app/crm/tasks')({
  staticData: { nav: 'crm' },
  component: TasksPage,
});
