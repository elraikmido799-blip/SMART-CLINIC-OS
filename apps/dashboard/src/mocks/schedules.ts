import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type {
  AddLeaveBody,
  DoctorSchedule,
  SaveWeeklyBody,
} from '@/features/settings/schedule-types';
import { currentStaff, toMe } from './auth';
import { PRACTITIONERS } from './clinic';
import { readDb, writeDb, type MockDb } from './db';

/**
 * جداول الدكاترة الوهمية (9.5): جدول أسبوعي افتراضي (السبت → الخميس 9 ص → 5 م في فرعه، والجمعة إجازة) وإجازات.
 * فحص التعارض بيعدّ المواعيد المحجوزة (مش الملغية) في فترة الإجازة. الجدول هنا للإدارة، والكالندر لسه على
 * التوزيع الأولاني (DEC-73 نفس سبب الأوض).
 */
export function ensureSchedules(db: MockDb) {
  if (db.doctor_schedules.length > 0) return;
  db.doctor_schedules = PRACTITIONERS.map((item): DoctorSchedule => ({
    practitioner_id: item.id,
    name_ar: item.name_ar,
    name_en: item.name_en,
    specialty: item.specialty,
    weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      off: day === 6,
      branch_id: item.branch_ids[day % item.branch_ids.length],
      start: '09:00',
      end: '17:00',
    })),
    leaves: [],
  }));
}

const has = () => toMe(currentStaff()).permissions.includes('staff.manage');

const needs = () => {
  if (!has()) throw new MockHttpError(403, 'FORBIDDEN');
};

// مدير الفرع بيشوف دكاترة فرعه
const visibleTo = (schedule: DoctorSchedule) => {
  const me = currentStaff();
  return (
    me.all_branches || schedule.weekly.some((entry) => me.branch_ids.includes(entry.branch_id))
  );
};

const find = (db: MockDb, id: string) => {
  const found = db.doctor_schedules.find((item) => item.practitioner_id === id);
  if (!found || !visibleTo(found)) throw new MockHttpError(404, 'NOT_FOUND');
  return found;
};

const conflictsOf = (db: MockDb, id: string, from: string, to: string) =>
  db.appointments.filter(
    (item) =>
      item.practitioner_id === id &&
      item.date >= from &&
      item.date <= to &&
      item.status !== 'cancelled',
  ).length;

export const scheduleHandlers: MockHandlers = {
  getDoctorSchedules: () => {
    needs();
    writeDb(ensureSchedules);
    return { data: readDb().doctor_schedules.filter(visibleTo) };
  },

  saveWeekly: ({ url, body }) => {
    needs();
    const id = url.split('/').at(-2) ?? '';
    const { weekly } = body as Omit<SaveWeeklyBody, 'practitioner_id'>;
    if (weekly.length !== 7 || weekly.some((entry) => !entry.off && entry.start >= entry.end))
      throw new MockHttpError(422, 'INVALID_SCHEDULE');
    writeDb(ensureSchedules);
    writeDb((db) => {
      find(db, id).weekly = weekly;
    });
    return find(readDb(), id);
  },

  getLeaveConflicts: (args: FetchArgs) => {
    needs();
    const id = (args.url ?? '').split('/').at(-2) ?? '';
    const { from = '', to = '' } = (args.params ?? {}) as Record<string, string | undefined>;
    writeDb(ensureSchedules);
    const db = readDb();
    find(db, id);
    return { count: from && to && to >= from ? conflictsOf(db, id, from, to) : 0 };
  },

  addLeave: ({ url, body }) => {
    needs();
    const id = url.split('/').at(-2) ?? '';
    const input = body as Omit<AddLeaveBody, 'practitioner_id'>;
    if (!input.from || !input.to || input.to < input.from)
      throw new MockHttpError(422, 'INVALID_SCHEDULE');
    writeDb(ensureSchedules);
    writeDb((db) => {
      find(db, id).leaves.push({
        id: `leave-${Date.now()}`,
        from: input.from,
        to: input.to,
        reason: input.reason.trim(),
      });
    });
    return find(readDb(), id);
  },

  removeLeave: ({ url }) => {
    needs();
    const parts = url.split('/');
    const leaveId = parts.at(-1) ?? '';
    const id = parts.at(-3) ?? '';
    writeDb(ensureSchedules);
    writeDb((db) => {
      const schedule = find(db, id);
      schedule.leaves = schedule.leaves.filter((leave) => leave.id !== leaveId);
    });
    return find(readDb(), id);
  },
};
