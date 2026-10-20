import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

// اللي بيتباع في الكاشير: خدمة (كشف · جلسة) أو باقة (جلسات بسعر أقل)
export const sellableSchema = z.object({
  id: z.string(),
  kind: z.enum(['service', 'package']),
  name_ar: z.string(),
  name_en: z.string(),
  specialty: z.custom<Specialty>(isSpecialty).nullable(),
  // بالقروش
  price: z.number(),
  sessions: z.number().nullable(),
});

export type Sellable = z.infer<typeof sellableSchema>;

export const PAYMENT_METHODS = ['cash', 'card', 'wallet', 'instapay'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// نتيجة فحص كود الخصم: نسبة أو مبلغ (بالقروش)، وعلى إيه بيتطبق
export const codeResultSchema = z.object({
  code: z.string(),
  percent: z.number(),
  amount: z.number(),
  applies_to: z.enum(['all', 'service', 'package']),
});

export type CodeResult = z.infer<typeof codeResultSchema>;

export type Discount = { type: 'percent' | 'amount'; value: number };

export type InvoiceLineInput = { item_id: string; kind: Sellable['kind']; qty: number };

export type CreateInvoiceBody = {
  branch_id: string;
  patient_id: string;
  appointment_id: string | null;
  items: InvoiceLineInput[];
  // يحصّل الفلوس المتأخرة القديمة في نفس الفاتورة
  include_balance: boolean;
  discount: Discount | null;
  code: string | null;
  payment: { method: PaymentMethod; amount: number };
};

const lineSchema = z.object({
  item_id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  qty: z.number(),
  unit_price: z.number(),
  total: z.number(),
});

// الفاتورة بعد ما تتعمل (كل الفلوس بالقروش)
export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  branch_id: z.string(),
  created_at: z.string(),
  cashier_name_ar: z.string(),
  cashier_name_en: z.string(),
  patient: z.object({
    id: z.string(),
    name_ar: z.string(),
    name_en: z.string(),
    file_no: z.string(),
  }),
  lines: z.array(lineSchema),
  previous_balance: z.number(),
  subtotal: z.number(),
  discount: z.number(),
  total: z.number(),
  paid: z.number(),
  method: z.enum(PAYMENT_METHODS),
  balance_after: z.number(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// تقفيل الخزنة (3.7): مبلغ لكل طريقة دفع (بالقروش)
export const methodAmountsSchema = z.object({
  cash: z.number(),
  card: z.number(),
  wallet: z.number(),
  instapay: z.number(),
});
export type MethodAmounts = z.infer<typeof methodAmountsSchema>;

export const cashClosingSchema = z.object({
  branch_id: z.string(),
  date: z.string(),
  invoices_count: z.number(),
  // اللي اتحصّل في السيستم
  expected: methodAmountsSchema,
  // null = اليوم لسه متقفلش
  closing: z
    .object({
      counted: methodAmountsSchema,
      difference: z.number(),
      reason: z.string().nullable(),
      closed_by_name_ar: z.string(),
      closed_by_name_en: z.string(),
      closed_at: z.string(),
    })
    .nullable(),
});
export type CashClosing = z.infer<typeof cashClosingSchema>;

export type CloseCashBody = {
  branch_id: string;
  date: string;
  counted: MethodAmounts;
  reason: string | null;
};
