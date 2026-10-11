import { SECRET_SEVEN_SLUG } from '@/lib/programs';
import type { PublicProgramDetail } from '@/types/public';
import { faq } from './specialty-details';
import { programsMock } from './programs';

/**
 * نفس رد GET /public/programs/{slug}. محتوى وهمي لحد ما Oxygen يبعتوا تفاصيل Secret Seven والبرامج (16 · 0.2).
 * من غير وعود طبية: مفيش أرقام نتايج ولا "هتخس كذا" — الخطة بتتحدد بعد التقييم.
 */

type Stage = PublicProgramDetail['stages'][number];

const stage = (
  id: string,
  [title_en, title_ar]: [string, string],
  [body_en, body_ar]: [string, string],
  includes_en: string[],
  includes_ar: string[],
): Stage => ({ id, title_en, title_ar, body_en, body_ar, includes_en, includes_ar });

const secretSeven: PublicProgramDetail = {
  id: 'prog-secret-seven',
  slug: SECRET_SEVEN_SLUG,
  specialty: null,
  name_en: 'The Secret Seven',
  name_ar: 'Secret Seven',
  summary_en:
    'Our signature 7-stage journey: nutrition and physiotherapy working together around one plan, with a follow-up at every stage.',
  summary_ar:
    'رحلتنا المميزة في 7 مراحل: التغذية والعلاج الطبيعي شغالين مع بعض على خطة واحدة، ومتابعة في كل مرحلة.',
  price_from_minor: null,
  currency: 'EGP',
  image_url: null,
  for_whom_en: [
    'You want to lose weight and move better at the same time',
    'You tried diets or exercise alone and want a plan that connects both',
    'You want a team following up with you, not a one-time visit',
  ],
  for_whom_ar: [
    'عايز تخس وتتحرك أحسن في نفس الوقت',
    'جربت رجيم أو رياضة لوحدهم، وعايز خطة بتربطهم ببعض',
    'عايز فريق يتابع معاك، مش زيارة واحدة وخلاص',
  ],
  stages: [
    stage(
      'assessment',
      ['Assessment', 'التقييم'],
      ['We understand where you are today.', 'بنفهم إنت فين النهارده.'],
      ['Body composition analysis', 'Movement and posture check'],
      ['تحليل مكونات الجسم', 'فحص الحركة والقوام'],
    ),
    stage(
      'plan',
      ['Plan', 'الخطة'],
      [
        'Your nutritionist and physiotherapist set one plan together.',
        'أخصائي التغذية والعلاج الطبيعي بيحطوا خطة واحدة مع بعض.',
      ],
      ['Personal meal plan', 'Exercise plan for your level'],
      ['خطة أكل خاصة بيك', 'تمارين على قد مستواك'],
    ),
    stage(
      'treatment',
      ['Treatment', 'العلاج'],
      ['You start the plan with sessions in the clinic.', 'بتبدأ الخطة بجلسات في العيادة.'],
      ['Physiotherapy sessions', 'Nutrition check-ins'],
      ['جلسات علاج طبيعي', 'متابعة تغذية'],
    ),
    stage(
      'follow-up',
      ['Follow-up', 'المتابعة'],
      ['We check how you are doing and adjust the plan.', 'بنشوف ماشي إزاي، وبنعدّل الخطة.'],
      ['Regular measurements', 'Plan adjustments'],
      ['قياسات دورية', 'تعديل الخطة'],
    ),
    stage(
      'progress',
      ['Progress', 'التقدّم'],
      ['You see your progress on your own chart.', 'بتشوف تقدّمك على الرسم بتاعك.'],
      ['Progress chart in your Health Passport'],
      ['رسم التقدّم في الـHealth Passport'],
    ),
    stage(
      'stabilization',
      ['Stabilization', 'التثبيت'],
      ['We help you turn the plan into daily habits.', 'بنساعدك تحوّل الخطة لعادات يومية.'],
      ['Habit coaching', 'Fewer, lighter sessions'],
      ['متابعة العادات', 'جلسات أقل وأخف'],
    ),
    stage(
      'maintenance',
      ['Maintenance', 'الاستمرار'],
      [
        'You keep going on your own, and we are here when you need us.',
        'بتكمل لوحدك، وإحنا موجودين لما تحتاجنا.',
      ],
      ['Check-ins when you need them', 'Online follow-up'],
      ['متابعة وقت ما تحتاج', 'متابعة أونلاين'],
    ),
  ],
  faqs: [
    faq(
      'duration',
      'How long does the Secret Seven take?',
      'Secret Seven بياخد وقت قد إيه؟',
      'It depends on your goals and starting point. After the assessment, we give you an expected timeline.',
      'ده بيعتمد على هدفك ونقطة البداية. بعد التقييم بنديك مدة متوقعة.',
    ),
    faq(
      'price',
      'How much does it cost?',
      'بيتكلف كام؟',
      'The price depends on the plan you need. Book an assessment first — it is the first stage of the journey.',
      'السعر بيعتمد على الخطة اللي محتاجها. احجز تقييم الأول — هو أول مرحلة في الرحلة.',
    ),
  ],
};

// البرامج الأونلاين: "بيمشي إزاي" في 3 خطوات، نفس الخطوات لكل البرامج لحد ما Oxygen يبعتوا التفاصيل
const onlineStages: Stage[] = [
  stage(
    'consultation',
    ['Online consultation', 'استشارة أونلاين'],
    ['A video call with your specialist.', 'مكالمة فيديو مع الأخصائي.'],
    [],
    [],
  ),
  stage(
    'plan',
    ['Your plan', 'خطتك'],
    [
      'Your plan arrives in the app and your Health Passport.',
      'خطتك بتوصلك على التطبيق والـHealth Passport.',
    ],
    [],
    [],
  ),
  stage(
    'follow-up',
    ['Follow-up', 'المتابعة'],
    ['Regular check-ins to adjust your plan.', 'متابعة دورية لتعديل الخطة.'],
    [],
    [],
  ),
];

export const programDetailMock = (slug: string): PublicProgramDetail | undefined => {
  if (slug === SECRET_SEVEN_SLUG) return secretSeven;
  const program = programsMock.data.find((item) => item.slug === slug);
  if (!program) return undefined;
  return {
    id: program.id,
    slug: program.slug,
    specialty: program.specialty,
    name_en: program.name_en,
    name_ar: program.name_ar,
    summary_en: `${program.features_en.join(', ')} — from home.`,
    summary_ar: `${program.features_ar.join('، ')} — وإنت في البيت.`,
    price_from_minor: program.price_from_minor,
    currency: program.currency,
    image_url: program.image_url,
    for_whom_en: ['You prefer to follow up from home', 'You live far from our branches'],
    for_whom_ar: ['بتفضّل تتابع من البيت', 'ساكن بعيد عن فروعنا'],
    stages: onlineStages,
    faqs: [],
  };
};
