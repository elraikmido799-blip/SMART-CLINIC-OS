import type { Permission } from '@/features/auth/permissions';

/**
 * تابات ملف المريض (05 §D-09): الـ11 تاب، وكل تاب حسب الصلاحية (الريسبشن مش بيشوف الكشوفات).
 * `step` = الخطوة اللي بتكمّل التاب في docs/20. الـOverview كامل من 4.1.
 */
export const PATIENT_TABS = [
  { key: 'overview', permission: 'patients.read', step: null },
  { key: 'timeline', permission: 'patients.read', step: '4.3' },
  { key: 'encounters', permission: 'medical.read', step: '4.3' },
  { key: 'measurements', permission: 'medical.read', step: '4.8' },
  { key: 'plans', permission: 'medical.read', step: '4.4' },
  { key: 'documents', permission: 'patients.read', step: '4.7' },
  { key: 'programs', permission: 'programs.read', step: '5.2' },
  { key: 'billing', permission: 'billing.read', step: '7.3' },
  { key: 'crm', permission: 'leads.read', step: '6.2' },
  { key: 'consents', permission: 'patients.read', step: '4.3' },
  { key: 'access', permission: 'audit.read', step: '9.7' },
] as const satisfies readonly { key: string; permission: Permission; step: string | null }[];

export type PatientTab = (typeof PATIENT_TABS)[number]['key'];

export const isPatientTab = (value: unknown): value is PatientTab =>
  PATIENT_TABS.some((tab) => tab.key === value);
