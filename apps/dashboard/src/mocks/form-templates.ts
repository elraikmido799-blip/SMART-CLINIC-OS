import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { Specialty } from '@oxygen/config';
import type { FormTemplate } from '@/features/encounters/types';
import type { FormTemplateDetail, FormTemplateSummary } from '@/features/form-builder/types';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';
import { TEMPLATES } from './templates';

/**
 * الفورمات الوهمية (4.9): كل تخصص ليه فورم منشور (النسخة 1 من templates.ts) ومسودة اختيارية.
 * النشر بيرفع النسخة، وكل كشف جديد بياخد النسخة المنشورة وقت ما بيبدأ (والقديم يفضل على نسخته).
 */
export type StoredFormTemplate = {
  code: string;
  published: FormTemplate;
  draft: FormTemplate | null;
  updated_at: string | null;
};

export function ensureFormTemplates(db: MockDb) {
  if (db.form_templates.length === 0) {
    db.form_templates = Object.values(TEMPLATES).map((template) => ({
      code: template.code,
      published: structuredClone(template),
      draft: null,
      updated_at: null,
    }));
  }
}

/** الفورم المنشور لتخصص (اللي الكشف الجديد بيبدأ بيه) */
export function publishedTemplateOf(db: MockDb, specialty: Specialty): FormTemplate {
  const found = db.form_templates.find((item) => item.published.specialty === specialty);
  return found ? found.published : TEMPLATES[specialty];
}

const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

const can = (permission: 'builders.propose' | 'builders.manage') => {
  const permissions = toMe(currentStaff()).permissions;
  return (
    permissions.includes(permission) ||
    (permission === 'builders.propose' && permissions.includes('builders.manage'))
  );
};

const detailOf = (item: StoredFormTemplate): FormTemplateDetail => ({
  published: item.published,
  draft: item.draft,
});

// نفس شروط الفرونت: عناوين · كل قسم فيه حقل · مفاتيح مش متكررة · اختيارات ليها اسم
function assertValid(template: FormTemplate) {
  const keys = new Set<string>();
  const fields = template.sections.flatMap((section) => section.fields);
  const bad =
    !template.title_ar.trim() ||
    !template.title_en.trim() ||
    template.sections.length === 0 ||
    template.sections.some((section) => section.fields.length === 0) ||
    fields.some((field) => {
      if (keys.has(field.key)) return true;
      keys.add(field.key);
      return (
        !field.label_ar.trim() ||
        !field.label_en.trim() ||
        ((field.type === 'select' || field.type === 'multiselect') && field.options.length === 0)
      );
    });
  if (bad) throw new MockHttpError(422, 'INVALID_TEMPLATE');
}

export const formTemplateHandlers: MockHandlers = {
  getFormTemplates: () => {
    if (!can('builders.propose')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureFormTemplates);
    const data: FormTemplateSummary[] = readDb().form_templates.map((item) => ({
      code: item.code,
      specialty: item.published.specialty,
      title_ar: item.published.title_ar,
      title_en: item.published.title_en,
      version: item.published.version,
      has_draft: item.draft !== null,
      updated_at: item.updated_at,
    }));
    return { data };
  },

  getFormTemplate: ({ url }) => {
    if (!can('builders.propose')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureFormTemplates);
    const item = readDb().form_templates.find((entry) => entry.code === idFrom(url, 1));
    if (!item) throw new MockHttpError(404, 'NOT_FOUND');
    return detailOf(item);
  },

  saveFormDraft: ({ url, body }) => {
    if (!can('builders.propose')) throw new MockHttpError(403, 'FORBIDDEN');
    const code = idFrom(url, 2);
    const template = body as FormTemplate;
    assertValid(template);
    writeDb((db) => {
      ensureFormTemplates(db);
      const item = db.form_templates.find((entry) => entry.code === code);
      if (!item) throw new MockHttpError(404, 'NOT_FOUND');
      item.draft = {
        ...template,
        code,
        specialty: item.published.specialty,
        version: item.published.version + 1,
      };
      item.updated_at = new Date().toISOString();
    });
    return detailOf(readDb().form_templates.find((entry) => entry.code === code)!);
  },

  publishFormTemplate: ({ url }) => {
    if (!can('builders.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const code = idFrom(url, 2);
    writeDb((db) => {
      ensureFormTemplates(db);
      const item = db.form_templates.find((entry) => entry.code === code);
      if (!item) throw new MockHttpError(404, 'NOT_FOUND');
      if (!item.draft) throw new MockHttpError(409, 'NO_DRAFT');
      assertValid(item.draft);
      item.published = item.draft;
      item.draft = null;
      item.updated_at = new Date().toISOString();
    });
    return detailOf(readDb().form_templates.find((entry) => entry.code === code)!);
  },
};
