import type { PatientSummary } from '@/features/appointments/types';

/**
 * آخر 5 مرضى اتفتحوا على الجهاز ده (بيظهروا أول ما تدوس على البحث).
 * على الجهاز بس، لأن الريسبشن بيرجع لنفس المرضى كتير في نفس اليوم.
 */
const KEY = 'oxygen-staff-recent-patients';
const MAX = 5;

export function readRecentPatients(): PatientSummary[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PatientSummary[]) : [];
  } catch {
    return [];
  }
}

export function rememberPatient(patient: PatientSummary) {
  const { id, name_ar, name_en, file_no, phone, balance_due } = patient;
  const list = [
    { id, name_ar, name_en, file_no, phone, balance_due },
    ...readRecentPatients().filter((item) => item.id !== id),
  ].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // المتصفح مانع التخزين: من غير "آخر مرضى"
  }
}
