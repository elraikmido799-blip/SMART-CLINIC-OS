import type { CashClosing, Invoice } from '@/features/billing/types';
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
