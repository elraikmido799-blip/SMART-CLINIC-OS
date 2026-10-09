import type { ListResponse, PublicSpecialty } from '@/types/public';

// نفس رد GET /public/specialties
export const specialtiesMock: ListResponse<PublicSpecialty> = {
  data: [
    {
      id: 'spec-nutrition',
      slug: 'nutrition',
      name_en: 'Nutrition',
      name_ar: 'التغذية العلاجية',
      summary_en: 'Personalized nutrition plans for a healthier you.',
      summary_ar: 'خطط تغذية مصممة ليك عشان صحة أحسن.',
      icon_url: '/images/specialties/nutrition.png',
    },
    {
      id: 'spec-physio',
      slug: 'physio',
      name_en: 'Physiotherapy',
      name_ar: 'العلاج الطبيعي',
      summary_en: 'Restore movement, reduce pain, improve function.',
      summary_ar: 'حركة أسهل، وألم أقل، وجسم أقوى.',
      icon_url: '/images/specialties/physio.png',
    },
    {
      id: 'spec-derm',
      slug: 'derm',
      name_en: 'Dermatology',
      name_ar: 'الجلدية',
      summary_en: 'Healthy skin, lasting confidence.',
      summary_ar: 'بشرة صحية وثقة تدوم.',
      icon_url: '/images/specialties/derm.png',
    },
    {
      id: 'spec-internal',
      slug: 'internal',
      name_en: 'Internal Medicine',
      name_ar: 'الباطنة',
      summary_en: 'Comprehensive care for your overall health.',
      summary_ar: 'رعاية شاملة لصحتك كلها.',
      icon_url: '/images/specialties/internal.png',
    },
  ],
};
