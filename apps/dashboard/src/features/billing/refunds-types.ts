import { z } from 'zod';

const named = { name_ar: z.string(), name_en: z.string() };

export const REFUND_STATUSES = ['pending', 'approved', 'rejected'] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

/**
 * طلب مرتجع (D-27 · docs/04 `refunds`): الريسبشن أو مدير الفرع بيطلب، والمحاسب بيوافق أو يرفض (الرفض بسبب).
 * المبلغ بالقروش ومينفعش يزيد عن المدفوع من الفاتورة ناقص اللي اتطلب قبل كده.
 */
export const refundSchema = z.object({
  id: z.string(),
  invoice_id: z.string(),
  invoice_number: z.string(),
  branch_id: z.string(),
  patient: z.object({ id: z.string(), ...named }),
  amount: z.number(),
  reason: z.string(),
  status: z.enum(REFUND_STATUSES),
  requested_by: z.object(named),
  requested_at: z.string(),
  decided_by: z.object(named).nullable(),
  decided_at: z.string().nullable(),
  decision_note: z.string().nullable(),
});

export type Refund = z.infer<typeof refundSchema>;

export type RefundQuery = { branch_id: string };

export type RequestRefundBody = { invoice_id: string; amount: number; reason: string };

export type DecideRefundBody = { id: string; approve: boolean; note: string };
