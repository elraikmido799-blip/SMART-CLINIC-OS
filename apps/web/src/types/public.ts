import { z } from 'zod';
import type { Specialty } from '@oxygen/config';

/**
 * شكل داتا الصفحات التعريفية زي ما الـAPI هيرجّعها (/public/*).
 * الـSchema بتتأكد من الرد قبل ما يوصل للصفحة: لو الباك رجّع شكل غلط، القسم بيظهر رسالة بدل ما الصفحة تقع.
 * اللي ليه لغتين بيرجع _ar و _en، والفلوس بالقروش (ملف 15).
 */

const specialtySchema = z.enum([
  'nutrition',
  'physio',
  'derm',
  'internal',
]) satisfies z.ZodType<Specialty>;

export const publicSpecialtySchema = z.object({
  id: z.string(),
  slug: specialtySchema,
  name_ar: z.string(),
  name_en: z.string(),
  summary_ar: z.string(),
  summary_en: z.string(),
  icon_url: z.string(),
});

export const publicDoctorSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  specialty: specialtySchema,
  years_of_experience: z.number().int().nonnegative(),
  branch_ids: z.array(z.string()),
  // الصورة بتتغير من الداشبورد (DEC-25). null = لسه مفيش صورة
  photo_url: z.string().nullable(),
});

/**
 * بروفايل الطبيب (GET /public/doctors/{slug}).
 * الخدمات slugs من /public/services (DEC-31)، والمواعيد الجاية للعرض بس: صفحة الحجز بتتأكد منها تاني.
 */
export const publicDoctorDetailSchema = publicDoctorSchema.extend({
  title_ar: z.string(),
  title_en: z.string(),
  bio_ar: z.string(),
  bio_en: z.string(),
  // الأيام بأرقام JavaScript: 0 = الحد … 6 = السبت
  schedule: z.array(
    z.object({ branch_id: z.string(), days: z.array(z.number().int().min(0).max(6)) }),
  ),
  service_slugs: z.array(z.string()),
  // null = مش بيظهر (مراجعة A5: التعليم واللغات بيظهروا بس لو الداتا موجودة)
  education_ar: z.string().nullable(),
  education_en: z.string().nullable(),
  languages_ar: z.array(z.string()),
  languages_en: z.array(z.string()),
  next_slots: z.array(
    z.object({ starts_at: z.iso.datetime({ offset: true }), branch_id: z.string() }),
  ),
});

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const publicBranchSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  // "HH:mm" بتوقيت الفرع
  opens_at: timeSchema,
  closes_at: timeSchema,
  // لينك الفرع على Google Maps (DEC-28) + مكانه عشان الخريطة
  maps_url: z.url(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * صفحة الفرع (GET /public/branches/{slug}). الأطباء من /public/doctors متفلترين بـbranch_ids (DEC-31).
 * التليفون والواتساب null = الزرار بتاعهم مش بيظهر (الواتساب بيرجع لرقم Oxygen العام).
 */
export const publicBranchDetailSchema = publicBranchSchema.extend({
  address_ar: z.string(),
  address_en: z.string(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  specialties: z.array(specialtySchema),
  // صور الفرع الحقيقية من الداشبورد. فاضية = القسم مش بيظهر
  photos: z.array(z.object({ url: z.string(), alt_ar: z.string(), alt_en: z.string() })),
});

export const publicProgramSchema = z.object({
  id: z.string(),
  slug: z.string(),
  specialty: specialtySchema,
  name_ar: z.string(),
  name_en: z.string(),
  features_ar: z.array(z.string()),
  features_en: z.array(z.string()),
  price_from_minor: z.number().int().nonnegative(),
  currency: z.string(),
  // صورة الكارت في صفحة التخصص (بتتغير من الداشبورد). null = الكارت من غير صورة
  image_url: z.string().nullable(),
});

/**
 * صفحة التخصص (GET /public/specialties/{slug}). الأطباء والبرامج مش جوه الرد:
 * بيتجابوا من /public/doctors و/public/programs ويتفلتروا بالتخصص، فمفيش داتا متكررة.
 */
const faqSchema = z.object({
  id: z.string(),
  question_ar: z.string(),
  question_en: z.string(),
  answer_ar: z.string(),
  answer_en: z.string(),
});

export const publicSpecialtyDetailSchema = publicSpecialtySchema.extend({
  tagline_ar: z.string(),
  tagline_en: z.string(),
  // null = لسه مفيش صورة، والـHero بيعرض أيقونة التخصص جوه الحلقة
  hero_image_url: z.string().nullable(),
  conditions: z.array(
    z.object({
      id: z.string(),
      name_ar: z.string(),
      name_en: z.string(),
      // أيقونة منقطة (DEC-27). null = نقطة بلون التخصص
      icon_url: z.string().nullable(),
    }),
  ),
  services: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      name_ar: z.string(),
      name_en: z.string(),
      duration_minutes: z.number().int().positive(),
      price_from_minor: z.number().int().nonnegative(),
      currency: z.string(),
    }),
  ),
  faqs: z.array(faqSchema),
});

// الخدمة في الـList (GET /public/services) — بتستخدم لـgenerateStaticParams
export const publicServiceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  specialty: specialtySchema,
  name_ar: z.string(),
  name_en: z.string(),
  duration_minutes: z.number().int().positive(),
  price_from_minor: z.number().int().nonnegative(),
  currency: z.string(),
});

/**
 * صفحة الخدمة (GET /public/services/{slug}). الأطباء مش جوه الرد:
 * بيتجابوا من /public/doctors ويتفلتروا بتخصص الخدمة (DEC-31). الفروع ids من /public/branches.
 */
export const publicServiceDetailSchema = publicServiceSchema.extend({
  summary_ar: z.string(),
  summary_en: z.string(),
  // "مناسبة لمين" · "تتوقع إيه" · "التحضير": Lists قصيرة، وأي واحدة فاضية القسم بتاعها مش بيظهر
  suitable_for_ar: z.array(z.string()),
  suitable_for_en: z.array(z.string()),
  expect_ar: z.array(z.string()),
  expect_en: z.array(z.string()),
  preparation_ar: z.array(z.string()),
  preparation_en: z.array(z.string()),
  branch_ids: z.array(z.string()),
  faqs: z.array(faqSchema),
});

/**
 * صفحة البرنامج (GET /public/programs/{slug}): البرامج الأونلاين + Secret Seven.
 * Secret Seven مش في الـList (مش برنامج أونلاين، وبيجمع أكتر من تخصص)، فالتخصص والسعر ممكن يبقوا null.
 */
export const publicProgramDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  specialty: specialtySchema.nullable(),
  name_ar: z.string(),
  name_en: z.string(),
  summary_ar: z.string(),
  summary_en: z.string(),
  price_from_minor: z.number().int().nonnegative().nullable(),
  currency: z.string(),
  image_url: z.string().nullable(),
  for_whom_ar: z.array(z.string()),
  for_whom_en: z.array(z.string()),
  // المراحل بالترتيب: Secret Seven = 7، والبرامج الأونلاين = خطوات "بيمشي إزاي"
  stages: z.array(
    z.object({
      id: z.string(),
      title_ar: z.string(),
      title_en: z.string(),
      body_ar: z.string(),
      body_en: z.string(),
      includes_ar: z.array(z.string()),
      includes_en: z.array(z.string()),
    }),
  ),
  faqs: z.array(faqSchema),
});

// محتوى الصفحة الرئيسية اللي بيتغير من الداشبورد
export const homeContentSchema = z.object({
  hero_image_url: z.string(),
  stats: z.object({
    specialties: z.number().int().nonnegative(),
    branches: z.number().int().nonnegative(),
    specialists: z.number().int().nonnegative(),
    patients: z.number().int().nonnegative(),
  }),
});

// المقالة في الـList (GET /public/articles) — الغلاف من الداشبورد (16 · 2.9)، null = كارت بلون التخصص
export const publicArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  specialty: specialtySchema,
  title_ar: z.string(),
  title_en: z.string(),
  excerpt_ar: z.string(),
  excerpt_en: z.string(),
  cover_url: z.string().nullable(),
  reading_minutes: z.number().int().positive(),
  published_at: z.iso.date(),
});

/**
 * صفحة المقالة (GET /public/articles/{slug}). الكلام Markdown بلغتين.
 * reviewed_by: slug الدكتور اللي راجع المقالة (ثقة طبية) — بيتجاب اسمه من /public/doctors. null = مش بيظهر
 */
export const publicArticleDetailSchema = publicArticleSchema.extend({
  body_ar: z.string(),
  body_en: z.string(),
  reviewed_by: z.string().nullable(),
});

/**
 * صفحة العرض (GET /public/offers/{slug}) — Template واحد لكل حملة (W-12). الـList (GET /public/offers) للـslugs بس.
 * ends_at: آخر يوم في العرض. بعده الصفحة بتقول "العرض خلص" بدل الفورم. null = مفتوح.
 */
export const publicOfferSchema = z.object({
  id: z.string(),
  slug: z.string(),
  // في القايمة كمان عشان الـFooter يعرف العرض الشغال من غير ما يجيب التفاصيل
  ends_at: z.iso.date().nullable(),
});

export const publicOfferDetailSchema = publicOfferSchema.extend({
  specialty: specialtySchema.nullable(),
  title_ar: z.string(),
  title_en: z.string(),
  subtitle_ar: z.string(),
  subtitle_en: z.string(),
  image_url: z.string().nullable(),
  price_before_minor: z.number().int().nonnegative(),
  price_after_minor: z.number().int().nonnegative(),
  currency: z.string(),
  benefits_ar: z.array(z.string()),
  benefits_en: z.array(z.string()),
  terms_ar: z.array(z.string()),
  terms_en: z.array(z.string()),
  faqs: z.array(faqSchema),
});

// صفحة "عن Oxygen" (GET /public/content/about) — بتتغير من الداشبورد. الأرقام من content/home
// صفحة الاستشارة الأونلاين W-08: السعر والمدة لكل تخصص متاح أونلاين + الأسئلة
export const onlineConsultationSchema = z.object({
  // null = لسه مفيش صورة (16 · 2.5)، والـHero بيعرض رمز Oxygen
  image_url: z.string().nullable(),
  currency: z.string(),
  specialties: z.array(
    z.object({
      specialty: specialtySchema,
      price_minor: z.number().int().nonnegative(),
      duration_minutes: z.number().int().positive(),
    }),
  ),
  faqs: z.array(faqSchema),
});

// الصفحات القانونية W-18: كلام Markdown من الداشبورد + آخر تحديث
export const LEGAL_SLUGS = [
  'privacy',
  'terms',
  'refund-policy',
  'medical-disclaimer',
  'delete-account',
] as const;
export const legalSlugSchema = z.enum(LEGAL_SLUGS);

export const publicLegalPageSchema = z.object({
  slug: legalSlugSchema,
  title_ar: z.string(),
  title_en: z.string(),
  body_ar: z.string(),
  body_en: z.string(),
  updated_at: z.iso.date(),
});

export const aboutContentSchema = z.object({
  intro_ar: z.string(),
  intro_en: z.string(),
  // null = الصورة الافتراضية اللي في المشروع
  hero_image_url: z.string().nullable(),
  story_ar: z.array(z.string()),
  story_en: z.array(z.string()),
  mission_ar: z.string(),
  mission_en: z.string(),
  values: z.array(
    z.object({
      id: z.string(),
      title_ar: z.string(),
      title_en: z.string(),
      body_ar: z.string(),
      body_en: z.string(),
    }),
  ),
  // صور الأماكن الحقيقية (16 · 2.6). فاضية = القسم مش بيظهر
  photos: z.array(z.object({ url: z.string(), alt_ar: z.string(), alt_en: z.string() })),
});

export type PublicSpecialty = z.infer<typeof publicSpecialtySchema>;
export type PublicDoctor = z.infer<typeof publicDoctorSchema>;
export type PublicDoctorDetail = z.infer<typeof publicDoctorDetailSchema>;
export type PublicBranch = z.infer<typeof publicBranchSchema>;
export type PublicBranchDetail = z.infer<typeof publicBranchDetailSchema>;
export type PublicProgram = z.infer<typeof publicProgramSchema>;
export type PublicProgramDetail = z.infer<typeof publicProgramDetailSchema>;
export type PublicSpecialtyDetail = z.infer<typeof publicSpecialtyDetailSchema>;
export type PublicFaq = z.infer<typeof faqSchema>;
export type PublicService = z.infer<typeof publicServiceSchema>;
export type PublicServiceDetail = z.infer<typeof publicServiceDetailSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;
export type OnlineConsultation = z.infer<typeof onlineConsultationSchema>;
export type LegalSlug = z.infer<typeof legalSlugSchema>;
export type PublicLegalPage = z.infer<typeof publicLegalPageSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type PublicOffer = z.infer<typeof publicOfferSchema>;
export type PublicOfferDetail = z.infer<typeof publicOfferDetailSchema>;
export type PublicArticle = z.infer<typeof publicArticleSchema>;
export type PublicArticleDetail = z.infer<typeof publicArticleDetailSchema>;
export type ListResponse<T> = { data: T[] };
