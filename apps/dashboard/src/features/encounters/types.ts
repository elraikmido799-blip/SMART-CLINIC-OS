import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

const specialty = z.custom<Specialty>(isSpecialty);
const named = { name_ar: z.string(), name_en: z.string() };

/**
 * فورم الكشف بيتبني من Template (JSON): نفس شكل الـForm Engine في docs/04 (form_template_versions.schema).
 * أي تخصص جديد أو حقل جديد = Template جديد من غير كود (بنّاء الفورمات في 4.9).
 * كل تعريف حقل: `key` (مفتاح القيمة) · `label_ar/en` · `required` · و`type` بيحدد باقي الخصائص.
 */
const base = {
  key: z.string(),
  label_ar: z.string(),
  label_en: z.string(),
  hint_ar: z.string().optional(),
  hint_en: z.string().optional(),
  required: z.boolean().optional(),
};

const option = z.object({ value: z.string(), label_ar: z.string(), label_en: z.string() });

// الأعمدة جوه الجدول: رقم · اختيار · علامة صح
const column = z.discriminatedUnion('type', [
  z.object({
    key: z.string(),
    label_ar: z.string(),
    label_en: z.string(),
    type: z.literal('number'),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  z.object({
    key: z.string(),
    label_ar: z.string(),
    label_en: z.string(),
    type: z.literal('select'),
    options: z.array(option),
  }),
  z.object({
    key: z.string(),
    label_ar: z.string(),
    label_en: z.string(),
    type: z.literal('check'),
  }),
]);

export type TemplateColumn = z.infer<typeof column>;

export const templateFieldSchema = z.discriminatedUnion('type', [
  // شريط 0..10 (الألم)
  z.object({ ...base, type: z.literal('scale'), min: z.number(), max: z.number() }),
  z.object({
    ...base,
    type: z.literal('number'),
    min: z.number().optional(),
    max: z.number().optional(),
    unit: z.string().optional(),
  }),
  z.object({ ...base, type: z.literal('text') }),
  z.object({ ...base, type: z.literal('textarea'), max_length: z.number() }),
  z.object({ ...base, type: z.literal('select'), options: z.array(option) }),
  z.object({ ...base, type: z.literal('multiselect'), options: z.array(option) }),
  // جدول: صفوف ثابتة × أعمدة (ROM · القوة · الفحص الوظيفي)
  z.object({
    ...base,
    type: z.literal('grid'),
    rows: z.array(z.object({ key: z.string(), label_ar: z.string(), label_en: z.string() })),
    columns: z.array(column),
  }),
]);

export type TemplateField = z.infer<typeof templateFieldSchema>;

export const formTemplateSchema = z.object({
  code: z.string(),
  version: z.number(),
  specialty,
  title_ar: z.string(),
  title_en: z.string(),
  sections: z.array(
    z.object({
      id: z.string(),
      title_ar: z.string(),
      title_en: z.string(),
      fields: z.array(templateFieldSchema),
    }),
  ),
});

export type FormTemplate = z.infer<typeof formTemplateSchema>;

export const ENCOUNTER_STATUSES = ['draft', 'signed'] as const;

// قيم الفورم: مفتاح الحقل ← القيمة (الجدول: صف ← عمود ← قيمة)
export type EncounterData = Record<string, unknown>;

export const encounterSchema = z.object({
  id: z.string(),
  status: z.enum(ENCOUNTER_STATUSES),
  appointment_id: z.string().nullable(),
  specialty,
  patient: z.object({
    id: z.string(),
    ...named,
    file_no: z.string(),
    gender: z.enum(['female', 'male']),
    birth_date: z.string().nullable(),
    // التشخيص الأخير والجلسة (من الباقة): بيتملوا من ملف المريض
    diagnosis_ar: z.string().nullable(),
    diagnosis_en: z.string().nullable(),
    session_number: z.number().nullable(),
    session_total: z.number().nullable(),
  }),
  practitioner: z.object(named),
  template: formTemplateSchema,
  data: z.record(z.string(), z.unknown()),
  patient_visible: z.boolean(),
  updated_at: z.string(),
  signed_at: z.string().nullable(),
  signed_by: z.object(named).nullable(),
  // آخر 3 ملاحظات من كشوفات سابقة
  recent_notes: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      session: z.number().nullable(),
      text: z.string(),
    }),
  ),
});

export type Encounter = z.infer<typeof encounterSchema>;

// سطر في تاب "الكشوفات" في ملف المريض
export const encounterSummarySchema = z.object({
  id: z.string(),
  date: z.string(),
  specialty,
  template_title_ar: z.string(),
  template_title_en: z.string(),
  practitioner: z.object(named),
  status: z.enum(ENCOUNTER_STATUSES),
});

export type EncounterSummary = z.infer<typeof encounterSummarySchema>;

export type SaveDraftBody = { id: string; data: EncounterData; patient_visible: boolean };
export type SignBody = SaveDraftBody;
