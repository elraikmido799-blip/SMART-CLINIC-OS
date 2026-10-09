import type { ListResponse, PublicProgram } from '@/types/public';

const PRICE_FROM_MINOR = 49900;

// نفس رد GET /public/programs
export const programsMock: ListResponse<PublicProgram> = {
  data: [
    {
      id: 'prog-online-nutrition',
      specialty: 'nutrition',
      name_en: 'Online Nutrition',
      name_ar: 'التغذية أونلاين',
      features_en: ['Personalized meal plans', 'Expert nutritionists', 'Progress tracking'],
      features_ar: ['خطة أكل مخصوصة ليك', 'أخصائيين تغذية', 'متابعة لتقدّمك'],
      price_from_minor: PRICE_FROM_MINOR,
      currency: 'EGP',
    },
    {
      id: 'prog-physio-home',
      specialty: 'physio',
      name_en: 'Physio Home',
      name_ar: 'علاج طبيعي في البيت',
      features_en: ['Guided exercise plans', 'Video consultations', 'At-home support'],
      features_ar: ['تمارين بإشراف', 'استشارات فيديو', 'متابعة وإنت في البيت'],
      price_from_minor: PRICE_FROM_MINOR,
      currency: 'EGP',
    },
    {
      id: 'prog-derm-follow-up',
      specialty: 'derm',
      name_en: 'Derm Follow-up',
      name_ar: 'متابعة الجلدية',
      features_en: ['Skin care plans', 'Regular check-ins', 'Expert guidance'],
      features_ar: ['خطة عناية بالبشرة', 'متابعة دورية', 'نصايح من متخصص'],
      price_from_minor: PRICE_FROM_MINOR,
      currency: 'EGP',
    },
    {
      id: 'prog-chronic-care',
      specialty: 'internal',
      name_en: 'Chronic Care',
      name_ar: 'رعاية الأمراض المزمنة',
      features_en: ['Long-term support', 'Health monitoring', 'Lifestyle coaching'],
      features_ar: ['متابعة على المدى الطويل', 'مراقبة صحتك', 'تعديل نمط الحياة'],
      price_from_minor: PRICE_FROM_MINOR,
      currency: 'EGP',
    },
  ],
};
