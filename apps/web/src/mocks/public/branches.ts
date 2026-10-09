import type { ListResponse, PublicBranch } from '@/types/public';

// لينكات Google Maps الحقيقية جاية من Oxygen (16 · 0.2)، ودي بحث مؤقت باسم الفرع
const mapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const branch = (
  slug: string,
  name_en: string,
  name_ar: string,
  [latitude, longitude]: [number, number],
): PublicBranch => ({
  id: `branch-${slug}`,
  slug,
  name_en,
  name_ar,
  opens_at: '08:00',
  closes_at: '22:00',
  maps_url: mapsSearch(`${name_en}, Egypt`),
  latitude,
  longitude,
});

// نفس رد GET /public/branches. الأماكن تقريبية لحد ما Oxygen يبعتوا الحقيقية
export const branchesMock: ListResponse<PublicBranch> = {
  data: [
    branch('sheikh-zayed', 'Sheikh Zayed', 'الشيخ زايد', [30.0444, 30.9802]),
    branch('tanta', 'Tanta', 'طنطا', [30.7865, 31.0004]),
    branch('tala', 'Tala', 'تلا', [30.6797, 30.9436]),
    branch('heliopolis', 'Heliopolis', 'مصر الجديدة', [30.0911, 31.3225]),
    branch('new-cairo', 'New Cairo', 'التجمع الخامس', [30.0074, 31.4913]),
  ],
};
