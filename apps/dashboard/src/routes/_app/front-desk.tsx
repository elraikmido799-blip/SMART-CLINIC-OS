import { createFileRoute } from '@tanstack/react-router';
import { QueuePage } from '@/features/front-desk/components/queue-page';

// الاستقبال: الطابور (D-05 · docs/20 · 3.4). التحصيل (3.6) وتقفيل الخزنة (3.7) هيتضافوا هنا
export const Route = createFileRoute('/_app/front-desk')({
  staticData: { nav: 'frontDesk' },
  component: QueuePage,
});
