import type { Permission } from '@/features/auth/permissions';

/**
 * تابات ملف المريض (05 §D-09): الـ11 تاب، وكل تاب حسب الصلاحية (الريسبشن مش بيشوف الكشوفات).
 * `step` = الخطوة اللي بتكمّل التاب في docs/20 (null = التاب شغال، أو لسه من غير خطوة في الخطة: الخط الزمني والموافقات).
 * الـOverview كامل من 4.1، والكشوفات من 4.3.
 */
export const PATIENT_TABS = [
  { key: 'overview', permission: 'patients.read', step: null },
  { key: 'timeline', permission: 'patients.read', step: null },
  { key: 'encounters', permission: 'medical.read', step: null },
  { key: 'measurements', permission: 'medical.read', step: null },
  { key: 'plans', permission: 'medical.read', step: null },
  { key: 'documents', permission: 'patients.read', step: null },
  { key: 'programs', permission: 'programs.read', step: null },
  { key: 'billing', permission: 'billing.read', step: '7.3' },
  { key: 'crm', permission: 'tasks.manage', step: null },
  { key: 'consents', permission: 'patients.read', step: null },
  { key: 'access', permission: 'audit.read', step: '9.7' },
] as const satisfies readonly { key: string; permission: Permission; step: string | null }[];

export type PatientTab = (typeof PATIENT_TABS)[number]['key'];

export const isPatientTab = (value: unknown): value is PatientTab =>
  PATIENT_TABS.some((tab) => tab.key === value);
