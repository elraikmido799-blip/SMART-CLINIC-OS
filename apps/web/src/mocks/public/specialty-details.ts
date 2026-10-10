import type { Specialty } from '@oxygen/config';
import type { PublicSpecialtyDetail } from '@/types/public';
import { specialtiesMock } from './specialties';

/**
 * نفس رد GET /public/specialties/{slug}. محتوى وهمي لحد ما Oxygen يبعتوا (16 · 0.2):
 * الأسعار والمدد والأسئلة كلها للتجربة بس.
 */
type DetailExtras = Omit<PublicSpecialtyDetail, keyof (typeof specialtiesMock.data)[number]>;

const condition = (id: string, name_en: string, name_ar: string) => ({
  id,
  name_en,
  name_ar,
  icon_url: null,
});

const service = (
  slug: string,
  name_en: string,
  name_ar: string,
  duration_minutes: number,
  price_from_minor: number,
) => ({
  id: `svc-${slug}`,
  slug,
  name_en,
  name_ar,
  duration_minutes,
  price_from_minor,
  currency: 'EGP',
});

const faq = (
  id: string,
  question_en: string,
  question_ar: string,
  answer_en: string,
  answer_ar: string,
) => ({
  id,
  question_en,
  question_ar,
  answer_en,
  answer_ar,
});

const EXTRAS: Record<Specialty, DetailExtras> = {
  physio: {
    tagline_en: 'Move better, recover faster — with a plan made for you.',
    tagline_ar: 'اتحرك أحسن، واتعافى أسرع — بخطة معمولة ليك.',
    hero_image_url: '/images/home/hero.png',
    conditions: [
      condition('back-neck', 'Back & neck pain', 'آلام الضهر والرقبة'),
      condition('sports', 'Sports injuries', 'إصابات الملاعب'),
      condition('post-surgery', 'Post-surgery rehab', 'تأهيل بعد العمليات'),
      condition('knee-joint', 'Knee & joint pain', 'آلام الركبة والمفاصل'),
      condition('posture', 'Posture', 'القوام'),
      condition('neuro', 'Neurological rehab', 'التأهيل العصبي'),
    ],
    services: [
      service('physio-assessment', 'Initial Assessment', 'تقييم أولي', 60, 60000),
      service('manual-therapy', 'Manual Therapy', 'علاج طبيعي يدوي', 45, 50000),
      service(
        'exercise-program',
        'Therapeutic Exercise Program',
        'برنامج تأهيل بالتمارين',
        60,
        70000,
      ),
    ],
    faqs: [
      faq(
        'sessions',
        'How many sessions do I need?',
        'محتاج كام جلسة؟',
        'It depends on your condition. After the first assessment, your physiotherapist gives you a clear plan with the expected number of sessions.',
        'ده بيعتمد على حالتك. بعد أول تقييم، الأخصائي بيديك خطة واضحة فيها عدد الجلسات المتوقع.',
      ),
      faq(
        'referral',
        'Do I need a referral from a doctor?',
        'محتاج تحويل من دكتور؟',
        'No. You can book an assessment directly. If you have reports or X-rays, bring them with you.',
        'لأ. تقدر تحجز تقييم على طول، ولو معاك تقارير أو أشعة هاتها معاك.',
      ),
      faq(
        'wear',
        'What should I wear for my session?',
        'ألبس إيه في الجلسة؟',
        'Comfortable clothes that let you move freely, like sportswear.',
        'لبس مريح يخليك تتحرك بسهولة، زي لبس الرياضة.',
      ),
      faq(
        'insurance',
        'Is physiotherapy covered by insurance?',
        'التأمين بيغطي العلاج الطبيعي؟',
        'Some insurance plans cover it. Contact us on WhatsApp with your insurance details and we will check for you.',
        'فيه شركات تأمين بتغطيه. ابعتلنا بيانات التأمين على واتساب وإحنا نتأكدلك.',
      ),
    ],
  },
  nutrition: {
    tagline_en: 'Eat well, feel better — with a plan that fits your life.',
    tagline_ar: 'كُل صح، وحس بفرق — بخطة تناسب حياتك.',
    hero_image_url: null,
    conditions: [
      condition('weight', 'Weight management', 'التحكم في الوزن'),
      condition('diabetes', 'Diabetes nutrition', 'تغذية مرضى السكر'),
      condition('sports-nutrition', 'Sports nutrition', 'تغذية الرياضيين'),
      condition('pregnancy', 'Pregnancy & breastfeeding', 'الحمل والرضاعة'),
    ],
    services: [
      service('nutrition-assessment', 'Nutrition Assessment', 'تقييم تغذية', 45, 45000),
      service('body-composition', 'Body Composition Analysis', 'تحليل مكونات الجسم', 20, 20000),
    ],
    faqs: [
      faq(
        'follow-up',
        'How often are follow-ups?',
        'المتابعة كل قد إيه؟',
        'Usually every two weeks, in the clinic or online.',
        'غالبًا كل أسبوعين، في العيادة أو أونلاين.',
      ),
    ],
  },
  derm: {
    tagline_en: 'Healthy skin, lasting confidence.',
    tagline_ar: 'بشرة صحية، وثقة تدوم.',
    hero_image_url: null,
    conditions: [
      condition('acne', 'Acne', 'حب الشباب'),
      condition('pigmentation', 'Pigmentation', 'التصبغات'),
      condition('hair-loss', 'Hair loss', 'تساقط الشعر'),
      condition('eczema', 'Eczema', 'الإكزيما'),
    ],
    services: [service('derm-consultation', 'Dermatology Consultation', 'كشف جلدية', 30, 50000)],
    faqs: [],
  },
  internal: {
    tagline_en: 'Comprehensive care for your overall health.',
    tagline_ar: 'رعاية شاملة لصحتك كلها.',
    hero_image_url: null,
    conditions: [
      condition('blood-pressure', 'Blood pressure', 'الضغط'),
      condition('diabetes-care', 'Diabetes', 'السكر'),
      condition('digestive', 'Digestive problems', 'مشاكل الهضم'),
      condition('checkup', 'Annual check-up', 'الكشف الدوري'),
    ],
    services: [
      service('internal-consultation', 'Internal Medicine Consultation', 'كشف باطنة', 30, 50000),
    ],
    faqs: [],
  },
};

export const specialtyDetailMock = (slug: Specialty): PublicSpecialtyDetail | undefined => {
  const base = specialtiesMock.data.find((item) => item.slug === slug);
  return base && { ...base, ...EXTRAS[slug] };
};
