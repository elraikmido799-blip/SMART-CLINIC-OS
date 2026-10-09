import type { ListResponse, PublicDoctor } from '@/types/public';

// صورة واحدة للتطوير بس (DEC-21). الصور الحقيقية بتيجي من الداشبورد
const SAMPLE_PHOTO = '/images/mocks/doctor-sample.png';

// نفس رد GET /public/doctors
export const doctorsMock: ListResponse<PublicDoctor> = {
  data: [
    {
      id: 'doc-sara',
      slug: 'sara-mahmoud',
      name_en: 'Dr. Sara Mahmoud',
      name_ar: 'د. سارة محمود',
      specialty: 'nutrition',
      years_of_experience: 8,
      branch_ids: ['branch-sheikh-zayed'],
      photo_url: SAMPLE_PHOTO,
    },
    {
      id: 'doc-ahmed',
      slug: 'ahmed-hassan',
      name_en: 'Dr. Ahmed Hassan',
      name_ar: 'د. أحمد حسن',
      specialty: 'physio',
      years_of_experience: 12,
      branch_ids: ['branch-heliopolis'],
      photo_url: SAMPLE_PHOTO,
    },
    {
      id: 'doc-mona',
      slug: 'mona-el-sayed',
      name_en: 'Dr. Mona El Sayed',
      name_ar: 'د. منى السيد',
      specialty: 'derm',
      years_of_experience: 10,
      branch_ids: ['branch-new-cairo'],
      photo_url: SAMPLE_PHOTO,
    },
    {
      id: 'doc-karim',
      slug: 'karim-adel',
      name_en: 'Dr. Karim Adel',
      name_ar: 'د. كريم عادل',
      specialty: 'internal',
      years_of_experience: 15,
      branch_ids: ['branch-tanta'],
      // من غير صورة، عشان الشكل الافتراضي يبان
      photo_url: null,
    },
  ],
};
