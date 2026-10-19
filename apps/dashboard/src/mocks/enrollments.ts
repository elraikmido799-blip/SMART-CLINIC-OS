import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type {
  EnrollBody,
  Enrollment,
  EnrollmentEvent,
  MoveStageBody,
} from '@/features/programs/enrollment-types';
import type { Program } from '@/features/programs/types';
import { currentStaff, toMe } from './auth';
import { ensurePatients, PRACTITIONERS, pick, seeded } from './clinic';
import { readDb, writeDb, type MockDb } from './db';
import { ensurePrograms } from './programs';

/**
 * تسجيلات البرامج الوهمية (5.2): 18 مريض موزّعين على مراحل Secret Seven، بعضهم متأخر عن مرحلته،
 * وتاريخ انتقالات كل واحد. أي تسجيل أو نقل بيتخزن في الـMock DB.
 */
const DAY = 86_400_000;
const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

const SYSTEM = { name_ar: 'النظام', name_en: 'System' };

function seedEnrollments(db: MockDb) {
  if (db.enrollments.length > 0) return;
  ensurePrograms(db);
  const program = db.programs[0];
  if (!program || db.patients.length === 0) return;
  const random = seeded('oxygen-enrollments');
  const now = Date.now();

  db.enrollments = db.patients.slice(0, 18).map((patient, index) => {
    // الأكتر في العلاج والمتابعة (طبيعي)
    const stageIndex = Math.min(
      program.stages.length - 1,
      Math.floor(random() * random() * 7 * 1.6),
    );
    const stage = program.stages[stageIndex];
    // بعضهم جوه المدة وبعضهم عدّاها
    const inStage = Math.max(0, Math.round(stage.expected_days * (0.2 + random() * 1.4)));
    const entered = now - inStage * DAY;
    const owner = pick(random, PRACTITIONERS);

    // تاريخ الانتقالات: كل مرحلة قبلها بمدتها تقريبًا
    const history: EnrollmentEvent[] = [];
    let cursor = entered;
    for (let i = stageIndex; i >= 0; i--) {
      history.unshift({
        id: `evt-${index}-${i}`,
        from_stage_id: i === 0 ? null : program.stages[i - 1].id,
        to_stage_id: program.stages[i].id,
        at: new Date(cursor).toISOString(),
        by: i === 0 ? SYSTEM : { name_ar: owner.name_ar, name_en: owner.name_en },
        note: '',
      });
      cursor -= program.stages[Math.max(0, i - 1)].expected_days * DAY;
    }

    return {
      id: `enr-${index + 1}`,
      program_id: program.id,
      patient: {
        id: patient.id,
        name_ar: patient.name_ar,
        name_en: patient.name_en,
        file_no: patient.file_no,
      },
      branch_id: patient.branch_id,
      owner: { name_ar: owner.name_ar, name_en: owner.name_en },
      stage_id: stage.id,
      stage_entered_at: new Date(entered).toISOString(),
      started_on: history[0].at.slice(0, 10),
      status: 'active' as const,
      history,
    };
  });
}

export function ensureEnrollments(db: MockDb) {
  ensurePatients(db);
  seedEnrollments(db);
}

function requireEnroll() {
  if (!toMe(currentStaff()).permissions.includes('programs.enroll')) {
    throw new MockHttpError(403, 'FORBIDDEN');
  }
}

// الموظف بيشوف فروعه بس (إلا لو كل الفروع)
function visibleTo(item: Enrollment) {
  const staff = currentStaff();
  return staff.all_branches || staff.branch_ids.includes(item.branch_id);
}

const programOf = (db: MockDb, id: string): Program => {
  const found = db.programs.find((item) => item.id === id);
  if (!found) throw new MockHttpError(404, 'NOT_FOUND');
  return found;
};

const find = (db: MockDb, id: string) => {
  const found = db.enrollments.find((item) => item.id === id);
  if (!found) throw new MockHttpError(404, 'NOT_FOUND');
  return found;
};

export const enrollmentHandlers: MockHandlers = {
  getEnrollments: ({ params }) => {
    if (!toMe(currentStaff()).permissions.includes('programs.read'))
      throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureEnrollments);
    const { program_id, branch_id } = (params ?? {}) as { program_id?: string; branch_id?: string };
    const data = readDb().enrollments.filter(
      (item) =>
        item.program_id === program_id &&
        item.status === 'active' &&
        visibleTo(item) &&
        (!branch_id || branch_id === 'all' || item.branch_id === branch_id),
    );
    return { data };
  },

  getPatientEnrollments: ({ url }) => {
    writeDb(ensureEnrollments);
    const patientId = idFrom(url, 2);
    return {
      data: readDb().enrollments.filter((item) => item.patient.id === patientId && visibleTo(item)),
    };
  },

  enrollPatient: ({ body }) => {
    requireEnroll();
    const input = body as EnrollBody;
    writeDb(ensureEnrollments);
    let created: Enrollment | null = null;
    writeDb((db) => {
      const program = programOf(db, input.program_id);
      if (program.status !== 'active') throw new MockHttpError(409, 'PROGRAM_NOT_ACTIVE');
      const patient = db.patients.find((item) => item.id === input.patient_id);
      if (!patient) throw new MockHttpError(404, 'NOT_FOUND');
      if (
        db.enrollments.some(
          (item) =>
            item.program_id === program.id &&
            item.patient.id === patient.id &&
            item.status === 'active',
        )
      ) {
        throw new MockHttpError(409, 'ALREADY_ENROLLED');
      }
      const staff = currentStaff();
      const first = program.stages[0];
      const now = new Date().toISOString();
      created = {
        id: `enr-new-${Date.now()}`,
        program_id: program.id,
        patient: {
          id: patient.id,
          name_ar: patient.name_ar,
          name_en: patient.name_en,
          file_no: patient.file_no,
        },
        branch_id: input.branch_id,
        owner: staff.specialty ? { name_ar: staff.name_ar, name_en: staff.name_en } : null,
        stage_id: first.id,
        stage_entered_at: now,
        started_on: now.slice(0, 10),
        status: 'active',
        history: [
          {
            id: `evt-new-${Date.now()}`,
            from_stage_id: null,
            to_stage_id: first.id,
            at: now,
            by: { name_ar: staff.name_ar, name_en: staff.name_en },
            note: '',
          },
        ],
      };
      db.enrollments.push(created);
    });
    return created!;
  },

  moveEnrollmentStage: ({ url, body }) => {
    requireEnroll();
    const input = body as Omit<MoveStageBody, 'id'>;
    const id = idFrom(url, 2);
    writeDb(ensureEnrollments);
    writeDb((db) => {
      const enrollment = find(db, id);
      const program = programOf(db, enrollment.program_id);
      if (!program.stages.some((item) => item.id === input.to_stage_id)) {
        throw new MockHttpError(422, 'INVALID_STAGE');
      }
      if (enrollment.stage_id === input.to_stage_id) return;
      const staff = currentStaff();
      const now = new Date().toISOString();
      enrollment.history.push({
        id: `evt-${Date.now()}`,
        from_stage_id: enrollment.stage_id,
        to_stage_id: input.to_stage_id,
        at: now,
        by: { name_ar: staff.name_ar, name_en: staff.name_en },
        note: input.note.trim(),
      });
      enrollment.stage_id = input.to_stage_id;
      enrollment.stage_entered_at = now;
    });
    return find(readDb(), id);
  },
};
