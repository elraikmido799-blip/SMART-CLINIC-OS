import type { Specialty } from '@oxygen/config';
import type { PublicDoctorDetail } from '@/types/public';
import { doctorsMock } from './doctors';
import { servicesMock } from './services';

/**
 * نفس رد GET /public/doctors/{slug}. محتوى وهمي لحد ما Oxygen يبعتوا (16 · 0.2).
 * البروفايل مبني من الـList، والكلام حسب التخصص.
 */
const TITLES: Record<Specialty, { en: string; ar: string }> = {
  physio: { en: 'Consultant Physiotherapist', ar: 'استشاري علاج طبيعي' },
  nutrition: { en: 'Clinical Nutrition Specialist', ar: 'أخصائي تغذية علاجية' },
  derm: { en: 'Dermatology Specialist', ar: 'أخصائي جلدية' },
  internal: { en: 'Internal Medicine Consultant', ar: 'استشاري باطنة' },
};

const BIOS: Record<Specialty, { en: string; ar: string }> = {
  physio: {
    en: 'Focuses on musculoskeletal rehab, sports injuries and post-surgery recovery, with a clear plan for every patient.',
    ar: 'متخصص في تأهيل العضلات والمفاصل وإصابات الملاعب والتعافي بعد العمليات، بخطة واضحة لكل مريض.',
  },
  nutrition: {
    en: 'Builds realistic meal plans around your routine, for weight management and better health.',
    ar: 'بيعمل خطط أكل واقعية على يومك، للتحكم في الوزن وصحة أحسن.',
  },
  derm: {
    en: 'Treats common skin and hair concerns with simple, evidence-based routines.',
    ar: 'بيعالج مشاكل البشرة والشعر الشائعة بخطوات بسيطة ومثبتة علميًا.',
  },
  internal: {
    en: 'Looks at your whole health — blood pressure, diabetes and digestion — and follows up with you over time.',
    ar: 'بيبص على صحتك كلها — الضغط والسكر والهضم — وبيتابع معاك على طول.',
  },
};

// المواعيد الجاية: أول 3 أيام من النهارده، بتوقيت مصر (UTC+3 في الـMock)
function nextSlots(branchId: string): PublicDoctorDetail['next_slots'] {
  const today = new Date();
  return [1, 1, 2, 2, 3, 3].map((dayOffset, index) => {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + dayOffset),
    );
    // 10:00 · 17:30 بتوقيت مصر
    date.setUTCHours(index % 2 === 0 ? 7 : 14, index % 2 === 0 ? 0 : 30);
    return { starts_at: date.toISOString(), branch_id: branchId };
  });
}

export const doctorDetailMock = (slug: string): PublicDoctorDetail | undefined => {
  const doctor = doctorsMock.data.find((item) => item.slug === slug);
  if (!doctor) return undefined;
  const { specialty } = doctor;
  return {
    ...doctor,
    title_en: TITLES[specialty].en,
    title_ar: TITLES[specialty].ar,
    bio_en: BIOS[specialty].en,
    bio_ar: BIOS[specialty].ar,
    schedule: doctor.branch_ids.map((branch_id, index) => ({
      branch_id,
      // فرع أول: الحد → الأربع · فرع تاني: الخميس والسبت
      days: index === 0 ? [0, 1, 2, 3] : [4, 6],
    })),
    service_slugs: servicesMock.data
      .filter((service) => service.specialty === specialty)
      .map((service) => service.slug),
    // دكتور واحد من غير تعليم ولغات، عشان نشوف إن القسم بيستخبى
    education_en: doctor.photo_url ? 'Faculty of Medicine, Cairo University' : null,
    education_ar: doctor.photo_url ? 'كلية الطب، جامعة القاهرة' : null,
    languages_en: doctor.photo_url ? ['Arabic', 'English'] : [],
    languages_ar: doctor.photo_url ? ['العربي', 'الإنجليزي'] : [],
    next_slots: doctor.branch_ids[0] ? nextSlots(doctor.branch_ids[0]) : [],
  };
};
