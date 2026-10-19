import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { Specialty } from '@oxygen/config';
import { JOURNEY_STEPS, type PatientOverview } from '@/features/patients/overview';
import { addDays, clinicIso, clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { ensurePatients, PRACTITIONERS, seeded, SERVICES } from './clinic';
import { readDb, writeDb } from './db';

/**
 * ملف المريض 360 الوهمي (4.1): نفس المريض = نفس الداتا (seeded بالـid).
 * المواعيد الجاية حقيقية من الـMock DB، والباقي (الوزن · العلامات · الخطط · الملفات) متولّد لحد مراحله.
 */
const PLANS: { specialty: Specialty; name_ar: string; name_en: string; home: boolean }[] = [
  {
    specialty: 'nutrition',
    name_ar: 'خطة تغذية علاجية',
    name_en: 'Clinical nutrition plan',
    home: false,
  },
  { specialty: 'physio', name_ar: 'خطة علاج طبيعي', name_en: 'Physiotherapy plan', home: true },
];

const DOCUMENTS = [
  { title: 'Lab Results.pdf', category: 'lab' },
  { title: 'Nutrition Plan.pdf', category: 'plan' },
  { title: 'Physio Report.pdf', category: 'report' },
  { title: 'Medical History.pdf', category: 'clinical' },
  { title: 'Consent Form.pdf', category: 'consent' },
  { title: 'National ID.jpg', category: 'id' },
] as const;

// الملفات اللي مش طبية (بتظهر من غير medical.read)
const NON_MEDICAL = new Set(['consent', 'id']);

const round1 = (value: number) => Math.round(value * 10) / 10;

function overviewOf(patientId: string): PatientOverview {
  const random = seeded(`overview-${patientId}`);
  const today = clinicToday();

  // الوزن: 12 أسبوع بينزل شوية بشوية
  const height = 1.55 + random() * 0.3;
  let kg = 70 + random() * 30;
  const weight = Array.from({ length: 12 }, (_, index) => {
    const point = { date: addDays(today, (index - 11) * 7), kg: round1(kg) };
    kg -= random() * 1.2;
    return point;
  });
  const last = weight[weight.length - 1];

  const doneSteps = 2 + Math.floor(random() * 6);
  const start = addDays(today, -7 * 10);
  const journey = JOURNEY_STEPS.map((step, index) => ({
    step,
    date: index < doneSteps ? addDays(start, index * 6) : null,
  }));

  const plans = PLANS.filter(() => random() < 0.6).map((plan, index) => ({
    id: `plan-${patientId}-${index}`,
    specialty: plan.specialty,
    name_ar: plan.name_ar,
    name_en: plan.name_en,
    starts_on: addDays(today, -40 - index * 7),
    ends_on: addDays(today, 40),
    home_exercises: plan.home,
  }));

  const documents = DOCUMENTS.filter(() => random() < 0.6).map((doc, index) => ({
    id: `doc-${patientId}-${index}`,
    title: doc.title,
    category: doc.category,
    date: addDays(today, -2 - index * 5),
  }));

  return {
    alerts: {
      allergies: random() < 0.25 ? [{ name_ar: 'بنسلين', name_en: 'Penicillin' }] : [],
      program:
        random() < 0.5
          ? { name_ar: 'سيكرت سفن', name_en: 'Secret Seven', stage: 1 + Math.floor(random() * 7) }
          : null,
      sessions_left: random() < 0.5 ? 1 + Math.floor(random() * 9) : null,
    },
    weight,
    vitals: {
      measured_at: clinicIso(last.date, 10 * 60 + 24),
      systolic: 105 + Math.floor(random() * 30),
      diastolic: 65 + Math.floor(random() * 20),
      heart_rate: 60 + Math.floor(random() * 30),
      bmi: round1(last.kg / (height * height)),
    },
    plans,
    upcoming: [],
    documents,
    journey,
    next_step:
      doneSteps < JOURNEY_STEPS.length
        ? {
            name_ar: 'متابعة بعد الجلسة السابعة لمراجعة التقدم وتعديل الخطة لو محتاج.',
            name_en: 'Follow up after the 7th session to review progress and adjust the plan.',
          }
        : null,
  };
}

export const overviewHandlers: MockHandlers = {
  getPatientOverview: ({ url }) => {
    writeDb(ensurePatients);
    const patientId = url.split('/').at(-2) ?? '';
    const db = readDb();
    if (!db.patients.some((item) => item.id === patientId)) {
      throw new MockHttpError(404, 'NOT_FOUND');
    }
    const overview = overviewOf(patientId);

    // المواعيد الجاية من الـMock DB (الأيام اللي اتفتحت)
    const today = clinicToday();
    overview.upcoming = db.appointments
      .filter(
        (item) =>
          item.patient_id === patientId && item.date >= today && item.status === 'confirmed',
      )
      .sort((a, b) => (a.date + String(a.start)).localeCompare(b.date + String(b.start)))
      .slice(0, 4)
      .map((item) => {
        const service = SERVICES.find((entry) => entry.id === item.service_id);
        const practitioner = PRACTITIONERS.find((entry) => entry.id === item.practitioner_id);
        return {
          id: item.id,
          starts_at: clinicIso(item.date, item.start),
          specialty: service?.specialty ?? 'nutrition',
          practitioner_name_ar: practitioner?.name_ar ?? '',
          practitioner_name_en: practitioner?.name_en ?? '',
          service_name_ar: service?.name_ar ?? '',
          service_name_en: service?.name_en ?? '',
          status: item.status,
        };
      });

    // من غير medical.read: مفيش أي حاجة طبية (06 §3)
    if (!toMe(currentStaff()).permissions.includes('medical.read')) {
      overview.alerts.allergies = [];
      overview.weight = [];
      overview.vitals = null;
      overview.plans = [];
      overview.documents = overview.documents.filter((doc) => NON_MEDICAL.has(doc.category));
    }
    return overview;
  },
};
