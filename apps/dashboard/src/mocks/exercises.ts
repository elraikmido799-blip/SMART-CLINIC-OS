import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { CarePlan, CarePlanBody } from '@/features/care-plans/types';
import type { Exercise, ExerciseBody, ExerciseRegion } from '@/features/exercises/types';
import { currentStaff } from './auth';
import { readDb, writeDb, type MockDb } from './db';

/**
 * مكتبة التمارين وخطط العلاج الوهمية (4.4 · 4.5). التمارين بتتولّد أول مرة وبعدها بتتخزن في الـMock DB.
 * الخطة الفاضية بتتولّد بأهداف عامة (زي D-11)، وأول حفظ بيخزّنها.
 */
const ex = (
  n: number,
  region: ExerciseRegion,
  ar: string,
  en: string,
  insAr: string,
  insEn: string,
): Exercise => ({
  id: `ex-${n}`,
  name_ar: ar,
  name_en: en,
  region,
  instructions_ar: insAr,
  instructions_en: insEn,
  media_url: null,
  active: true,
});

const SEED: Exercise[] = [
  ex(
    1,
    'knee',
    'تقوية الفخذ الأمامي',
    'Quadriceps Sets',
    'اضغط على الركبة ناحية السرير وثبّت 5 ثواني.',
    'Press the knee down into the bed and hold for 5 seconds.',
  ),
  ex(
    2,
    'knee',
    'انزلاق الكعب',
    'Heel Slides',
    'اسحب الكعب ناحية الجسم ببطء ثم أرجعه.',
    'Slowly slide the heel toward your body, then back.',
  ),
  ex(
    3,
    'knee',
    'رفع الرجل مستقيمة',
    'Straight Leg Raise',
    'ارفع الرجل مفرودة لحد 30 سم وثبّت ثانيتين.',
    'Lift the straight leg about 30 cm and hold for 2 seconds.',
  ),
  ex(
    4,
    'knee',
    'القرفصاء بدعم',
    'Supported Squat',
    'انزل ببطء مع الإمساك بكرسي، وركبك مش بتعدي أطراف الصوابع.',
    'Lower slowly holding a chair; knees stay behind the toes.',
  ),
  ex(
    5,
    'back',
    'إمالة الحوض',
    'Pelvic Tilt',
    'اضغط أسفل الظهر على الأرض وثبّت 5 ثواني.',
    'Press your lower back into the floor and hold for 5 seconds.',
  ),
  ex(
    6,
    'back',
    'الجسر',
    'Glute Bridge',
    'ارفع الحوض لحد ما الجسم يبقى خط مستقيم.',
    'Lift the hips until your body forms a straight line.',
  ),
  ex(
    7,
    'back',
    'القط والجمل',
    'Cat-Camel',
    'قوّس الظهر وعدّله ببطء على أربعة.',
    'Slowly arch and round your back on all fours.',
  ),
  ex(
    8,
    'neck',
    'ثني الرقبة للجنب',
    'Lateral Neck Stretch',
    'مِل الرأس ناحية الكتف وثبّت 15 ثانية.',
    'Tilt the head toward the shoulder and hold for 15 seconds.',
  ),
  ex(
    9,
    'neck',
    'تراجع الذقن',
    'Chin Tuck',
    'ادخّل الذقن لورا من غير ما تميل الرأس.',
    'Draw the chin back without tilting the head.',
  ),
  ex(
    10,
    'shoulder',
    'البندول للكتف',
    'Pendulum',
    'سيب الذراع متدلية وحرّكها في دوائر صغيرة.',
    'Let the arm hang and swing it in small circles.',
  ),
  ex(
    11,
    'shoulder',
    'التدوير الخارجي بالتيرا باند',
    'Band External Rotation',
    'دوّر الكوع المثني للخارج ضد المقاومة.',
    'Rotate the bent elbow outward against resistance.',
  ),
  ex(
    12,
    'hip',
    'إبعاد الفخذ على الجنب',
    'Side-lying Hip Abduction',
    'ارفع الرجل العلوية للجنب ببطء.',
    'Slowly raise the top leg to the side.',
  ),
  ex(
    13,
    'ankle',
    'الأبجدية بالكاحل',
    'Ankle Alphabet',
    'ارسم حروف الأبجدية بصباع القدم.',
    'Trace the alphabet with your big toe.',
  ),
  ex(
    14,
    'core',
    'البلانك',
    'Plank',
    'ثبّت الجسم على الساعدين والصوابع 20 ثانية.',
    'Hold on forearms and toes for 20 seconds.',
  ),
];

const GOALS = [
  'تقليل الألم لأقل من 2/10',
  'استرجاع مدى حركة الركبة كامل',
  'تقوية الفخذ الأمامي والخلفي',
  'الرجوع للأنشطة اليومية من غير ألم',
];

export function ensureExercises(db: MockDb) {
  if (db.exercises.length === 0) db.exercises = structuredClone(SEED);
}

function requireEdit() {
  if (!currentStaff().specialty) throw new MockHttpError(403, 'FORBIDDEN');
}

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

const clean = (body: ExerciseBody): ExerciseBody => {
  if (!body.name_ar.trim() || !body.name_en.trim()) throw new MockHttpError(422, 'INVALID_NAME');
  return { ...body, name_ar: body.name_ar.trim(), name_en: body.name_en.trim() };
};

export const exerciseHandlers: MockHandlers = {
  getExercises: (args: FetchArgs) => {
    writeDb(ensureExercises);
    const { q, region, include_inactive } = (args.params ?? {}) as {
      q?: string;
      region?: string;
      include_inactive?: boolean | string;
    };
    const text = (q ?? '').trim().toLowerCase();
    const all = include_inactive === true || include_inactive === 'true';
    const data = readDb().exercises.filter(
      (item) =>
        (all || item.active) &&
        (!region || item.region === region) &&
        (!text || item.name_ar.includes(text) || item.name_en.toLowerCase().includes(text)),
    );
    return { data };
  },

  createExercise: ({ body }) => {
    requireEdit();
    const input = clean(body as ExerciseBody);
    const created: Exercise = { ...input, id: `ex-new-${Date.now()}` };
    writeDb((db) => {
      ensureExercises(db);
      db.exercises.push(created);
    });
    return created;
  },

  updateExercise: ({ url, body }) => {
    requireEdit();
    const input = clean(body as ExerciseBody);
    const id = idFrom(url, 1);
    writeDb((db) => {
      const item = db.exercises.find((entry) => entry.id === id);
      if (!item) throw new MockHttpError(404, 'NOT_FOUND');
      Object.assign(item, input);
    });
    return readDb().exercises.find((entry) => entry.id === id)!;
  },

  getCarePlan: ({ url }) => {
    const patientId = idFrom(url, 2);
    const stored = readDb().care_plans.find((item) => item.patient_id === patientId);
    if (stored) return stored;
    const empty: CarePlan = {
      patient_id: patientId,
      goals: GOALS.map((text, index) => ({ id: `goal-${index}`, text, achieved: false })),
      sessions_per_week: 2,
      total_sessions: 10,
      exercises: [],
      updated_at: null,
    };
    return empty;
  },

  saveCarePlan: ({ url, body }) => {
    requireEdit();
    const patientId = idFrom(url, 2);
    const input = body as CarePlanBody;
    const plan: CarePlan = {
      ...input,
      patient_id: patientId,
      updated_at: new Date().toISOString(),
    };
    writeDb((db) => {
      db.care_plans = [...db.care_plans.filter((item) => item.patient_id !== patientId), plan];
    });
    return plan;
  },
};
