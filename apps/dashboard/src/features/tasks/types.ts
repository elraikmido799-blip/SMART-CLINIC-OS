import { z } from 'zod';

const named = { name_ar: z.string(), name_en: z.string() };

export const TASK_PRIORITIES = ['high', 'normal', 'low'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_RELATED_TYPES = ['lead', 'patient'] as const;

export type TaskRelatedType = (typeof TASK_RELATED_TYPES)[number];

/**
 * المهمة (D-22 · docs/04 `tasks`): متابعة على عميل محتمل أو مريض، ليها يوم استحقاق ومسؤول.
 * `due_on` يوم بتوقيت مصر ("2026-10-20")، و`done_at` فاضي = لسه مخلصتش.
 */
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  due_on: z.string(),
  priority: z.enum(TASK_PRIORITIES),
  done_at: z.string().nullable(),
  branch_id: z.string(),
  assignee: z.object({ id: z.string(), ...named }).nullable(),
  related: z.object({ type: z.enum(TASK_RELATED_TYPES), id: z.string(), ...named }).nullable(),
});

export type Task = z.infer<typeof taskSchema>;

export type TaskQuery = {
  branch_id: string;
  // مهامي أنا، أو كل مهام الفرع
  scope: 'mine' | 'all';
  related_type?: TaskRelatedType;
  related_id?: string;
};

export type CreateTaskBody = {
  title: string;
  notes: string;
  due_on: string;
  priority: TaskPriority;
  branch_id: string;
  // فاضي = أنا
  assignee_id: string | null;
  related: { type: TaskRelatedType; id: string } | null;
};

export type SetTaskDoneBody = { id: string; done: boolean };

export type TaskBucket = 'overdue' | 'today' | 'upcoming' | 'done';

export const TASK_BUCKETS: readonly TaskBucket[] = ['overdue', 'today', 'upcoming', 'done'];

/** المتأخرة = يوم استحقاقها فات ولسه مخلصتش. `today` هو يوم مصر النهارده */
export function bucketOf(task: Task, today: string): TaskBucket {
  if (task.done_at) return 'done';
  if (task.due_on < today) return 'overdue';
  return task.due_on === today ? 'today' : 'upcoming';
}
