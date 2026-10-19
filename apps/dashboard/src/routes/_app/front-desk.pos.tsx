import { createFileRoute } from '@tanstack/react-router';
import { PosPage } from '@/features/billing/components/pos-page';

export type PosSearch = { patient?: string; appointment?: string; service?: string };

const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined);

// التحصيل (D-06 · docs/20 · 3.6). ?patient=&appointment=&service= بيجهّزوا الفاتورة من الميعاد
export const Route = createFileRoute('/_app/front-desk/pos')({
  staticData: { nav: 'frontDesk' },
  validateSearch: (search: Record<string, unknown>): PosSearch => ({
    patient: text(search.patient),
    appointment: text(search.appointment),
    service: text(search.service),
  }),
  component: PosPage,
});
