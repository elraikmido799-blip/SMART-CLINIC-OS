import { createFileRoute } from '@tanstack/react-router';
import { QueuePage } from '@/features/front-desk/components/queue-page';

// الاستقبال: الطابور (D-05 · docs/20 · 3.4). التحصيل في front-desk.pos وتقفيل الخزنة في front-desk.closing
export const Route = createFileRoute('/_app/front-desk/')({
  staticData: { nav: 'frontDesk' },
  component: QueuePage,
});
