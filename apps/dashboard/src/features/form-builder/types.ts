import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';
import { formTemplateSchema } from '@/features/encounters/types';

const specialty = z.custom<Specialty>(isSpecialty);

/** قايمة الفورمات (D-17 · docs/20 · 4.9): فورم لكل تخصص، ولكل فورم نسخة منشورة وممكن مسودة معدّلة */
export const formTemplateSummarySchema = z.object({
  code: z.string(),
  specialty,
  title_ar: z.string(),
  title_en: z.string(),
  version: z.number(),
  has_draft: z.boolean(),
  updated_at: z.string().nullable(),
});

export type FormTemplateSummary = z.infer<typeof formTemplateSummarySchema>;

export const formTemplateDetailSchema = z.object({
  published: formTemplateSchema,
  // المسودة اللي لسه متنشرتش (null = مفيش تعديل معلّق)
  draft: formTemplateSchema.nullable(),
});

export type FormTemplateDetail = z.infer<typeof formTemplateDetailSchema>;
