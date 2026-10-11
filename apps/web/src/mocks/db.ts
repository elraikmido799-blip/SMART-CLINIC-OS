import type { Me } from '@/types/auth';
import type { Booking } from '@/types/booking';

/**
 * "داتابيز" وهمية في المتصفح (localStorage) للـMocks اللي ليها حالة: الدخول والحجوزات.
 * عشان التجربة تبقى كاملة: تحجز ← تدفع ← تلاقي الحجز في البوابة، حتى بعد الـRefresh.
 * بتتمسح مع فولدر mocks كله لما الـAPI يجهز. "امسح الداتا": localStorage.removeItem('oxygen-mock-db').
 */
export type MockDb = {
  version: 1;
  session: Me | null;
  users: Me[];
  bookings: (Booking & { patient_id: string })[];
  // آخر رقم اتبعتله كود (عشان verifyOtp يتأكد إن الكود اتطلب)
  otpPhone: string | null;
};

const KEY = 'oxygen-mock-db';
const EMPTY: MockDb = { version: 1, session: null, users: [], bookings: [], otpPhone: null };

// على السيرفر مفيش localStorage: الداتا بتتحفظ في الذاكرة بس (الـMocks دي أصلًا بتشتغل في المتصفح)
let memory: MockDb = structuredClone(EMPTY);

export function readDb(): MockDb {
  try {
    if (typeof localStorage === 'undefined') return memory;
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const parsed = JSON.parse(raw) as MockDb;
    return parsed.version === 1 ? parsed : structuredClone(EMPTY);
  } catch {
    return memory;
  }
}

export function writeDb(update: (db: MockDb) => void): MockDb {
  const db = readDb();
  update(db);
  memory = db;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // المتصفح مانع التخزين (Private): بنكمل من الذاكرة
  }
  return db;
}
