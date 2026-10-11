import type { AboutContent, HomeContent, OnlineConsultation } from '@/types/public';
import { faq } from './specialty-details';

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

// نفس رد GET /public/content/online-consultation. الأسعار الحقيقية جاية من Oxygen (16 · 0.2)
export const onlineConsultationMock: OnlineConsultation = {
  image_url: null,
  currency: 'EGP',
  specialties: [
    { specialty: 'nutrition', price_minor: 40000, duration_minutes: 30 },
    { specialty: 'physio', price_minor: 45000, duration_minutes: 30 },
    { specialty: 'derm', price_minor: 50000, duration_minutes: 20 },
    { specialty: 'internal', price_minor: 50000, duration_minutes: 20 },
  ],
  faqs: [
    faq(
      'online-how-join',
      'How do I join the call?',
      'بدخل المكالمة إزاي؟',
      'After you pay, we send you a video link by WhatsApp and SMS. Open it from your phone or laptop at your appointment time — no app needed.',
      'بعد ما تدفع بنبعتلك لينك الفيديو على واتساب وفي رسالة. افتحه من موبايلك أو اللابتوب في ميعادك، من غير ما تنزّل أي برنامج.',
    ),
    faq(
      'online-reports',
      'Can I share my lab results or reports?',
      'ينفع أبعت التحاليل أو التقارير؟',
      'Yes. Upload them in your patient portal before the call, or show them to the doctor on camera.',
      'أيوه. ارفعها في البوابة بتاعتك قبل المكالمة، أو وريها للدكتور في الكاميرا.',
    ),
    faq(
      'online-in-person',
      'What if I need to be examined in person?',
      'ولو محتاج كشف في العيادة؟',
      'Your specialist will tell you, and we will help you book a visit at the branch closest to you.',
      'الدكتور هيقولك، وإحنا هنساعدك تحجز زيارة في أقرب فرع ليك.',
    ),
    faq(
      'online-reschedule',
      'Can I reschedule?',
      'ينفع أغيّر الميعاد؟',
      'Yes, from your patient portal, up to 6 hours before the call.',
      'أيوه، من البوابة بتاعتك، لحد قبل المكالمة بـ6 ساعات.',
    ),
  ],
};
