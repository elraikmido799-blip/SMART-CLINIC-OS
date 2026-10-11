import type { AboutContent, HomeContent } from '@/types/public';

// نفس رد GET /public/content/home. الأرقام الحقيقية جاية من Oxygen (16 · 0.2)
export const homeContentMock: HomeContent = {
  hero_image_url: '/images/home/hero.png',
  stats: { specialties: 4, branches: 5, specialists: 20, patients: 10000 },
};

// نفس رد GET /public/content/about. القصة والقيم الحقيقية جاية من Oxygen (16 · 0.2)، والصور من التصوير (16 · 2.6)
export const aboutContentMock: AboutContent = {
  intro_en:
    'An Egyptian clinic group where clinical nutrition and physical therapy work together — with dermatology and internal medicine under the same roof.',
  intro_ar:
    'مجموعة عيادات مصرية التغذية العلاجية والعلاج الطبيعي فيها شغالين مع بعض — ومعاهم الجلدية والباطنة في نفس المكان.',
  hero_image_url: null,
  story_en: [
    'Oxygen started with a simple idea: your body is one system, so your care should be one plan.',
    'Instead of visiting a nutritionist in one place and a physiotherapist in another, our specialists sit at the same table, share your file and agree on one plan with you.',
  ],
  story_ar: [
    'Oxygen بدأت بفكرة بسيطة: جسمك نظام واحد، فرعايتك لازم تبقى خطة واحدة.',
    'بدل ما تروح لأخصائي تغذية في مكان، وأخصائي علاج طبيعي في مكان تاني، أخصائيينا بيقعدوا على نفس الترابيزة، وبيشوفوا نفس ملفك، وبيتفقوا معاك على خطة واحدة.',
  ],
  mission_en: 'Small steps, put together, become strength.',
  mission_ar: 'خطوات صغيرة، لما تتجمع، بتبقى قوة.',
  values: [
    {
      id: 'one-plan',
      title_en: 'One plan',
      title_ar: 'خطة واحدة',
      body_en: 'Your specialists work from the same file and the same goals.',
      body_ar: 'الأخصائيين بتوعك شغالين على نفس الملف ونفس الأهداف.',
    },
    {
      id: 'honest',
      title_en: 'Honest care',
      title_ar: 'رعاية بصراحة',
      body_en: 'No miracle promises — a clear plan and real follow-up.',
      body_ar: 'من غير وعود معجزات — خطة واضحة ومتابعة حقيقية.',
    },
    {
      id: 'follow-up',
      title_en: 'Real follow-up',
      title_ar: 'متابعة حقيقية',
      body_en: 'We stay with you between visits, in the clinic and online.',
      body_ar: 'بنفضل معاك بين الزيارات، في العيادة وأونلاين.',
    },
    {
      id: 'close',
      title_en: 'Close to you',
      title_ar: 'قريبين منك',
      body_en: 'Branches in Cairo, Giza and the Delta, and online programs for everywhere else.',
      body_ar: 'فروع في القاهرة والجيزة والدلتا، وبرامج أونلاين لأي مكان تاني.',
    },
  ],
  photos: [],
};
