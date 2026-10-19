/**
 * الأدوار والصلاحيات (docs/06 §2 و§3) — من ناحية الفرونت بس.
 * الصلاحيات بترجع مع المستخدم من الـAPI (الـAdmin بيعدّل الأدوار من غير كود)، والفرونت بيخبّي ويقفل على أساسها.
 * الحماية الحقيقية والنطاق (فرعه / مرضاه / المتعيّن له) في الـAPI.
 */
export const ROLES = [
  'reception',
  'doctor',
  'nutritionist',
  'physiotherapist',
  'assistant',
  'crm_agent',
  'marketing',
  'finance',
  'branch_manager',
  'operations_manager',
  'ceo',
  'admin',
] as const;

export type Role = (typeof ROLES)[number];

// كل سطر = صف (أو جزء من صف) في مصفوفة 06 §3
export const PERMISSIONS = [
  'patients.read', // بيانات المريض الأساسية
  'patients.write',
  'patients.merge', // دمج ملفين مكررين
  'medical.read', // التاريخ المرضي والحساسية والأدوية
  'medical.write',
  'nutrition.write',
  'physio.write',
  'derm_im.write', // الجلدية والباطنة
  'clinical.capture', // المساعد: Vitals وقياسات ورفع ملفات
  'vitals.write',
  'documents.upload',
  'appointments.read',
  'appointments.write',
  'checkin.write',
  'billing.read',
  'billing.collect',
  'refunds.request',
  'refunds.approve',
  'discounts.manual',
  'catalog.read',
  'catalog.write',
  'leads.read',
  'leads.create',
  'leads.write',
  'campaigns.read',
  'campaigns.manage',
  'content.manage',
  'programs.read',
  'programs.enroll',
  'builders.propose',
  'builders.manage',
  'dashboards.own',
  'dashboards.branch',
  'dashboards.all',
  'reports.export',
  'staff.manage',
  'roles.manage',
  'settings.read',
  'settings.manage',
  'audit.read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
