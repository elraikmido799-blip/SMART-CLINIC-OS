import { z } from 'zod';

export const REPORT_CODES = [
  'revenue_daily',
  'invoices',
  'lead_sources',
  'campaigns',
  'refunds',
] as const;

export type ReportCode = (typeof REPORT_CODES)[number];

export const COLUMN_TYPES = ['text', 'number', 'money', 'percent', 'date'] as const;

export type ColumnType = (typeof COLUMN_TYPES)[number];

/**
 * تقرير جاهز (D-32): أعمدة بنوعها (النوع بيحدد التنسيق: فلوس بالقروش · نسبة 0 لـ1 · تاريخ ISO) وصفوف.
 * أسماء الأعمدة والتقرير في ملف الترجمة بالمفتاح، فالـAPI بيبعت مفاتيح بس.
 */
export const reportSchema = z.object({
  code: z.enum(REPORT_CODES),
  columns: z.array(z.object({ key: z.string(), type: z.enum(COLUMN_TYPES) })),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
});

export type Report = z.infer<typeof reportSchema>;

export type ReportQuery = {
  code: ReportCode;
  branch_id: string;
  from: string;
  to: string;
};
