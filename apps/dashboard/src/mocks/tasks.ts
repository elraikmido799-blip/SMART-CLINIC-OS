import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { CreateTaskBody, Task, TaskPriority } from '@/features/tasks/types';
import { clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { ensurePatients, pick, seeded } from './clinic';
import { AGENTS, ensureLeads } from './crm';
import { readDb, writeDb, type MockDb } from './db';

/**
 * المهام الوهمية (6.3): متابعات على عملاء ومرضى، بعضها متأخر وبعضها النهارده وبعضها جاي.
 * كل مهمة متعيّنة لمسؤول (الـAgents وموظف الاستقبال)، فكل دور يلاقي "مهامي" فيها حاجة.
 */
const DAY = 86_400_000;

const TITLES = [
  'كلّمه تاني',
  'ابعتله الأسعار على واتساب',
  'تأكيد الميعاد',
  'متابعة بعد أول جلسة',
  'فكّره بالتحاليل',
  'عرض تجديد الباقة',
] as const;

const PRIORITIES: readonly TaskPriority[] = ['high', 'normal', 'normal', 'low'];

const OWNERS = [...AGENTS, { id: 'st-rec', name_ar: 'أحمد إبراهيم', name_en: 'Ahmed Ibrahim' }];

const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY).toISOString().slice(0, 10);

export function ensureTasks(db: MockDb) {
  if (db.tasks.length > 0) return;
  ensurePatients(db);
  ensureLeads(db);
  const random = seeded('oxygen-tasks');
  const today = clinicToday();
  const leads = db.leads.slice(0, 24);
  const patients = db.patients.slice(0, 12);
  const rows: Task[] = [];

  const add = (related: NonNullable<Task['related']>, branch_id: string) => {
    const owner = pick(random, OWNERS);
    const offset = Math.floor(random() * 9) - 3;
    rows.push({
      id: `task-${rows.length + 1}`,
      title: pick(random, TITLES),
      notes: '',
      due_on: addDays(today, offset),
      priority: pick(random, PRIORITIES),
      done_at: offset < -2 && random() < 0.5 ? new Date(Date.now() - DAY).toISOString() : null,
      branch_id,
      assignee: { id: owner.id, name_ar: owner.name_ar, name_en: owner.name_en },
      related,
    });
  };

  for (const lead of leads) {
    add({ type: 'lead', id: lead.id, name_ar: lead.name, name_en: lead.name }, lead.branch_id);
  }
  for (const patient of patients) {
    add(
      { type: 'patient', id: patient.id, name_ar: patient.name_ar, name_en: patient.name_en },
      patient.branch_id,
    );
  }
  db.tasks = rows;
}

const can = () => toMe(currentStaff()).permissions.includes('tasks.manage');

const visibleTo = (task: Task) => {
  const staff = currentStaff();
  return staff.all_branches || staff.branch_ids.includes(task.branch_id);
};

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

export const taskHandlers: MockHandlers = {
  getTasks: (args: FetchArgs) => {
    if (!can()) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureTasks);
    const { branch_id, scope, related_type, related_id } = (args.params ?? {}) as Record<
      string,
      string | undefined
    >;
    const me = currentStaff().id;
    const data = readDb()
      .tasks.filter(
        (task) =>
          visibleTo(task) &&
          (!branch_id || branch_id === 'all' || task.branch_id === branch_id) &&
          (scope !== 'mine' || task.assignee?.id === me) &&
          (!related_type || task.related?.type === related_type) &&
          (!related_id || task.related?.id === related_id),
      )
      .sort((a, b) => a.due_on.localeCompare(b.due_on));
    return { data };
  },

  createTask: ({ body }) => {
    if (!can()) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as CreateTaskBody;
    if (!input.title.trim() || !input.due_on) throw new MockHttpError(422, 'INVALID_TASK');
    writeDb(ensureTasks);
    const staff = currentStaff();
    const owner = input.assignee_id
      ? OWNERS.find((item) => item.id === input.assignee_id)
      : { id: staff.id, name_ar: staff.name_ar, name_en: staff.name_en };
    let created: Task | null = null;
    writeDb((db) => {
      let related: Task['related'] = null;
      if (input.related?.type === 'lead') {
        const lead = db.leads.find((item) => item.id === input.related?.id);
        if (lead) related = { type: 'lead', id: lead.id, name_ar: lead.name, name_en: lead.name };
      } else if (input.related?.type === 'patient') {
        const patient = db.patients.find((item) => item.id === input.related?.id);
        if (patient) {
          related = {
            type: 'patient',
            id: patient.id,
            name_ar: patient.name_ar,
            name_en: patient.name_en,
          };
        }
      }
      created = {
        id: `task-new-${Date.now()}`,
        title: input.title.trim(),
        notes: input.notes.trim(),
        due_on: input.due_on,
        priority: input.priority,
        done_at: null,
        branch_id: input.branch_id,
        assignee: owner ? { id: owner.id, name_ar: owner.name_ar, name_en: owner.name_en } : null,
        related,
      };
      db.tasks.push(created);
    });
    return created!;
  },

  setTaskDone: ({ url, body }) => {
    if (!can()) throw new MockHttpError(403, 'FORBIDDEN');
    const { done } = body as { done: boolean };
    const id = idFrom(url, 2);
    writeDb(ensureTasks);
    writeDb((db) => {
      const task = db.tasks.find((item) => item.id === id);
      if (!task) throw new MockHttpError(404, 'NOT_FOUND');
      task.done_at = done ? new Date().toISOString() : null;
    });
    return readDb().tasks.find((item) => item.id === id)!;
  },
};
