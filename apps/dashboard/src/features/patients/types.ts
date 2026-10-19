// جه منين (المصدر) — نفس مصادر الـCRM (6.1)
export const PATIENT_SOURCES = [
  'walk_in',
  'phone',
  'website',
  'whatsapp',
  'facebook',
  'instagram',
  'tiktok',
  'google',
  'referral',
] as const;

export type PatientSource = (typeof PATIENT_SOURCES)[number];

export type RegisterPatientBody = {
  name_ar: string;
  name_en: string | null;
  // "+201XXXXXXXXX" (normalizeEgyptianMobile)
  phone: string;
  gender: 'female' | 'male';
  birth_date: string | null;
  branch_id: string;
  source: PatientSource;
  notes: string | null;
};
