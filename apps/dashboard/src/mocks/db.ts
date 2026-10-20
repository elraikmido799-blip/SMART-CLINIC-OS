import type { CashClosing, Invoice } from '@/features/billing/types';
import type { CarePlan } from '@/features/care-plans/types';
import type { Lab, Medications, Vital } from '@/features/measurements/types';
import type { DermPlan } from '@/features/derm-plans/types';
import type { PatientPhoto } from '@/features/photos/types';
import type { NutritionPlan } from '@/features/nutrition-plans/types';
import type { Exercise } from '@/features/exercises/types';
import type { Campaign, Lead } from '@/features/crm/types';
import type { CatalogItem } from '@/features/catalog/types';
import type { DiscountCode } from '@/features/catalog/codes-types';
import type { Refund } from '@/features/billing/refunds-types';
import type { ContentItem, SiteImage } from '@/features/content/types';
import type { NotificationTemplate } from '@/features/settings/notification-types';
import type { Permission, Role } from '@/features/auth/permissions';
import type { StaffMember } from '@/features/settings/staff-types';
import type { BranchSettings } from '@/features/settings/branch-types';
import type { DoctorSchedule } from '@/features/settings/schedule-types';
import type { Integration } from '@/features/settings/integration-types';
import type { Task } from '@/features/tasks/types';
import type { Enrollment } from '@/features/programs/enrollment-types';
import type { Program } from '@/features/programs/types';
import type { StoredActivity } from './crm-activity';
import type { StoredEncounter } from './encounters';
import type { StoredFormTemplate } from './form-templates';
import type { StoredAppointment, StoredPatient, StoredPayment, StoredTimeBlock } from './clinic';

/**
 * "داتابيز" وهمية في المتصفح (localStorage) للـMocks اللي ليها حالة، زي الموقع (DEC-38 · DEC-42).
 * عشان التجربة تبقى كاملة: تدخل ← تسجّل وصول ← تحصّل، والداتا تفضل بعد الـRefresh.
 * بتتمسح مع فولدر mocks كله لما الـAPI يجهز. "امسح الداتا" من أدوات التجربة.
 */

// حالة الـAPI اللي بنجرّبها (من أدوات التجربة): عادي · فاضي · خطأ · بطيء
export const MOCK_SCENARIOS = ['ok', 'empty', 'error', 'slow'] as const;
export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export type MockDb = {
  version: 1;
  session: { staff_id: string } | null;
  // كود التحقق بخطوتين اللي مستني (بعد الإيميل والباسورد)
  challenge: { id: string; staff_id: string } | null;
  // "افتكر الجهاز ده": المرة الجاية من غير كود
  trusted_staff_ids: string[];
  scenario: MockScenario;
  // داتا العيادة (mocks/clinic.ts): المرضى بيتولدوا مرة واحدة، ومواعيد كل يوم أول ما الفرع يتفتح عليه
  patients: StoredPatient[];
  appointments: StoredAppointment[];
  payments: StoredPayment[];
  time_blocks: StoredTimeBlock[];
  invoices: Invoice[];
  cash_closings: CashClosing[];
  encounters: StoredEncounter[];
  exercises: Exercise[];
  care_plans: CarePlan[];
  nutrition_plans: NutritionPlan[];
  derm_plans: DermPlan[];
  photos: PatientPhoto[];
  vitals: (Vital & { patient_id: string })[];
  labs: (Lab & { patient_id: string })[];
  medications: Medications[];
  form_templates: StoredFormTemplate[];
  programs: Program[];
  enrollments: Enrollment[];
  leads: Lead[];
  campaigns: Campaign[];
  lead_activities: StoredActivity[];
  tasks: Task[];
  catalog: CatalogItem[];
  integrations: Integration[];
  doctor_schedules: DoctorSchedule[];
  branch_settings: BranchSettings[];
  staff_members: StaffMember[];
  role_permissions: Partial<Record<Role, Permission[]>>;
  notification_templates: NotificationTemplate[];
  content_items: ContentItem[];
  site_images: SiteImage[];
  refunds: Refund[];
  discount_codes: DiscountCode[];
  // الأيام اللي مواعيدها اتولدت: "branch-id|2026-10-19"
  generated_days: string[];
};

const KEY = 'oxygen-staff-mock-db';

const empty = (): MockDb => ({
  version: 1,
  session: null,
  challenge: null,
  trusted_staff_ids: [],
  scenario: 'ok',
  patients: [],
  appointments: [],
  payments: [],
  time_blocks: [],
  invoices: [],
  cash_closings: [],
  encounters: [],
  exercises: [],
  care_plans: [],
  nutrition_plans: [],
  derm_plans: [],
  photos: [],
  vitals: [],
  labs: [],
  medications: [],
  form_templates: [],
  programs: [],
  enrollments: [],
  leads: [],
  campaigns: [],
  lead_activities: [],
  tasks: [],
  catalog: [],
  integrations: [],
  doctor_schedules: [],
  branch_settings: [],
  staff_members: [],
  role_permissions: {},
  notification_templates: [],
  content_items: [],
  site_images: [],
  refunds: [],
  discount_codes: [],
  generated_days: [],
});

// لو المتصفح مانع التخزين (Private): بنكمل من الذاكرة
let memory: MockDb = empty();

export function readDb(): MockDb {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(memory);
    const parsed = JSON.parse(raw) as MockDb;
    // الحقول الجديدة بتاخد قيمتها الأولانية لو الداتا المتخزنة أقدم منها
    return parsed.version === 1 ? { ...empty(), ...parsed } : empty();
  } catch {
    return structuredClone(memory);
  }
}

export function writeDb(update: (db: MockDb) => void): MockDb {
  const db = readDb();
  update(db);
  memory = db;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // الداتا بتفضل في الذاكرة لحد الـRefresh
  }
  return db;
}

export function resetDb() {
  memory = empty();
  try {
    localStorage.removeItem(KEY);
  } catch {
    // مفيش حاجة متخزنة أصلًا
  }
}
