import { z } from 'zod';

export const PROGRAM_STATUSES = ['draft', 'active', 'archived'] as const;

export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

/**
 * البرنامج (D-18 · docs/20 · 5.1): مراحل مرتبة (زي Secret Seven)، وكل مرحلة ليها مدة متوقعة وهدف وشرط الخروج.
 * أي برنامج جديد بيتعمل من الشاشة من غير كود (PRG-04). مثال المراحل في docs/07 §7.
 */
export const programStageSchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  // المدة المتوقعة في المرحلة (بالأيام): بعدها المريض بيتعلّم "متأخر"
  expected_days: z.number(),
  goal_ar: z.string(),
  goal_en: z.string(),
  // تخلص إمتى
  exit_ar: z.string(),
  exit_en: z.string(),
});

export type ProgramStage = z.infer<typeof programStageSchema>;

export const programSchema = z.object({
  id: z.string(),
  code: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  status: z.enum(PROGRAM_STATUSES),
  stages: z.array(programStageSchema),
});

export type Program = z.infer<typeof programSchema>;

export type ProgramBody = Omit<Program, 'id'>;

export const programSummarySchema = programSchema
  .omit({ stages: true })
  .extend({ stage_count: z.number(), enrolled_count: z.number() });

export type ProgramSummary = z.infer<typeof programSummarySchema>;
