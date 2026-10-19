import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { Specialty } from '@oxygen/config';
import type { Appointment, AppointmentStatus, Practitioner } from '@/features/appointments/types';
import type { FrontDeskSummary } from '@/features/front-desk/front-desk.api';
import { clinicIso, clinicNowMinutes, clinicToday } from '@/lib/clinic-time';
import { currentStaff } from './auth';
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
      phone: `01${pick(random, ['0', '1', '2', '5'])}${String(Math.floor(random() * 1e8)).padStart(8, '0')}`,
      gender: female ? 'female' : 'male',
      birth_date: `${year}-${month}-15`,
      // المرضى متوزعين على الفروع (أكتر في التجمع)
      branch_id: random() < 0.4 ? BRANCH_IDS[0] : pick(random, BRANCH_IDS),
      balance_due: owes ? pick(random, [20000, 30000, 45000]) : 0,
    };
  });
}

// ---------- المواعيد والمدفوعات ----------
export type StoredAppointment = {
  id: string;
  branch_id: string;
  practitioner_id: string;
  patient_id: string;
  service_id: string;
  date: string;
  // بالدقايق من نص الليل (بتوقيت مصر)
  start: number;
  end: number;
  status: AppointmentStatus;
  checked_in_at: string | null;
};

export type StoredPayment = {
  id: string;
  branch_id: string;
  date: string;
  patient_id: string;
  appointment_id: string | null;
  amount: number;
  method: 'cash' | 'card' | 'wallet';
};

const OPEN = 9 * 60;
const CLOSE = 21 * 60;

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

    for (const practitioner of PRACTITIONERS.filter((item) => worksAt(item, branchId, date))) {
      const services = SERVICES.filter((service) => service.specialty === practitioner.specialty);
      let cursor = OPEN + Math.floor(random() * 3) * 15;
      while (cursor < CLOSE) {
        const service = pick(random, services);
        if (cursor + service.duration_min > CLOSE) break;
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
            patient_id: patient.id,
            service_id: service.id,
            date,
            start,
            end,
            status,
            checked_in_at: arrived ? clinicIso(date, start - 5 - Math.floor(random() * 10)) : null,
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

function toAppointment(db: MockDb, item: StoredAppointment): Appointment {
  const patient = db.patients.find((entry) => entry.id === item.patient_id)!;
  const service = SERVICES.find((entry) => entry.id === item.service_id)!;
  return {
    id: item.id,
    branch_id: item.branch_id,
    practitioner_id: item.practitioner_id,
    patient: {
      id: patient.id,
      name_ar: patient.name_ar,
      name_en: patient.name_en,
      file_no: patient.file_no,
      phone: patient.phone,
      balance_due: patient.balance_due,
    },
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
  };
}

// ---------- الطلبات ----------
type DayParams = { branch_id?: string; date?: string };

// الفرع لازم يكون من فروع الموظف
function dayParams(args: FetchArgs): { branchId: string; date: string } {
  const { branch_id, date } = (args.params ?? {}) as DayParams;
  if (!branch_id || !date) throw new MockHttpError(400, 'BRANCH_AND_DATE_REQUIRED');
  const staff = currentStaff();
  if (!staff.all_branches && !staff.branch_ids.includes(branch_id)) {
    throw new MockHttpError(403, 'FORBIDDEN_BRANCH');
  }
  return { branchId: branch_id, date };
}

const dayAppointments = (db: MockDb, branchId: string, date: string) =>
  db.appointments
    .filter((item) => item.branch_id === branchId && item.date === date)
    .sort((a, b) => a.start - b.start);

export const clinicHandlers: MockHandlers = {
  getPractitioners: (args) => {
    const { branchId, date } = dayParams(args);
    return {
      data: PRACTITIONERS.filter((item) => worksAt(item, branchId, date)).map(toPractitioner),
    };
  },

  getAppointments: (args) => {
    const { branchId, date } = dayParams(args);
    ensureDay(branchId, date);
    const db = readDb();
    return { data: dayAppointments(db, branchId, date).map((item) => toAppointment(db, item)) };
  },

  checkIn: ({ url }) => {
    const id = url.split('/').at(-2);
    writeDb((db) => {
      const item = db.appointments.find((entry) => entry.id === id);
      if (!item) throw new MockHttpError(404, 'NOT_FOUND');
      if (item.status !== 'confirmed') throw new MockHttpError(409, 'INVALID_STATUS');
      item.status = 'checked_in';
      item.checked_in_at = new Date().toISOString();
    });
    const db = readDb();
    return toAppointment(
      db,
      db.appointments.find((entry) => entry.id === id)!,
    );
  },

  getFrontDeskSummary: (args): FrontDeskSummary => {
    const { branchId, date } = dayParams(args);
    ensureDay(branchId, date);
    const db = readDb();
    const list = dayAppointments(db, branchId, date).filter((item) => item.status !== 'cancelled');
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
