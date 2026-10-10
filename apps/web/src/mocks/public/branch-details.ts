import type { Specialty } from '@oxygen/config';
import type { PublicBranchDetail } from '@/types/public';
import { branchesMock } from './branches';

/**
 * نفس رد GET /public/branches/{slug}.
 * العناوين والتليفونات والصور الحقيقية جاية من Oxygen (16 · 0.2): لحد كده العنوان اسم المنطقة بس،
 * ومفيش تليفون (مش هنحط رقم وهمي ممكن يكون بتاع حد)، ومفيش صور.
 */
const EXTRAS: Record<string, { address_en: string; address_ar: string; specialties: Specialty[] }> =
  {
    'sheikh-zayed': {
      address_en: 'Sheikh Zayed City, Giza',
      address_ar: 'مدينة الشيخ زايد، الجيزة',
      specialties: ['nutrition', 'physio'],
    },
    tanta: {
      address_en: 'Tanta, Gharbia',
      address_ar: 'طنطا، الغربية',
      specialties: ['nutrition', 'physio', 'internal'],
    },
    tala: {
      address_en: 'Tala, Menoufia',
      address_ar: 'تلا، المنوفية',
      specialties: ['nutrition', 'physio', 'internal'],
    },
    heliopolis: {
      address_en: 'Heliopolis, Cairo',
      address_ar: 'مصر الجديدة، القاهرة',
      specialties: ['nutrition', 'physio', 'derm'],
    },
    'new-cairo': {
      address_en: 'Fifth Settlement, New Cairo',
      address_ar: 'التجمع الخامس، القاهرة الجديدة',
      specialties: ['nutrition', 'physio', 'derm', 'internal'],
    },
  };

export const branchDetailMock = (slug: string): PublicBranchDetail | undefined => {
  const branch = branchesMock.data.find((item) => item.slug === slug);
  const extras = EXTRAS[slug];
  if (!branch || !extras) return undefined;
  return { ...branch, ...extras, phone: null, whatsapp: null, photos: [] };
};
