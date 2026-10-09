import type { HomeContent } from '@/types/public';

// نفس رد GET /public/content/home. الأرقام الحقيقية جاية من Oxygen (16 · 0.2)
export const homeContentMock: HomeContent = {
  hero_image_url: '/images/home/hero.png',
  stats: { specialties: 4, branches: 5, specialists: 20, patients: 10000 },
};
