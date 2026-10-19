import type { Specialty } from '@oxygen/config';
import type { FormTemplate } from '@/features/encounters/types';

/**
 * Templates الكشف الوهمية (نسخة 1 لكل تخصص). الحقيقي بيجي من الـAPI (form_template_versions)،
 * وبنّاء الفورمات في 4.9. التقييم الأول للعلاج الطبيعي زي D-11، والباقي أصغر لحد ما شاشاتهم (4.6 · 4.7 · 4.8).
 */
const opt = (value: string, ar: string, en: string) => ({ value, label_ar: ar, label_en: en });

const BODY_REGIONS = [
  opt('neck', 'الرقبة', 'Neck'),
  opt('shoulder', 'الكتف', 'Shoulder'),
  opt('lower_back', 'أسفل الظهر', 'Lower back'),
  opt('hip', 'الحوض', 'Hip'),
  opt('knee_right', 'الركبة اليمين', 'Right knee'),
  opt('knee_left', 'الركبة الشمال', 'Left knee'),
  opt('ankle', 'الكاحل', 'Ankle'),
];

const GRADES = [0, 1, 2, 3, 4, 5].map((grade) => opt(String(grade), `${grade}/5`, `${grade}/5`));

const row = (key: string, ar: string, en: string) => ({ key, label_ar: ar, label_en: en });

const physio: FormTemplate = {
  code: 'physio_initial_assessment',
  version: 1,
  specialty: 'physio',
  title_ar: 'علاج طبيعي — التقييم',
  title_en: 'Physiotherapy — Assessment',
  sections: [
    {
      id: 'pain',
      title_ar: 'الألم',
      title_en: 'Pain',
      fields: [
        {
          key: 'pain_level',
          type: 'scale',
          min: 0,
          max: 10,
          required: true,
          label_ar: 'مستوى الألم',
          label_en: 'Pain level',
          hint_ar: '0 = مفيش ألم، 10 = أسوأ ألم',
          hint_en: '0 = no pain, 10 = worst pain',
        },
        {
          key: 'pain_location',
          type: 'multiselect',
          options: BODY_REGIONS,
          label_ar: 'مكان الألم',
          label_en: 'Pain location',
        },
      ],
    },
    {
      id: 'rom',
      title_ar: 'مدى الحركة (ROM)',
      title_en: 'Range of motion (ROM)',
      fields: [
        {
          key: 'rom',
          type: 'grid',
          label_ar: 'مدى الحركة',
          label_en: 'Range of motion',
          rows: [
            row('knee_flexion', 'ثني الركبة', 'Knee flexion'),
            row('knee_extension', 'فرد الركبة', 'Knee extension'),
          ],
          columns: [
            {
              key: 'affected',
              type: 'number',
              min: -30,
              max: 180,
              label_ar: 'الجانب المصاب (°)',
              label_en: 'Affected side (°)',
            },
            {
              key: 'normal',
              type: 'number',
              min: -30,
              max: 180,
              label_ar: 'الطبيعي (°)',
              label_en: 'Normal (°)',
            },
          ],
        },
      ],
    },
    {
      id: 'strength',
      title_ar: 'القوة العضلية',
      title_en: 'Strength',
      fields: [
        {
          key: 'strength',
          type: 'grid',
          label_ar: 'القوة (اختبار يدوي)',
          label_en: 'Strength (manual muscle testing)',
          rows: [
            row('knee_flexion', 'ثني الركبة', 'Knee flexion'),
            row('knee_extension', 'فرد الركبة', 'Knee extension'),
            row('hip_abduction', 'إبعاد الفخذ', 'Hip abduction'),
            row('hip_extension', 'فرد الفخذ', 'Hip extension'),
          ],
          columns: [
            {
              key: 'grade',
              type: 'select',
              options: GRADES,
              label_ar: 'الدرجة',
              label_en: 'Grade',
            },
          ],
        },
        {
          key: 'functional',
          type: 'grid',
          label_ar: 'التقييم الوظيفي',
          label_en: 'Functional assessment',
          rows: [
            row('squat', 'القرفصاء', 'Squat'),
            row('stairs', 'السلالم', 'Stairs'),
            row('walking', 'المشي (200م)', 'Walking (200m)'),
            row('single_leg_balance', 'التوازن على رجل واحدة', 'Single leg balance'),
          ],
          columns: [
            { key: 'done', type: 'check', label_ar: 'اتعمل', label_en: 'Done' },
            {
              key: 'score',
              type: 'number',
              min: 0,
              max: 10,
              label_ar: 'الدرجة (0–10)',
              label_en: 'Score (0–10)',
            },
          ],
        },
      ],
    },
    {
      id: 'notes',
      title_ar: 'ملاحظات الكشف',
      title_en: 'Clinical notes',
      fields: [
        {
          key: 'notes',
          type: 'textarea',
          max_length: 1000,
          required: true,
          label_ar: 'ملاحظات الكشف',
          label_en: 'Clinical notes',
        },
      ],
    },
  ],
};

const nutrition: FormTemplate = {
  code: 'nutrition_followup',
  version: 1,
  specialty: 'nutrition',
  title_ar: 'تغذية — متابعة',
  title_en: 'Nutrition — Follow-up',
  sections: [
    {
      id: 'measures',
      title_ar: 'القياسات',
      title_en: 'Measurements',
      fields: [
        {
          key: 'weight',
          type: 'number',
          min: 20,
          max: 300,
          unit: 'kg',
          required: true,
          label_ar: 'الوزن (كجم)',
          label_en: 'Weight (kg)',
        },
        {
          key: 'waist',
          type: 'number',
          min: 30,
          max: 250,
          unit: 'cm',
          label_ar: 'محيط الوسط (سم)',
          label_en: 'Waist (cm)',
        },
        {
          key: 'adherence',
          type: 'scale',
          min: 0,
          max: 10,
          label_ar: 'الالتزام بالخطة',
          label_en: 'Plan adherence',
        },
      ],
    },
    {
      id: 'notes',
      title_ar: 'ملاحظات الكشف',
      title_en: 'Clinical notes',
      fields: [
        {
          key: 'notes',
          type: 'textarea',
          max_length: 1000,
          required: true,
          label_ar: 'ملاحظات الكشف',
          label_en: 'Clinical notes',
        },
      ],
    },
  ],
};

const derm: FormTemplate = {
  code: 'derm_consult',
  version: 1,
  specialty: 'derm',
  title_ar: 'جلدية — استشارة',
  title_en: 'Dermatology — Consultation',
  sections: [
    {
      id: 'skin',
      title_ar: 'الجلد',
      title_en: 'Skin',
      fields: [
        {
          key: 'skin_type',
          type: 'select',
          required: true,
          options: [
            opt('dry', 'جاف', 'Dry'),
            opt('normal', 'عادي', 'Normal'),
            opt('oily', 'دهني', 'Oily'),
            opt('combination', 'مختلط', 'Combination'),
          ],
          label_ar: 'نوع البشرة',
          label_en: 'Skin type',
        },
        {
          key: 'concerns',
          type: 'multiselect',
          options: [
            opt('acne', 'حب شباب', 'Acne'),
            opt('pigmentation', 'تصبغات', 'Pigmentation'),
            opt('hair_loss', 'تساقط شعر', 'Hair loss'),
            opt('eczema', 'إكزيما', 'Eczema'),
          ],
          label_ar: 'الشكوى',
          label_en: 'Concerns',
        },
      ],
    },
    {
      id: 'notes',
      title_ar: 'ملاحظات الكشف',
      title_en: 'Clinical notes',
      fields: [
        {
          key: 'notes',
          type: 'textarea',
          max_length: 1000,
          required: true,
          label_ar: 'ملاحظات الكشف',
          label_en: 'Clinical notes',
        },
      ],
    },
  ],
};

const internal: FormTemplate = {
  code: 'internal_consult',
  version: 1,
  specialty: 'internal',
  title_ar: 'باطنة — كشف',
  title_en: 'Internal medicine — Visit',
  sections: [
    {
      id: 'vitals',
      title_ar: 'العلامات الحيوية',
      title_en: 'Vitals',
      fields: [
        {
          key: 'vitals',
          type: 'grid',
          label_ar: 'العلامات الحيوية',
          label_en: 'Vitals',
          rows: [row('now', 'دلوقتي', 'Now')],
          columns: [
            {
              key: 'systolic',
              type: 'number',
              min: 60,
              max: 260,
              label_ar: 'الانقباضي',
              label_en: 'Systolic',
            },
            {
              key: 'diastolic',
              type: 'number',
              min: 30,
              max: 160,
              label_ar: 'الانبساطي',
              label_en: 'Diastolic',
            },
            {
              key: 'heart_rate',
              type: 'number',
              min: 30,
              max: 220,
              label_ar: 'النبض',
              label_en: 'Heart rate',
            },
          ],
        },
      ],
    },
    {
      id: 'notes',
      title_ar: 'ملاحظات الكشف',
      title_en: 'Clinical notes',
      fields: [
        {
          key: 'notes',
          type: 'textarea',
          max_length: 1000,
          required: true,
          label_ar: 'ملاحظات الكشف',
          label_en: 'Clinical notes',
        },
      ],
    },
  ],
};

export const TEMPLATES: Record<Specialty, FormTemplate> = { physio, nutrition, derm, internal };
