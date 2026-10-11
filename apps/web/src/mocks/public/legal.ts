import type { LegalSlug, PublicLegalPage } from '@/types/public';

/**
 * نفس رد GET /public/legal/{slug}. ⚠️ الكلام ده مسودة عشان شكل الصفحات بس:
 * النص النهائي لازم يتراجع ويتبعت من محامي Oxygen (18 · "مستنيين إيه").
 */
const UPDATED_AT = '2026-10-01';

const PAGES: Record<LegalSlug, Omit<PublicLegalPage, 'slug' | 'updated_at'>> = {
  privacy: {
    title_en: 'Privacy Policy',
    title_ar: 'سياسة الخصوصية',
    body_en: `Oxygen ("we") respects your privacy. This policy explains what we collect, why, and the choices you have, in line with Egypt's Personal Data Protection Law No. 151 of 2020.

## What we collect

- **Contact details:** your name and mobile number when you book, register or send us a form.
- **Health information:** visit notes, measurements, plans, results and documents created during your care.
- **Usage data:** basic, anonymous information about how the website is used, to keep it fast and secure.

## Why we use it

- To book and remind you of appointments, and to provide your care.
- To call you back when you ask us to.
- To send offers **only** if you agree, and you can stop them any time.

## Who sees it

Only the Oxygen team involved in your care, and service providers we trust (such as payment and messaging) under strict agreements. We never sell your data.

## Your rights

You can ask to see, correct or delete your data, or withdraw your consent, from your patient portal or by contacting us. Some medical records must be kept for the period required by law.

## Contact

For any privacy question, message us from the [Contact page](/contact).`,
    body_ar: `Oxygen ("إحنا") بتحترم خصوصيتك. السياسة دي بتشرح بنجمع إيه، وليه، وإيه اختياراتك، حسب قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.

## بنجمع إيه

- **بيانات التواصل:** اسمك ورقم موبايلك لما تحجز أو تسجّل أو تبعتلنا فورم.
- **بيانات صحية:** ملاحظات الزيارات، والقياسات، والخطط، والنتايج، والملفات اللي بتتعمل وإحنا بنتابعك.
- **بيانات الاستخدام:** معلومات بسيطة ومن غير اسم عن استخدام الموقع، عشان يفضل سريع وآمن.

## بنستخدمها في إيه

- نحجزلك ونفكرك بمواعيدك، ونتابع حالتك.
- نكلمك لما تطلب ده.
- نبعتلك عروض **بس** لو وافقت، وتقدر توقفها في أي وقت.

## مين بيشوفها

فريق Oxygen اللي بيتابعك بس، وشركات بنثق فيها (زي الدفع والرسايل) باتفاقيات صارمة. إحنا عمرنا ما بنبيع بياناتك.

## حقوقك

تقدر تطلب تشوف بياناتك أو تصححها أو تمسحها، أو تلغي موافقتك، من البوابة بتاعتك أو لما تكلمنا. بعض السجلات الطبية لازم تتحفظ المدة اللي القانون بيحددها.

## تواصل

لأي سؤال عن الخصوصية، ابعتلنا من [صفحة تواصل](/contact).`,
  },
  terms: {
    title_en: 'Terms of Use',
    title_ar: 'شروط الاستخدام',
    body_en: `By using the Oxygen website, portal or app, you agree to these terms.

## Bookings

- Please arrive 10 minutes before your appointment.
- You can reschedule or cancel from your patient portal. See the [Refund Policy](/refund-policy) for paid bookings.

## Your account

Keep your mobile number up to date. Your account is personal: do not share your login codes with anyone.

## Medical information

Articles and pages on this website are for general education and do not replace a consultation. See the [Medical Disclaimer](/medical-disclaimer).

## Prices

Prices on the website start from the amounts shown and may change. The final price is confirmed at booking or after your assessment.

## Changes

We may update these terms. The date at the top of this page shows the last update.`,
    body_ar: `باستخدامك لموقع Oxygen أو البوابة أو الأبلكيشن، إنت موافق على الشروط دي.

## الحجز

- ياريت توصل قبل ميعادك بـ10 دقايق.
- تقدر تأجل أو تلغي من البوابة بتاعتك. للحجوزات المدفوعة شوف [سياسة الاسترداد](/refund-policy).

## حسابك

خلي رقم موبايلك محدّث. الحساب شخصي: متديش أكواد الدخول لحد.

## المعلومات الطبية

المقالات والصفحات اللي على الموقع للتوعية العامة ومش بديل عن الكشف. شوف [إخلاء المسؤولية الطبية](/medical-disclaimer).

## الأسعار

الأسعار على الموقع "تبدأ من" وممكن تتغير. السعر النهائي بيتأكد وقت الحجز أو بعد التقييم.

## التعديلات

ممكن نحدّث الشروط دي. التاريخ اللي فوق في الصفحة هو آخر تحديث.`,
  },
  'refund-policy': {
    title_en: 'Refund Policy',
    title_ar: 'سياسة الاسترداد',
    body_en: `## Cancelling a paid booking

- **More than 24 hours before:** full refund, or move the amount to another appointment.
- **Less than 24 hours before:** the amount moves to another appointment within 30 days.
- **Missed appointment without notice:** no refund.

## Online consultations

You can reschedule up to 6 hours before the call. If the call does not happen because of a problem on our side, you get a full refund or a new time — your choice.

## Packages and programs

Unused sessions can be refunded within 14 days of purchase. After that, they stay valid until the package end date.

## How refunds are paid

Refunds go back to the same payment method within 7–14 working days, depending on your bank.`,
    body_ar: `## إلغاء حجز مدفوع

- **قبل الميعاد بأكتر من 24 ساعة:** فلوسك كلها ترجع، أو تتنقل لميعاد تاني.
- **قبل الميعاد بأقل من 24 ساعة:** الفلوس تتنقل لميعاد تاني خلال 30 يوم.
- **لو مجتش ومبلغتش:** مفيش استرداد.

## الاستشارات الأونلاين

تقدر تغيّر الميعاد لحد قبل المكالمة بـ6 ساعات. لو المكالمة متمتش بسبب مشكلة عندنا، فلوسك ترجع كلها أو تاخد ميعاد جديد — زي ما تحب.

## الباقات والبرامج

الجلسات اللي متاخدتش ينفع تسترد فلوسها خلال 14 يوم من الشرا. بعد كده بتفضل شغالة لحد تاريخ انتهاء الباقة.

## الفلوس بترجع إزاي

بترجع على نفس طريقة الدفع خلال 7–14 يوم شغل، حسب البنك بتاعك.`,
  },
  'medical-disclaimer': {
    title_en: 'Medical Disclaimer',
    title_ar: 'إخلاء المسؤولية الطبية',
    body_en: `The content on the Oxygen website and app — including articles, programs and exercise videos — is for general information only.

- It does **not** replace a consultation, diagnosis or treatment by a qualified specialist.
- Results differ from person to person. Plans and timelines are set by your specialist after an assessment.
- Do not start, stop or change a medication or exercise program without asking your doctor.

> **In an emergency** — severe pain, chest pain or difficulty breathing — call **123** or go to the nearest emergency room. Do not use the website, chat or online consultation for emergencies.`,
    body_ar: `المحتوى اللي على موقع وأبلكيشن Oxygen — ومنه المقالات والبرامج وفيديوهات التمارين — معلومات عامة بس.

- **مش** بديل عن كشف أو تشخيص أو علاج من متخصص.
- النتايج بتختلف من شخص للتاني. الخطط ومدتها بيحددها المتخصص بتاعك بعد التقييم.
- متبدأش أو توقف أو تغيّر دوا أو تمارين من غير ما تسأل دكتورك.

> **في الطوارئ** — ألم شديد، ألم في الصدر، أو صعوبة في النفس — كلّم **123** أو روح أقرب طوارئ. متستخدمش الموقع ولا الشات ولا الاستشارة الأونلاين للطوارئ.`,
  },
  'delete-account': {
    title_en: 'Delete your account',
    title_ar: 'حذف حسابك',
    body_en: `You can ask us to delete your Oxygen account and personal data at any time.

## What happens

1. Send the request below with the mobile number on your account.
2. Our team calls you to confirm it is you.
3. We delete your account within **30 days** and send you a confirmation message.

## What is deleted

Your account, contact details, preferences and app data.

## What we must keep

Medical records and invoices are kept for the period required by Egyptian law, then deleted. They are not used for marketing.

Already signed in? You can also delete your account from **Profile & privacy** in your patient portal.`,
    body_ar: `تقدر تطلب نمسح حسابك في Oxygen وبياناتك الشخصية في أي وقت.

## إيه اللي بيحصل

1. ابعت الطلب اللي تحت برقم الموبايل اللي على حسابك.
2. فريقنا هيكلمك يتأكد إنه إنت.
3. بنمسح حسابك خلال **30 يوم**، وبنبعتلك رسالة تأكيد.

## إيه اللي بيتمسح

حسابك، وبيانات التواصل، واختياراتك، وبيانات الأبلكيشن.

## إيه اللي لازم نحتفظ بيه

السجلات الطبية والفواتير بتتحفظ المدة اللي القانون المصري بيحددها، وبعدين بتتمسح. ومش بتستخدم في أي تسويق.

داخل على حسابك؟ تقدر كمان تمسحه من **البروفايل والخصوصية** في البوابة بتاعتك.`,
  },
};

export const legalPageMock = (slug: LegalSlug): PublicLegalPage => ({
  slug,
  updated_at: UPDATED_AT,
  ...PAGES[slug],
});
