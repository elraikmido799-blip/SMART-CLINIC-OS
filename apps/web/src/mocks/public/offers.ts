import type { ListResponse, PublicOfferDetail } from '@/types/public';
import { faq } from './specialty-details';

/**
 * نفس رد GET /public/offers و GET /public/offers/{slug}. عروض وهمية لحد ما Oxygen يعملوا أول حملة.
 * عرض واحد خلصان (ended-example) عشان حالة "العرض خلص" تتجرب.
 */
const OFFERS: PublicOfferDetail[] = [
  {
    id: 'offer-physio-start',
    slug: 'physio-start',
    specialty: 'physio',
    title_en: 'Physio Start: assessment + 3 sessions',
    title_ar: 'بداية العلاج الطبيعي: تقييم + 3 جلسات',
    subtitle_en:
      'Start your recovery with a full assessment and your first three sessions — at one price.',
    subtitle_ar: 'ابدأ تعافيك بتقييم كامل وأول 3 جلسات — بسعر واحد.',
    image_url: '/images/home/hero.png',
    price_before_minor: 210000,
    price_after_minor: 149900,
    currency: 'EGP',
    ends_at: '2026-12-31',
    benefits_en: [
      'Full assessment with a physiotherapist',
      '3 treatment sessions (45 min each)',
      'A home exercise plan',
      'Available in all branches',
    ],
    benefits_ar: [
      'تقييم كامل مع أخصائي علاج طبيعي',
      '3 جلسات علاج (45 دقيقة)',
      'خطة تمارين في البيت',
      'متاح في كل الفروع',
    ],
    terms_en: [
      'Valid for new patients only.',
      'Sessions must be used within 60 days of the assessment.',
      'Cannot be combined with other offers.',
    ],
    terms_ar: [
      'للمرضى الجداد بس.',
      'الجلسات لازم تتاخد خلال 60 يوم من التقييم.',
      'مينفعش يتجمع مع عروض تانية.',
    ],
    faqs: [
      faq(
        'how',
        'How do I get the offer?',
        'آخد العرض إزاي؟',
        'Leave your name and number, and our team will call you to choose your branch and time.',
        'سيب اسمك ورقمك، وفريقنا هيكلمك تختار الفرع والميعاد.',
      ),
    ],
  },
  {
    id: 'offer-ended',
    slug: 'ended-example',
    specialty: 'nutrition',
    title_en: 'Summer nutrition check-up',
    title_ar: 'كشف تغذية الصيف',
    subtitle_en: 'A nutrition assessment with body composition analysis.',
    subtitle_ar: 'تقييم تغذية مع تحليل مكونات الجسم.',
    image_url: null,
    price_before_minor: 65000,
    price_after_minor: 45000,
    currency: 'EGP',
    ends_at: '2026-08-31',
    benefits_en: ['Nutrition assessment', 'Body composition analysis'],
    benefits_ar: ['تقييم تغذية', 'تحليل مكونات الجسم'],
    terms_en: ['Valid until 31 August 2026.'],
    terms_ar: ['ساري لحد 31 أغسطس 2026.'],
    faqs: [],
  },
];

export const offersMock: ListResponse<{ id: string; slug: string }> = {
  data: OFFERS.map(({ id, slug }) => ({ id, slug })),
};

export const offerDetailMock = (slug: string) => OFFERS.find((offer) => offer.slug === slug);
