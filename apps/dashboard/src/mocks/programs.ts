import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { Program, ProgramBody, ProgramSummary } from '@/features/programs/types';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';

/**
 * البرامج الوهمية (5.1): Secret Seven بمراحله السبعة (مثال docs/07 §7 لحد ما Oxygen تأكد التفاصيل).
 * بتتولّد أول مرة وبعدها بتتخزن في الـMock DB.
 */
const stage = (
  n: number,
  name_ar: string,
  name_en: string,
  expected_days: number,
  goal_ar: string,
  goal_en: string,
  exit_ar: string,
  exit_en: string,
) => ({ id: `s7-stage-${n}`, name_ar, name_en, expected_days, goal_ar, goal_en, exit_ar, exit_en });

const SECRET_SEVEN: Program = {
  id: 'prog-secret-seven',
  code: 'secret_seven',
  name_ar: 'سيكرت سفن',
  name_en: 'Secret Seven',
  status: 'active',
  stages: [
    stage(
      1,
      'التقييم',
      'Assessment',
      7,
      'تقييم كامل وقياسات البداية',
      'Full assessment and baseline measurements',
      'التقييم اتقفل',
      'The assessment is signed',
    ),
    stage(
      2,
      'الخطة',
      'Plan',
      7,
      'بناء خطة العلاج ونشرها للمريض',
      'Build the treatment plan and share it',
      'الخطة اتنشرت',
      'The plan is published',
    ),
    stage(
      3,
      'العلاج',
      'Treatment',
      42,
      'الجلسات حسب الخطة',
      'Sessions according to the plan',
      'عدد الجلسات خلص أو التاريخ جه',
      'Session count reached or date passed',
    ),
    stage(
      4,
      'المتابعة',
      'Follow-up',
      28,
      'متابعات دورية',
      'Periodic follow-ups',
      'المتابعات اتعملت',
      'Follow-ups are done',
    ),
    stage(
      5,
      'التقدم',
      'Progress',
      14,
      'إعادة تقييم ومقارنة بالبداية',
      'Re-assessment compared with baseline',
      'الهدف اتحقق أو المدة خلصت',
      'Goal reached or time is up',
    ),
    stage(
      6,
      'الثبات',
      'Stabilization',
      56,
      'زيارات أقل ونصايح الثبات',
      'Fewer visits and stability advice',
      'ثبات لمدة 8 أسابيع',
      'Stable for 8 weeks',
    ),
    stage(
      7,
      'الاستمرار',
      'Maintenance',
      365,
      'خطة الاستمرار والصيانة',
      'Continuation and maintenance plan',
      'مستمرة (أو رجوع للتقييم)',
      'Ongoing (or back to assessment)',
    ),
  ],
};

export function ensurePrograms(db: MockDb) {
  if (db.programs.length === 0) db.programs = [structuredClone(SECRET_SEVEN)];
}

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

const can = (permission: 'builders.manage' | 'programs.read') =>
  toMe(currentStaff()).permissions.includes(permission);

function assertValid(body: ProgramBody) {
  const bad =
    !body.name_ar.trim() ||
    !body.name_en.trim() ||
    !/^[a-z][a-z0-9_]{1,40}$/.test(body.code) ||
    body.stages.length === 0 ||
    body.stages.some(
      (item) =>
        !item.name_ar.trim() ||
        !item.name_en.trim() ||
        !Number.isFinite(item.expected_days) ||
        item.expected_days < 1,
    );
  if (bad) throw new MockHttpError(422, 'INVALID_PROGRAM');
}

const summaryOf = (db: MockDb, program: Program): ProgramSummary => {
  const { stages, ...rest } = program;
  return {
    ...rest,
    stage_count: stages.length,
    enrolled_count: db.enrollments.filter(
      (item) => item.program_id === program.id && item.status === 'active',
    ).length,
  };
};

export const programHandlers: MockHandlers = {
  getPrograms: () => {
    if (!can('programs.read') && !can('builders.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensurePrograms);
    const db = readDb();
    return { data: db.programs.map((item) => summaryOf(db, item)) };
  },

  getProgram: ({ url }) => {
    if (!can('programs.read') && !can('builders.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensurePrograms);
    const found = readDb().programs.find((item) => item.id === idFrom(url, 1));
    if (!found) throw new MockHttpError(404, 'NOT_FOUND');
    return found;
  },

  createProgram: ({ body }) => {
    if (!can('builders.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as ProgramBody;
    assertValid(input);
    const created: Program = { ...input, id: `prog-${Date.now()}` };
    writeDb((db) => {
      ensurePrograms(db);
      if (db.programs.some((item) => item.code === input.code))
        throw new MockHttpError(409, 'CODE_TAKEN');
      db.programs.push(created);
    });
    return created;
  },

  updateProgram: ({ url, body }) => {
    if (!can('builders.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const id = idFrom(url, 1);
    const input = body as ProgramBody;
    assertValid(input);
    writeDb((db) => {
      ensurePrograms(db);
      const index = db.programs.findIndex((item) => item.id === id);
      if (index === -1) throw new MockHttpError(404, 'NOT_FOUND');
      if (db.programs.some((item) => item.code === input.code && item.id !== id)) {
        throw new MockHttpError(409, 'CODE_TAKEN');
      }
      db.programs[index] = { ...input, id };
    });
    return readDb().programs.find((item) => item.id === id)!;
  },
};
