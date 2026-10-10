import { SPECIALTIES, type Specialty } from '@oxygen/config';
import type { ListResponse, PublicService, PublicServiceDetail } from '@/types/public';
import { faq, SPECIALTY_EXTRAS } from './specialty-details';

/**
 * نفس رد GET /public/services و GET /public/services/{slug}.
 * الخدمات نفسها (الاسم والمدة والسعر) من Mock التخصصات، عشان الرقم يبقى واحد في الصفحتين.
 * الكلام محتوى وهمي لحد ما Oxygen يبعتوا (16 · 0.2).
 */
export const servicesMock: ListResponse<PublicService> = {
  data: SPECIALTIES.flatMap((specialty) =>
    SPECIALTY_EXTRAS[specialty].services.map((service) => ({ ...service, specialty })),
  ),
};

type ServiceExtras = Omit<PublicServiceDetail, keyof PublicService>;

// الكلام العام لكل تخصص. الخدمة اللي ليها كلام خاص بيها بتاخده من SERVICE_EXTRAS
const SPECIALTY_DEFAULTS: Record<Specialty, ServiceExtras> = {
  physio: {
    summary_en: 'A one-to-one session with a physiotherapist, built around your goals.',
    summary_ar: 'جلسة لوحدك مع أخصائي العلاج الطبيعي، معمولة على أهدافك.',
    suitable_for_en: [
      'Pain that limits your daily movement',
      'Recovery after an injury or surgery',
    ],
    suitable_for_ar: ['ألم بيقيّد حركتك اليومية', 'التعافي بعد إصابة أو عملية'],
    expect_en: ['A short talk about your history', 'Hands-on treatment and guided exercises'],
    expect_ar: ['كلام قصير عن تاريخك الصحي', 'علاج بالإيد وتمارين بإشراف'],
    preparation_en: ['Wear comfortable clothes', 'Bring any reports or X-rays you have'],
    preparation_ar: ['البس لبس مريح', 'هات أي تقارير أو أشعة معاك'],
    branch_ids: ['branch-heliopolis', 'branch-new-cairo', 'branch-sheikh-zayed'],
    faqs: [],
  },
  nutrition: {
    summary_en: 'A session with a clinical nutritionist and a plan that fits your daily life.',
    summary_ar: 'جلسة مع أخصائي تغذية علاجية، وخطة تناسب يومك.',
    suitable_for_en: ['Weight loss or gain', 'Managing diabetes or cholesterol through food'],
    suitable_for_ar: ['خسارة أو زيادة الوزن', 'التحكم في السكر أو الكوليسترول بالأكل'],
    expect_en: ['Body measurements', 'A personal meal plan'],
    expect_ar: ['قياسات للجسم', 'خطة أكل خاصة بيك'],
    preparation_en: ['Bring recent blood tests if you have them'],
    preparation_ar: ['هات آخر تحاليل دم لو معاك'],
    branch_ids: ['branch-sheikh-zayed', 'branch-tanta', 'branch-new-cairo'],
    faqs: [],
  },
  derm: {
    summary_en: 'A dermatology consultation to diagnose and treat your skin or hair concern.',
    summary_ar: 'كشف جلدية لتشخيص وعلاج مشكلة البشرة أو الشعر.',
    suitable_for_en: ['Acne, pigmentation or hair loss'],
    suitable_for_ar: ['حب الشباب أو التصبغات أو تساقط الشعر'],
    expect_en: ['Skin examination', 'A treatment plan'],
    expect_ar: ['فحص للبشرة', 'خطة علاج'],
    preparation_en: ['Come without makeup if possible'],
    preparation_ar: ['تعالى من غير مكياج لو ينفع'],
    branch_ids: ['branch-heliopolis', 'branch-new-cairo'],
    faqs: [],
  },
  internal: {
    summary_en: 'An internal medicine consultation for a full picture of your health.',
    summary_ar: 'كشف باطنة يديك صورة كاملة عن صحتك.',
    suitable_for_en: ['Blood pressure, diabetes or digestive problems'],
    suitable_for_ar: ['الضغط أو السكر أو مشاكل الهضم'],
    expect_en: ['Medical examination', 'Tests if needed'],
    expect_ar: ['كشف طبي', 'تحاليل لو محتاج'],
    preparation_en: ['Bring your current medicines list'],
    preparation_ar: ['هات قايمة الأدوية اللي بتاخدها'],
    branch_ids: ['branch-tanta', 'branch-tala', 'branch-heliopolis'],
    faqs: [],
  },
};

const SERVICE_EXTRAS: Partial<Record<string, Partial<ServiceExtras>>> = {
  'physio-assessment': {
    summary_en:
      'Your first visit: a full assessment of your movement and pain, then a clear treatment plan.',
    summary_ar: 'أول زيارة: تقييم كامل لحركتك والألم، وبعدها خطة علاج واضحة.',
    expect_en: [
      'Questions about your pain, history and goals',
      'Movement, strength and posture tests',
      'Your diagnosis explained simply',
      'A written plan with the number of sessions',
    ],
    expect_ar: [
      'أسئلة عن الألم وتاريخك الصحي وأهدافك',
      'اختبارات للحركة والقوة والقوام',
      'شرح بسيط للتشخيص',
      'خطة مكتوبة فيها عدد الجلسات',
    ],
    faqs: [
      faq(
        'assessment-length',
        'Is the assessment a treatment session too?',
        'التقييم بيبقى فيه علاج كمان؟',
        'Usually yes — most assessments end with a short first treatment.',
        'غالبًا أيوه — أغلب التقييمات بتخلص بأول جلسة علاج قصيرة.',
      ),
    ],
  },
};

export const serviceDetailMock = (slug: string): PublicServiceDetail | undefined => {
  const service = servicesMock.data.find((item) => item.slug === slug);
  if (!service) return undefined;
  return { ...service, ...SPECIALTY_DEFAULTS[service.specialty], ...SERVICE_EXTRAS[slug] };
};
