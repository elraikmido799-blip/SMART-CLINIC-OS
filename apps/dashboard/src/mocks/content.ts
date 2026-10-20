import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type {
  ContentBody,
  ContentItem,
  SetSiteImageBody,
  SiteImage,
} from '@/features/content/types';
import { currentStaff, toMe } from './auth';
import { PRACTITIONERS } from './clinic';
import { readDb, writeDb, type MockDb } from './db';

/**
 * محتوى الموقع الوهمي (9.1): مقالات وفيديوهات وعروض (بعضها مسودة)، وصور الموقع القابلة للتغيير.
 * الصور بتتخزن Data URL صغيرة في المتصفح (`lib/image-resize.ts`) لحد ما الرفع الحقيقي يجهز.
 */
const base = {
  excerpt_ar: '',
  excerpt_en: '',
  body_ar: '',
  body_en: '',
  cover_url: null,
  video_url: null,
  price_before: null,
  price_after: null,
  ends_on: null,
};

const SEED: ContentItem[] = [
  {
    ...base,
    id: 'content-art-1',
    kind: 'article',
    status: 'published',
    specialty: 'physio',
    title_ar: '5 عادات بتحمي ضهرك لو شغلك على مكتب',
    title_en: '5 habits that protect your back at a desk job',
    excerpt_ar: 'تغييرات صغيرة في طريقة قعدتك وحركتك طول اليوم ممكن تفرق معاك.',
    excerpt_en: 'Small changes to how you sit and move during the day can make a real difference.',
    body_ar: 'اتحرك كل 30 دقيقة. خلّي الشاشة في مستوى عينك. اقعد وضهرك للكرسي.',
    body_en: 'Move every 30 minutes. Keep the screen at eye level. Sit all the way back.',
    updated_at: '2026-09-20T10:00:00.000Z',
  },
  {
    ...base,
    id: 'content-art-2',
    kind: 'article',
    status: 'draft',
    specialty: 'nutrition',
    title_ar: 'إزاي تظبط وجباتك في رمضان',
    title_en: 'How to plan your meals in Ramadan',
    excerpt_ar: 'نصايح بسيطة للسحور والفطار.',
    excerpt_en: 'Simple tips for suhoor and iftar.',
    updated_at: '2026-10-12T09:00:00.000Z',
  },
  {
    ...base,
    id: 'content-vid-1',
    kind: 'video',
    status: 'published',
    specialty: 'physio',
    title_ar: 'تمارين الرقبة في 3 دقايق',
    title_en: 'Neck exercises in 3 minutes',
    video_url: 'https://www.youtube.com/watch?v=oxygen-neck',
    updated_at: '2026-09-28T12:00:00.000Z',
  },
  {
    ...base,
    id: 'content-off-1',
    kind: 'offer',
    status: 'published',
    specialty: 'physio',
    title_ar: 'بداية العلاج الطبيعي: تقييم + 3 جلسات',
    title_en: 'Physio Start: assessment + 3 sessions',
    excerpt_ar: 'ابدأ تعافيك بتقييم كامل وأول 3 جلسات بسعر واحد.',
    excerpt_en: 'Start your recovery with a full assessment and your first three sessions.',
    price_before: 210000,
    price_after: 149900,
    ends_on: '2026-12-31',
    updated_at: '2026-10-01T08:00:00.000Z',
  },
  {
    ...base,
    id: 'content-off-2',
    kind: 'offer',
    status: 'draft',
    specialty: 'derm',
    title_ar: 'باقة الليزر الصيفية',
    title_en: 'Summer laser package',
    price_before: 900000,
    price_after: 750000,
    ends_on: '2027-03-01',
    updated_at: '2026-10-15T08:00:00.000Z',
  },
];

export function ensureContent(db: MockDb) {
  if (db.content_items.length === 0) db.content_items = structuredClone(SEED);
  if (db.site_images.length === 0) {
    db.site_images = [
      { slot: 'home_hero', url: null, name_ar: null, name_en: null },
      { slot: 'about_hero', url: null, name_ar: null, name_en: null },
      ...PRACTITIONERS.map((item) => ({
        slot: `doctor:${item.id}`,
        url: null,
        name_ar: item.name_ar,
        name_en: item.name_en,
      })),
    ];
  }
}

const needs = () => {
  if (!toMe(currentStaff()).permissions.includes('content.manage'))
    throw new MockHttpError(403, 'FORBIDDEN');
};

const clean = (input: ContentBody): ContentBody => {
  if (!input.title_ar.trim() || !input.title_en.trim())
    throw new MockHttpError(422, 'INVALID_CONTENT');
  if (input.kind === 'offer' && (!input.price_after || !input.ends_on))
    throw new MockHttpError(422, 'INVALID_CONTENT');
  return { ...input, title_ar: input.title_ar.trim(), title_en: input.title_en.trim() };
};

export const contentHandlers: MockHandlers = {
  getContent: () => {
    needs();
    writeDb(ensureContent);
    return {
      data: [...readDb().content_items].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    };
  },

  createContent: ({ body }) => {
    needs();
    const input = clean(body as ContentBody);
    writeDb(ensureContent);
    const created: ContentItem = {
      id: `content-${Date.now()}`,
      ...input,
      updated_at: new Date().toISOString(),
    };
    writeDb((db) => {
      db.content_items.push(created);
    });
    return created;
  },

  updateContent: ({ url, body }) => {
    needs();
    const id = url.split('/').at(-1) ?? '';
    const input = clean(body as ContentBody);
    writeDb(ensureContent);
    writeDb((db) => {
      const found = db.content_items.find((item) => item.id === id);
      if (!found) throw new MockHttpError(404, 'NOT_FOUND');
      Object.assign(found, input, { updated_at: new Date().toISOString() });
    });
    return readDb().content_items.find((item) => item.id === id)!;
  },

  getSiteImages: () => {
    needs();
    writeDb(ensureContent);
    return { data: readDb().site_images };
  },

  setSiteImage: ({ body }) => {
    needs();
    const input = body as SetSiteImageBody;
    if (input.url && input.url.length > 600_000) throw new MockHttpError(422, 'IMAGE_TOO_LARGE');
    writeDb(ensureContent);
    let saved: SiteImage | null = null;
    writeDb((db) => {
      const found = db.site_images.find((item) => item.slot === input.slot);
      if (!found) throw new MockHttpError(404, 'NOT_FOUND');
      found.url = input.url;
      saved = found;
    });
    return saved!;
  },
};
