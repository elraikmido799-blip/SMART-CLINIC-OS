import { MockHttpError, normalizeEgyptianMobile, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { Specialty } from '@oxygen/config';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentBody,
  CreateTimeBlockBody,
  PatientSummary,
  Practitioner,
  Room,
  TimeBlock,
  TimeBlockReason,
} from '@/features/appointments/types';
import type { FrontDeskSummary } from '@/features/front-desk/front-desk.api';
import type { PaymentMethod } from '@/features/billing/types';
import type { RegisterPatientBody } from '@/features/patients/types';
import { clinicIso, clinicMinutes, clinicNowMinutes, clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';

/**
 * داتا العيادة الوهمية: الخدمات · الدكاترة في كل فرع · المرضى · مواعيد كل يوم.
 * المواعيد بتتولد مرة لكل فرع في كل يوم (بـseed ثابت)، وحالتها حسب الساعة دلوقتي:
 * اللي فات خلص أو مجاش · اللي شغال دلوقتي مع الدكتور · اللي جاي قريب وصل أو مستني.
 * الأسعار والأسامي وهمية لحد ما Oxygen يبعتوا الحقيقية (16 · 0.2).
 */

// ---------- أرقام عشوائية ثابتة (نفس اليوم = نفس الداتا) ----------
function seeded(seedText: string) {
  let seed = [...seedText].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 7);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(random: () => number, list: readonly T[]) =>
  list[Math.floor(random() * list.length)];

// ---------- الخدمات ----------
type MockService = {
  id: string;
  name_ar: string;
  name_en: string;
  specialty: Specialty;
  duration_min: number;
  // بالقروش
  price: number;
};

export const SERVICES: MockService[] = [
  {
    id: 'svc-nut-initial',
    name_ar: 'كشف تغذية أول مرة',
    name_en: 'Nutrition — initial',
    specialty: 'nutrition',
    duration_min: 45,
    price: 60000,
  },
  {
    id: 'svc-nut-follow',
    name_ar: 'متابعة تغذية',
    name_en: 'Nutrition — follow-up',
    specialty: 'nutrition',
    duration_min: 30,
    price: 35000,
  },
  {
    id: 'svc-nut-inbody',
    name_ar: 'قياس InBody',
    name_en: 'InBody scan',
    specialty: 'nutrition',
    duration_min: 15,
    price: 20000,
  },
  {
    id: 'svc-phy-assess',
    name_ar: 'تقييم علاج طبيعي',
    name_en: 'Physio — assessment',
    specialty: 'physio',
    duration_min: 45,
    price: 70000,
  },
  {
    id: 'svc-phy-session',
    name_ar: 'جلسة علاج طبيعي',
    name_en: 'Physio — session',
    specialty: 'physio',
    duration_min: 45,
    price: 45000,
  },
  {
    id: 'svc-phy-shockwave',
    name_ar: 'جلسة موجات تصادمية',
    name_en: 'Shockwave session',
    specialty: 'physio',
    duration_min: 30,
    price: 60000,
  },
  {
    id: 'svc-derm-consult',
    name_ar: 'كشف جلدية',
    name_en: 'Dermatology consultation',
    specialty: 'derm',
    duration_min: 30,
    price: 50000,
  },
  {
    id: 'svc-derm-acne',
    name_ar: 'جلسة علاج حب الشباب',
    name_en: 'Acne treatment session',
    specialty: 'derm',
    duration_min: 45,
    price: 90000,
  },
  {
    id: 'svc-derm-laser',
    name_ar: 'جلسة ليزر',
    name_en: 'Laser session',
    specialty: 'derm',
    duration_min: 45,
    price: 150000,
  },
  {
    id: 'svc-im-consult',
    name_ar: 'كشف باطنة',
    name_en: 'Internal medicine consultation',
    specialty: 'internal',
    duration_min: 30,
    price: 50000,
  },
  {
    id: 'svc-im-follow',
    name_ar: 'متابعة باطنة',
    name_en: 'Internal medicine follow-up',
    specialty: 'internal',
    duration_min: 20,
    price: 30000,
  },
];

// ---------- الدكاترة (الـIDs اللي بتبدأ بـst- ليهم حساب دخول في seed.ts) ----------
type MockPractitioner = Practitioner & { branch_ids: string[] };

export const PRACTITIONERS: MockPractitioner[] = [
  {
    id: 'st-phy',
    name_ar: 'د. عمر حسن',
    name_en: 'Dr. Omar Hassan',
    specialty: 'physio',
    branch_ids: ['branch-new-cairo'],
  },
  {
    id: 'st-nut',
    name_ar: 'د. منى عادل',
    name_en: 'Dr. Mona Adel',
    specialty: 'nutrition',
    branch_ids: ['branch-new-cairo'],
  },
  {
    id: 'st-derm',
    name_ar: 'د. ليلى سمير',
    name_en: 'Dr. Laila Samir',
    specialty: 'derm',
    branch_ids: ['branch-new-cairo'],
  },
  {
    id: 'st-im',
    name_ar: 'د. كريم فتحي',
    name_en: 'Dr. Karim Fathy',
    specialty: 'internal',
    branch_ids: ['branch-new-cairo'],
  },
  {
    id: 'pr-youssef',
    name_ar: 'د. يوسف كمال',
    name_en: 'Dr. Youssef Kamal',
    specialty: 'physio',
    branch_ids: ['branch-sheikh-zayed'],
  },
  {
    id: 'pr-hoda',
    name_ar: 'د. هدى سالم',
    name_en: 'Dr. Hoda Salem',
    specialty: 'nutrition',
    branch_ids: ['branch-sheikh-zayed', 'branch-heliopolis'],
  },
  {
    id: 'pr-mai',
    name_ar: 'د. مي حسن',
    name_en: 'Dr. Mai Hassan',
    specialty: 'derm',
    branch_ids: ['branch-heliopolis', 'branch-sheikh-zayed'],
  },
  {
    id: 'pr-tamer',
    name_ar: 'د. تامر لطفي',
    name_en: 'Dr. Tamer Lotfy',
    specialty: 'internal',
    branch_ids: ['branch-heliopolis'],
  },
  {
    id: 'pr-nabil',
    name_ar: 'د. أحمد نبيل',
    name_en: 'Dr. Ahmed Nabil',
    specialty: 'physio',
    branch_ids: ['branch-tanta', 'branch-heliopolis'],
  },
  {
    id: 'pr-sara',
    name_ar: 'د. سارة فوزي',
    name_en: 'Dr. Sara Fawzy',
    specialty: 'nutrition',
    branch_ids: ['branch-tanta', 'branch-tala'],
  },
  {
    id: 'pr-rana',
    name_ar: 'د. رنا شاكر',
    name_en: 'Dr. Rana Shaker',
    specialty: 'derm',
    branch_ids: ['branch-tanta'],
  },
  {
    id: 'pr-walid',
    name_ar: 'د. وليد منصور',
    name_en: 'Dr. Walid Mansour',
    specialty: 'physio',
    branch_ids: ['branch-tala'],
  },
];

const dayNumber = (date: string) => Math.floor(Date.parse(`${date}T12:00:00Z`) / 86_400_000);

// الدكتور اللي في أكتر من فرع بيلف عليهم يوم بيوم
const worksAt = (practitioner: MockPractitioner, branchId: string, date: string) =>
  practitioner.branch_ids[dayNumber(date) % practitioner.branch_ids.length] === branchId;

const toPractitioner = ({ id, name_ar, name_en, specialty }: MockPractitioner): Practitioner => ({
  id,
  name_ar,
  name_en,
  specialty,
});

// ---------- المرضى ----------
export type StoredPatient = {
  id: string;
  name_ar: string;
  name_en: string;
  file_no: string;
  phone: string;
  gender: 'female' | 'male';
  birth_date: string;
  branch_id: string;
  balance_due: number;
};

// [عربي, إنجليزي]
type Name = readonly [string, string];

const FEMALE: Name[] = [
  ['سارة', 'Sara'],
  ['منى', 'Mona'],
  ['فاطمة', 'Fatma'],
  ['نور', 'Nour'],
  ['هبة', 'Heba'],
  ['ريم', 'Reem'],
  ['دينا', 'Dina'],
  ['ياسمين', 'Yasmin'],
  ['مريم', 'Mariam'],
  ['آية', 'Aya'],
  ['سلمى', 'Salma'],
  ['نادين', 'Nadine'],
  ['رانيا', 'Rania'],
  ['هند', 'Hend'],
  ['ملك', 'Malak'],
];
const MALE: Name[] = [
  ['أحمد', 'Ahmed'],
  ['محمد', 'Mohamed'],
  ['عمر', 'Omar'],
  ['يوسف', 'Youssef'],
  ['خالد', 'Khaled'],
  ['مصطفى', 'Mostafa'],
  ['كريم', 'Karim'],
  ['حسام', 'Hossam'],
  ['طارق', 'Tarek'],
  ['إبراهيم', 'Ibrahim'],
  ['علي', 'Ali'],
  ['محمود', 'Mahmoud'],
  ['تامر', 'Tamer'],
  ['وليد', 'Walid'],
  ['شريف', 'Sherif'],
];
const FAMILY: Name[] = [
  ['أحمد', 'Ahmed'],
  ['حسن', 'Hassan'],
  ['علي', 'Ali'],
  ['إبراهيم', 'Ibrahim'],
  ['مصطفى', 'Mostafa'],
  ['خليل', 'Khalil'],
  ['سالم', 'Salem'],
  ['فوزي', 'Fawzy'],
  ['منصور', 'Mansour'],
  ['عادل', 'Adel'],
  ['رضا', 'Reda'],
  ['نبيل', 'Nabil'],
  ['جمال', 'Gamal'],
  ['شاكر', 'Shaker'],
  ['الشريف', 'El Sherif'],
];
const BRANCH_IDS = [
  'branch-new-cairo',
  'branch-sheikh-zayed',
  'branch-heliopolis',
  'branch-tanta',
  'branch-tala',
];

function seedPatients(): StoredPatient[] {
  const random = seeded('oxygen-patients');
  return Array.from({ length: 160 }, (_, index) => {
    const female = random() < 0.6;
    const [firstAr, firstEn] = pick(random, female ? FEMALE : MALE);
    const [lastAr, lastEn] = pick(random, FAMILY);
    const year = 1960 + Math.floor(random() * 45);
    const month = String(1 + Math.floor(random() * 12)).padStart(2, '0');
    const owes = random() < 0.15;
    return {
      id: `pat-${index + 1}`,
      name_ar: `${firstAr} ${lastAr}`,
      name_en: `${firstEn} ${lastEn}`,
      file_no: `OXY-${String(100 + index).padStart(6, '0')}`,
      phone: `+201${pick(random, ['0', '1', '2', '5'])}${String(Math.floor(random() * 1e8)).padStart(8, '0')}`,
      gender: female ? 'female' : 'male',
      birth_date: `${year}-${month}-15`,
      // المرضى متوزعين على الفروع (أكتر في التجمع)
      branch_id: random() < 0.4 ? BRANCH_IDS[0] : pick(random, BRANCH_IDS),
      balance_due: owes ? pick(random, [20000, 30000, 45000]) : 0,
    };
  });
}

// ---------- الأوض (4 في كل فرع لحد ما إعدادات الفروع تتبني في 9.4) ----------
export const ROOMS: Room[] = BRANCH_IDS.flatMap((branchId) =>
  [1, 2, 3, 4].map((number) => ({
    id: `${branchId.replace('branch-', 'room-')}-${number}`,
    branch_id: branchId,
    name_ar: `أوضة ${number}`,
    name_en: `Room ${number}`,
  })),
);

// كل دكتور في أوضة ثابتة في يومه (حسب ترتيبه في الفرع)
function roomFor(practitionerId: string, branchId: string, date: string): string {
  const team = PRACTITIONERS.filter((item) => worksAt(item, branchId, date));
  const rooms = ROOMS.filter((room) => room.branch_id === branchId);
  const index = Math.max(
    0,
    team.findIndex((item) => item.id === practitionerId),
  );
  return rooms[index % rooms.length].id;
}

// ---------- المواعيد والمدفوعات والوقت المقفول ----------
export type StoredAppointment = {
  id: string;
  branch_id: string;
  practitioner_id: string;
  room_id?: string;
  patient_id: string;
  service_id: string;
  date: string;
  // بالدقايق من نص الليل (بتوقيت مصر)
  start: number;
  end: number;
  status: AppointmentStatus;
  checked_in_at: string | null;
  notes?: string | null;
  invoice_id?: string | null;
};

export type StoredPayment = {
  id: string;
  branch_id: string;
  date: string;
  patient_id: string;
  appointment_id: string | null;
  amount: number;
  method: PaymentMethod;
  invoice_id?: string;
};

export type StoredTimeBlock = {
  id: string;
  branch_id: string;
  practitioner_id: string;
  date: string;
  start: number;
  end: number;
  reason: TimeBlockReason;
};

export const OPEN = 9 * 60;
export const CLOSE = 21 * 60;

function statusFor(
  date: string,
  start: number,
  end: number,
  random: () => number,
): AppointmentStatus {
  const today = clinicToday();
  if (date > today) return 'confirmed';
  const now = date < today ? Number.POSITIVE_INFINITY : clinicNowMinutes();
  if (end <= now) return random() < 0.88 ? 'completed' : 'no_show';
  if (start <= now) return 'in_progress';
  if (start - now <= 30) return random() < 0.5 ? 'checked_in' : 'confirmed';
  return 'confirmed';
}

function ensurePatients(db: MockDb) {
  if (db.patients.length === 0) db.patients = seedPatients();
}

/** بيولّد مواعيد الفرع في اليوم ده مرة واحدة (والمرات الجاية بيرجّع المتخزن) */
function ensureDay(branchId: string, date: string) {
  const key = `${branchId}|${date}`;
  if (readDb().generated_days.includes(key)) return;

  writeDb((db) => {
    ensurePatients(db);
    const random = seeded(key);
    const branchPatients = db.patients.filter((patient) => patient.branch_id === branchId);
    const pool = branchPatients.length > 10 ? branchPatients : db.patients;
    const team = PRACTITIONERS.filter((item) => worksAt(item, branchId, date));

    for (const practitioner of team) {
      const services = SERVICES.filter((service) => service.specialty === practitioner.specialty);
      // استراحة نص ساعة لكل دكتور (بتبان في الكالندر كوقت مقفول)
      const breakStart = 14 * 60 + Math.floor(random() * 3) * 30;
      db.time_blocks.push({
        id: `blk-${practitioner.id}-${date}`,
        branch_id: branchId,
        practitioner_id: practitioner.id,
        date,
        start: breakStart,
        end: breakStart + 30,
        reason: 'break',
      });
      let cursor = OPEN + Math.floor(random() * 3) * 15;
      while (cursor < CLOSE) {
        const service = pick(random, services);
        if (cursor + service.duration_min > CLOSE) break;
        if (cursor < breakStart + 30 && cursor + service.duration_min > breakStart) {
          cursor = breakStart + 30;
          continue;
        }
        if (random() < 0.74) {
          const start = cursor;
          const end = cursor + service.duration_min;
          const patient = pick(random, pool);
          const status = statusFor(date, start, end, random);
          const id = `apt-${branchId.replace('branch-', '')}-${date}-${db.appointments.length + 1}`;
          const arrived =
            status === 'checked_in' || status === 'in_progress' || status === 'completed';
          db.appointments.push({
            id,
            branch_id: branchId,
            practitioner_id: practitioner.id,
            room_id: roomFor(practitioner.id, branchId, date),
            patient_id: patient.id,
            service_id: service.id,
            date,
            start,
            end,
            status,
            checked_in_at: arrived ? clinicIso(date, start - 5 - Math.floor(random() * 10)) : null,
            notes: null,
            // اللي خلص في الداتا المتولدة اتحصّل خلاص
            invoice_id: status === 'completed' ? `inv-gen-${id}` : null,
          });
          if (status === 'completed') {
            db.payments.push({
              id: `pay-${id}`,
              branch_id: branchId,
              date,
              patient_id: patient.id,
              appointment_id: id,
              amount: service.price,
              method: pick(random, ['cash', 'cash', 'card', 'wallet'] as const),
            });
          }
          cursor = end + pick(random, [0, 0, 15, 30]);
        } else {
          cursor += 30;
        }
      }
    }
    db.generated_days.push(key);
  });
}

const toPatient = (patient: StoredPatient): PatientSummary => ({
  id: patient.id,
  name_ar: patient.name_ar,
  name_en: patient.name_en,
  file_no: patient.file_no,
  phone: patient.phone,
  balance_due: patient.balance_due,
});

function toAppointment(db: MockDb, item: StoredAppointment): Appointment {
  const patient = db.patients.find((entry) => entry.id === item.patient_id)!;
  const service = SERVICES.find((entry) => entry.id === item.service_id)!;
  return {
    id: item.id,
    branch_id: item.branch_id,
    practitioner_id: item.practitioner_id,
    room_id: item.room_id ?? roomFor(item.practitioner_id, item.branch_id, item.date),
    patient: toPatient(patient),
    service: {
      id: service.id,
      name_ar: service.name_ar,
      name_en: service.name_en,
      specialty: service.specialty,
    },
    starts_at: clinicIso(item.date, item.start),
    ends_at: clinicIso(item.date, item.end),
    status: item.status,
    checked_in_at: item.checked_in_at,
    notes: item.notes ?? null,
    invoice_id: item.invoice_id ?? null,
  };
}

const toTimeBlock = (item: StoredTimeBlock): TimeBlock => ({
  id: item.id,
  branch_id: item.branch_id,
  practitioner_id: item.practitioner_id,
  starts_at: clinicIso(item.date, item.start),
  ends_at: clinicIso(item.date, item.end),
  reason: item.reason,
});

// ---------- الطلبات ----------
type RangeParams = { branch_id?: string; from?: string; to?: string; date?: string };

// الأيام من from لحد to (أسبوع على الأكتر)
function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  for (let time = Date.parse(`${from}T12:00:00Z`); days.length < 7; time += 86_400_000) {
    const day = new Date(time).toISOString().slice(0, 10);
    if (day > to) break;
    days.push(day);
  }
  return days;
}

// الفرع لازم يكون من فروع الموظف
function assertBranch(branchId: string | undefined): string {
  if (!branchId) throw new MockHttpError(400, 'BRANCH_REQUIRED');
  const staff = currentStaff();
  if (!staff.all_branches && !staff.branch_ids.includes(branchId)) {
    throw new MockHttpError(403, 'FORBIDDEN_BRANCH');
  }
  return branchId;
}

function rangeParams(args: FetchArgs) {
  const { branch_id, from, to, date } = (args.params ?? {}) as RangeParams;
  const start = from ?? date;
  if (!start) throw new MockHttpError(400, 'DATE_REQUIRED');
  return { branchId: assertBranch(branch_id), days: daysBetween(start, to ?? start) };
}

// الدكتور (من غير صلاحية تعديل المواعيد) بيشوف مواعيده هو بس — 06: "المواعيد 👁 own"
function ownOnly(): string | null {
  const staff = currentStaff();
  const me = toMe(staff);
  return staff.specialty && !me.permissions.includes('appointments.write') ? staff.id : null;
}

function requireWrite() {
  if (!toMe(currentStaff()).permissions.includes('appointments.write')) {
    throw new MockHttpError(403, 'FORBIDDEN');
  }
}

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

// الميعاد مش لازم يتداخل مع ميعاد تاني لنفس الدكتور أو وقت مقفول
function assertFree(
  db: MockDb,
  slot: { practitioner_id: string; date: string; start: number; end: number },
  ignoreId?: string,
) {
  const overlaps = (start: number, end: number) => start < slot.end && end > slot.start;
  const busy =
    db.appointments.some(
      (item) =>
        item.id !== ignoreId &&
        item.practitioner_id === slot.practitioner_id &&
        item.date === slot.date &&
        item.status !== 'cancelled' &&
        overlaps(item.start, item.end),
    ) ||
    db.time_blocks.some(
      (block) =>
        block.practitioner_id === slot.practitioner_id &&
        block.date === slot.date &&
        overlaps(block.start, block.end),
    );
  if (busy) throw new MockHttpError(409, 'SLOT_TAKEN');
  if (slot.start < OPEN || slot.end > CLOSE) throw new MockHttpError(422, 'OUTSIDE_HOURS');
}

// "2026-10-19T14:30:00+03:00" ← { date, minutes } بتوقيت مصر
const parseSlot = (iso: string) => ({ date: iso.slice(0, 10), minutes: clinicMinutes(iso) });

function updateAppointment(
  id: string,
  change: (item: StoredAppointment, db: MockDb) => void,
): Appointment {
  writeDb((db) => {
    const item = db.appointments.find((entry) => entry.id === id);
    if (!item) throw new MockHttpError(404, 'NOT_FOUND');
    change(item, db);
  });
  const db = readDb();
  return toAppointment(
    db,
    db.appointments.find((entry) => entry.id === id)!,
  );
}

export const clinicHandlers: MockHandlers = {
  getPractitioners: (args) => {
    const { branchId, days } = rangeParams(args);
    const own = ownOnly();
    return {
      data: PRACTITIONERS.filter(
        (item) => days.some((day) => worksAt(item, branchId, day)) && (!own || item.id === own),
      ).map(toPractitioner),
    };
  },

  getRooms: (args) => {
    const branchId = assertBranch((args.params as RangeParams | undefined)?.branch_id);
    return { data: ROOMS.filter((room) => room.branch_id === branchId) };
  },

  getServices: () => ({
    data: SERVICES.map(({ id, name_ar, name_en, specialty, duration_min, price }) => ({
      id,
      name_ar,
      name_en,
      specialty,
      duration_min,
      price,
    })),
  }),

  searchPatients: (args) => {
    const { q = '', limit = 8 } = (args.params ?? {}) as { q?: string; limit?: number };
    const query = q.trim().toLowerCase();
    if (query.length < 2) return { data: [] };
    writeDb(ensurePatients);
    // الرقم بأي شكل (010… · +2010… · ٠١٠…) ← من غير الصفر والـ20 اللي في الأول
    const digits = (normalizeEgyptianMobile(query) ?? query)
      .replace(/\D/g, '')
      .replace(/^(20|0)/, '');
    const data = readDb()
      .patients.filter(
        (patient) =>
          patient.name_ar.includes(query) ||
          patient.name_en.toLowerCase().includes(query) ||
          patient.file_no.toLowerCase().includes(query) ||
          (digits.length >= 3 && patient.phone.includes(digits)),
      )
      .slice(0, Number(limit))
      .map(toPatient);
    return { data };
  },

  getAppointments: (args) => {
    const { branchId, days } = rangeParams(args);
    days.forEach((day) => ensureDay(branchId, day));
    const db = readDb();
    const own = ownOnly();
    const data = db.appointments
      .filter(
        (item) =>
          item.branch_id === branchId &&
          days.includes(item.date) &&
          (!own || item.practitioner_id === own),
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
      .map((item) => toAppointment(db, item));
    return { data };
  },

  getTimeBlocks: (args) => {
    const { branchId, days } = rangeParams(args);
    days.forEach((day) => ensureDay(branchId, day));
    const own = ownOnly();
    return {
      data: readDb()
        .time_blocks.filter(
          (block) =>
            block.branch_id === branchId &&
            days.includes(block.date) &&
            (!own || block.practitioner_id === own),
        )
        .map(toTimeBlock),
    };
  },

  getPatient: ({ url }) => {
    writeDb(ensurePatients);
    const patient = readDb().patients.find((item) => item.id === idFrom(url, 1));
    if (!patient) throw new MockHttpError(404, 'NOT_FOUND');
    return {
      ...toPatient(patient),
      gender: patient.gender,
      birth_date: patient.birth_date || null,
      branch_id: patient.branch_id,
    };
  },

  registerPatient: ({ body }) => {
    const input = body as RegisterPatientBody;
    const branchId = assertBranch(input.branch_id);
    const phone = normalizeEgyptianMobile(input.phone);
    if (!phone || input.name_ar.trim().length < 3) throw new MockHttpError(422, 'INVALID');
    let created: StoredPatient | null = null;
    writeDb((db) => {
      ensurePatients(db);
      if (db.patients.some((patient) => patient.phone === phone)) {
        throw new MockHttpError(409, 'DUPLICATE_PHONE');
      }
      const index = db.patients.length;
      created = {
        id: `pat-${index + 1}`,
        name_ar: input.name_ar.trim(),
        // لحد ما الاسم الإنجليزي يتكتب، العربي بيظهر في الإنجليزي كمان
        name_en: input.name_en?.trim() || input.name_ar.trim(),
        file_no: `OXY-${String(100 + index).padStart(6, '0')}`,
        phone,
        gender: input.gender,
        birth_date: input.birth_date ?? '',
        branch_id: branchId,
        balance_due: 0,
      };
      db.patients.push(created);
    });
    return toPatient(created!);
  },

  createAppointment: ({ body }) => {
    requireWrite();
    const input = body as CreateAppointmentBody;
    const branchId = assertBranch(input.branch_id);
    const service = SERVICES.find((item) => item.id === input.service_id);
    if (!service) throw new MockHttpError(422, 'INVALID_SERVICE');
    const { date, minutes } = parseSlot(input.starts_at);
    if (date < clinicToday() || (date === clinicToday() && minutes < clinicNowMinutes())) {
      throw new MockHttpError(422, 'PAST_TIME');
    }
    const id = `apt-new-${Date.now()}`;
    writeDb((db) => {
      ensurePatients(db);
      const slot = {
        practitioner_id: input.practitioner_id,
        date,
        start: minutes,
        end: minutes + service.duration_min,
      };
      assertFree(db, slot);
      db.appointments.push({
        id,
        branch_id: branchId,
        practitioner_id: input.practitioner_id,
        room_id: roomFor(input.practitioner_id, branchId, date),
        patient_id: input.patient_id,
        service_id: service.id,
        date,
        start: slot.start,
        end: slot.end,
        status: 'confirmed',
        checked_in_at: null,
        notes: input.notes?.trim() || null,
      });
    });
    const db = readDb();
    return toAppointment(
      db,
      db.appointments.find((item) => item.id === id)!,
    );
  },

  rescheduleAppointment: ({ url, body }) => {
    requireWrite();
    const { starts_at, practitioner_id } = body as { starts_at: string; practitioner_id: string };
    const { date, minutes } = parseSlot(starts_at);
    return updateAppointment(idFrom(url, 1), (item, db) => {
      if (item.status !== 'confirmed') throw new MockHttpError(409, 'INVALID_STATUS');
      if (date < clinicToday() || (date === clinicToday() && minutes < clinicNowMinutes())) {
        throw new MockHttpError(422, 'PAST_TIME');
      }
      const duration = item.end - item.start;
      const slot = { practitioner_id, date, start: minutes, end: minutes + duration };
      assertFree(db, slot, item.id);
      Object.assign(item, slot, { room_id: roomFor(practitioner_id, item.branch_id, date) });
    });
  },

  cancelAppointment: ({ url }) => {
    requireWrite();
    return updateAppointment(idFrom(url, 2), (item) => {
      if (item.status !== 'confirmed' && item.status !== 'checked_in') {
        throw new MockHttpError(409, 'INVALID_STATUS');
      }
      item.status = 'cancelled';
    });
  },

  markNoShow: ({ url }) =>
    updateAppointment(idFrom(url, 2), (item) => {
      if (item.status !== 'confirmed') throw new MockHttpError(409, 'INVALID_STATUS');
      item.status = 'no_show';
    }),

  checkIn: ({ url }) =>
    updateAppointment(idFrom(url, 2), (item) => {
      if (item.status !== 'confirmed') throw new MockHttpError(409, 'INVALID_STATUS');
      item.status = 'checked_in';
      item.checked_in_at = new Date().toISOString();
    }),

  startVisit: ({ url }) =>
    updateAppointment(idFrom(url, 2), (item) => {
      if (item.status !== 'checked_in') throw new MockHttpError(409, 'INVALID_STATUS');
      item.status = 'in_progress';
    }),

  completeVisit: ({ url }) =>
    updateAppointment(idFrom(url, 2), (item) => {
      if (item.status !== 'in_progress') throw new MockHttpError(409, 'INVALID_STATUS');
      item.status = 'completed';
    }),

  createTimeBlock: ({ body }) => {
    requireWrite();
    const input = body as CreateTimeBlockBody;
    const branchId = assertBranch(input.branch_id);
    const start = parseSlot(input.starts_at);
    const end = clinicMinutes(input.ends_at);
    if (end <= start.minutes) throw new MockHttpError(422, 'INVALID_RANGE');
    const block: StoredTimeBlock = {
      id: `blk-new-${Date.now()}`,
      branch_id: branchId,
      practitioner_id: input.practitioner_id,
      date: start.date,
      start: start.minutes,
      end,
      reason: input.reason,
    };
    writeDb((db) => {
      assertFree(db, block);
      db.time_blocks.push(block);
    });
    return toTimeBlock(block);
  },

  deleteTimeBlock: ({ url }) => {
    requireWrite();
    const id = idFrom(url, 1);
    writeDb((db) => {
      db.time_blocks = db.time_blocks.filter((block) => block.id !== id);
    });
    return null;
  },

  getFrontDeskSummary: (args): FrontDeskSummary => {
    const { branchId, days } = rangeParams(args);
    const [date] = days;
    ensureDay(branchId, date);
    const db = readDb();
    const list = db.appointments.filter(
      (item) => item.branch_id === branchId && item.date === date && item.status !== 'cancelled',
    );
    return {
      appointments: list.length,
      checked_in: list.filter((item) =>
        ['checked_in', 'in_progress', 'completed'].includes(item.status),
      ).length,
      no_shows: list.filter((item) => item.status === 'no_show').length,
      collected: db.payments
        .filter((payment) => payment.branch_id === branchId && payment.date === date)
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  },
};
