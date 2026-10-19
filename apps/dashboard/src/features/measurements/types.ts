import { z } from 'zod';

/**
 * القياسات (الباطنة · D-15 · docs/20 · 4.8): العلامات الحيوية عبر الوقت · التحاليل بمعدلاتها الطبيعية · الأدوية.
 * الحالة (طبيعي / عالي / واطي) بتتحسب في الفرونت من القيمة والمعدل، والـAPI بيرجّع القيمة والمعدل بس.
 */
export const vitalSchema = z.object({
  id: z.string(),
  date: z.string(),
  systolic: z.number(),
  diastolic: z.number(),
  heart_rate: z.number(),
  weight_kg: z.number(),
  bmi: z.number(),
});

export type Vital = z.infer<typeof vitalSchema>;

export const labSchema = z.object({
  id: z.string(),
  date: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  // المعدل الطبيعي (null = مفيش حد)
  min: z.number().nullable(),
  max: z.number().nullable(),
});

export type Lab = z.infer<typeof labSchema>;

export const measurementsSchema = z.object({
  // الأقدم الأول
  vitals: z.array(vitalSchema),
  // الأحدث الأول
  labs: z.array(labSchema),
});

export type Measurements = z.infer<typeof measurementsSchema>;

export const medicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dose: z.string(),
  frequency: z.string(),
  active: z.boolean(),
});

export type Medication = z.infer<typeof medicationSchema>;

export const medicationsSchema = z.object({
  patient_id: z.string(),
  medications: z.array(medicationSchema),
  updated_at: z.string().nullable(),
});

export type Medications = z.infer<typeof medicationsSchema>;

export type MedicationsBody = Omit<Medications, 'updated_at'>;

export type AddVitalsBody = {
  patient_id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  weight_kg: number;
};

export type AddLabBody = {
  patient_id: string;
  date: string;
  name: string;
  value: number;
  unit: string;
  min: number | null;
  max: number | null;
};

export type LabFlag = 'low' | 'high' | 'normal' | 'none';

/** القيمة ضد المعدل الطبيعي */
export function labFlag(lab: Pick<Lab, 'value' | 'min' | 'max'>): LabFlag {
  if (lab.min === null && lab.max === null) return 'none';
  if (lab.min !== null && lab.value < lab.min) return 'low';
  if (lab.max !== null && lab.value > lab.max) return 'high';
  return 'normal';
}
