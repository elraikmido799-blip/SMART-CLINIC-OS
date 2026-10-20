import { z } from 'zod';

export const AUDIT_ACTIONS = [
  'login',
  'view',
  'create',
  'update',
  'delete',
  'export',
  'refund',
  'discount',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITIES = [
  'patient',
  'appointment',
  'invoice',
  'encounter',
  'lead',
  'staff',
  'settings',
] as const;

export type AuditEntity = (typeof AUDIT_ENTITIES)[number];

/**
 * سطر في سجل العمليات (D-39 · docs/04 `audit_logs`): مين عمل إيه وإمتى على إيه. للقراءة بس (الـAPI بيسجّل ومفيش تعديل ولا
 * مسح). `patient_id` للأفعال على مريض، وبيتعرض في تاب "الوصول" في ملفه. `entity_label` اسم مقروء (رقم فاتورة · اسم مريض).
 */
export const auditEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  actor: z.object({ id: z.string(), name_ar: z.string(), name_en: z.string(), role: z.string() }),
  action: z.enum(AUDIT_ACTIONS),
  entity: z.enum(AUDIT_ENTITIES),
  entity_label: z.string(),
  branch_id: z.string(),
  patient_id: z.string().nullable(),
  // مثلًا سبب فتح ملف من بره الفريق المعالج
  reason: z.string().nullable(),
});

export type AuditEntry = z.infer<typeof auditEntrySchema>;

export type AuditQuery = {
  branch_id: string;
  // آخر كام يوم
  days: number;
  action?: AuditAction;
  entity?: AuditEntity;
  actor_id?: string;
  patient_id?: string;
};
