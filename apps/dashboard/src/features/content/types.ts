import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

export const CONTENT_KINDS = ['article', 'video', 'offer'] as const;

export type ContentKind = (typeof CONTENT_KINDS)[number];

export const CONTENT_STATUSES = ['draft', 'published'] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/**
 * عنصر محتوى الموقع (D-33): مقال أو فيديو أو عرض، بالعربي والإنجليزي، مسودة أو منشور.
 * الحقول الخاصة بنوع بتفضل `null` في الباقي (الفيديو ليه رابط، والعرض ليه سعر قبل وبعد ونهاية).
 * الأسعار بالقروش، و`ends_on` يوم بتوقيت مصر.
 */
export const contentItemSchema = z.object({
  id: z.string(),
  kind: z.enum(CONTENT_KINDS),
  status: z.enum(CONTENT_STATUSES),
  specialty: z.custom<Specialty>(isSpecialty).nullable(),
  title_ar: z.string(),
  title_en: z.string(),
  excerpt_ar: z.string(),
  excerpt_en: z.string(),
  body_ar: z.string(),
  body_en: z.string(),
  cover_url: z.string().nullable(),
  video_url: z.string().nullable(),
  price_before: z.number().nullable(),
  price_after: z.number().nullable(),
  ends_on: z.string().nullable(),
  updated_at: z.string(),
});

export type ContentItem = z.infer<typeof contentItemSchema>;

export type ContentBody = Omit<ContentItem, 'id' | 'updated_at'>;

export type UpdateContentBody = { id: string } & ContentBody;

/**
 * صورة من صور الموقع بتتغير من الداشبورد (الـHero وصورة كل دكتور). `url` فاضي = الصورة الافتراضية في الموقع.
 * `slot`: `home_hero` · `about_hero` · `doctor:<id>`.
 */
export const siteImageSchema = z.object({
  slot: z.string(),
  url: z.string().nullable(),
  // اسم الدكتور لصور الدكاترة (فاضي للباقي)
  name_ar: z.string().nullable(),
  name_en: z.string().nullable(),
});

export type SiteImage = z.infer<typeof siteImageSchema>;

export type SetSiteImageBody = { slot: string; url: string | null };
