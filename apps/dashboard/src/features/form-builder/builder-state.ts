import type { FormTemplate, TemplateField } from '@/features/encounters/types';

/** أنواع الحقول اللي البنّاء بيعملها (الجدول بيتحفظ لو موجود لكن مش بيتعمل من جديد — DEC-59) */
export const BUILDER_FIELD_TYPES = [
  'scale',
  'number',
  'text',
  'textarea',
  'select',
  'multiselect',
] as const;

export type BuilderFieldType = (typeof BUILDER_FIELD_TYPES)[number];

type Section = FormTemplate['sections'][number];

const shortId = () => crypto.randomUUID().slice(0, 8);

export function newField(type: BuilderFieldType): TemplateField {
  const base = { key: `field_${shortId()}`, label_ar: '', label_en: '' };
  switch (type) {
    case 'scale':
      return { ...base, type, min: 0, max: 10 };
    case 'number':
      return { ...base, type };
    case 'text':
      return { ...base, type };
    case 'textarea':
      return { ...base, type, max_length: 1000 };
    case 'select':
    case 'multiselect':
      return {
        ...base,
        type,
        options: [{ value: `opt_${shortId()}`, label_ar: '', label_en: '' }],
      };
  }
}

export const newSection = (): Section => ({
  id: `section_${shortId()}`,
  title_ar: '',
  title_en: '',
  fields: [],
});

/** بينقل عنصر في مكانه (فوق -1 / تحت +1)، ويسيبه لو في الحد */
export function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const mapSection = (
  template: FormTemplate,
  sectionId: string,
  change: (section: Section) => Section,
): FormTemplate => ({
  ...template,
  sections: template.sections.map((section) =>
    section.id === sectionId ? change(section) : section,
  ),
});

export const mapField = (
  template: FormTemplate,
  key: string,
  change: (field: TemplateField) => TemplateField,
): FormTemplate => ({
  ...template,
  sections: template.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => (field.key === key ? change(field) : field)),
  })),
});

export type BuilderIssue =
  | 'title'
  | 'noSections'
  | 'sectionTitle'
  | 'emptySection'
  | 'fieldLabel'
  | 'noOptions'
  | 'optionLabel'
  | 'range';

/** المشاكل اللي بتمنع النشر (نفس شروط الـAPI). بترجّع كل نوع مرة واحدة */
export function validateTemplate(template: FormTemplate): BuilderIssue[] {
  const issues = new Set<BuilderIssue>();
  if (!template.title_ar.trim() || !template.title_en.trim()) issues.add('title');
  if (template.sections.length === 0) issues.add('noSections');
  for (const section of template.sections) {
    if (!section.title_ar.trim() || !section.title_en.trim()) issues.add('sectionTitle');
    if (section.fields.length === 0) issues.add('emptySection');
    for (const field of section.fields) {
      if (!field.label_ar.trim() || !field.label_en.trim()) issues.add('fieldLabel');
      if (field.type === 'select' || field.type === 'multiselect') {
        if (field.options.length === 0) issues.add('noOptions');
        if (field.options.some((option) => !option.label_ar.trim() || !option.label_en.trim())) {
          issues.add('optionLabel');
        }
      }
      if (
        (field.type === 'scale' || field.type === 'number') &&
        field.min !== undefined &&
        field.max !== undefined &&
        field.min >= field.max
      ) {
        issues.add('range');
      }
    }
  }
  return [...issues];
}
