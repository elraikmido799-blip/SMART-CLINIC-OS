# 11 — APIs, Integrations, Third-party Services & App Stores

> بيرد على: **DEL-15 App Store/Google Play requirements** · **DEL-16 APIs/integrations** · **DEL-17 Third-party services**.

---

## 1. الـAPIs الداخلية (اللي هنبنيها)

| المجموعة | أمثلة | مين بيستخدمها |
|---|---|---|
| **Auth** | `/auth/otp/request` · `/auth/otp/verify` · `/auth/login` · `/auth/2fa` · `/auth/refresh` · `/auth/logout` | الكل |
| **Public** (من غير Login) | `/public/specialties` · `/public/services` · `/public/doctors` · `/public/branches` · `/public/availability` · `/public/content` · `/public/leads` | Website + App |
| **Patient** (بياناته هو بس) | `/patient/me` · `/patient/appointments` · `/patient/passport` · `/patient/documents` · `/patient/plans` · `/patient/packages` · `/patient/invoices` · `/patient/checkout` · `/patient/consents` · `/patient/export` · `/patient/account/delete` | App + Portal |
| **Staff** (حسب الصلاحيات) | `/staff/patients` · `/staff/calendar` · `/staff/appointments` · `/staff/encounters` · `/staff/plans` · `/staff/programs` · `/staff/leads` · `/staff/campaigns` · `/staff/catalog` · `/staff/invoices` · `/staff/refunds` · `/staff/reports` · `/staff/dashboards` · `/staff/settings` · `/staff/audit` | Dashboard |
| **Webhooks داخلة** | `/webhooks/payments/:provider` · `/webhooks/meta` · `/webhooks/whatsapp` · `/webhooks/tiktok` | المزودين |
| **Realtime** | Socket.IO: `branch:{id}` · `practitioner:{id}` | Dashboard |
| **Partner API** (P3) | API keys للشركات والمعامل + Webhooks خارجة | شركاء |

- التوثيق: **OpenAPI** بيتولد من الكود، و Swagger UI متاح على Staging (محمي).
- Endpoints الـRTK Query في الموقع والداشبورد والموبايل بتتولد من نفس الملف (`@rtk-query/codegen-openapi`)، فمفيش اختلاف بين التوثيق والكود.

---

## 2. الخدمات الخارجية (Integrations & Third-party Services)

| # | الخدمة | الغرض | المقترح | البديل | المرحلة |
|---|---|---|---|---|---|
| 1 | **Payment gateway** | الدفع الأونلاين + حفظ الكارت للتجديد | Paymob (لو مصر) | Fawry / Kashier (مصر) · Tap / HyperPay (الخليج) · Stripe (الدول المدعومة) | MVP |
| 2 | **WhatsApp Business Platform** | تذكيرات، تأكيدات، إيصالات (Templates). P2: الرسائل الداخلة ← CRM | Meta Cloud API مباشرة | BSP (زي Twilio أو 360dialog) | MVP |
| 3 | **SMS** | OTP + بديل لو الواتساب فشل | مزود محلي (لو مصر: زي Cequens أو Victory Link) | Twilio / Vonage | MVP |
| 4 | **Email** | الفواتير والتقارير والإشعارات | Amazon SES | Resend / Postmark | MVP |
| 5 | **Push notifications** | إشعارات التطبيق | Expo Push (FCM + APNs) | FCM مباشرة / OneSignal | MVP |
| 6 | **Meta Lead Ads** (Facebook + Instagram) | Leads أوتوماتيك للـCRM | Meta Graph API + Webhooks | Zapier / Make كحل مؤقت | MVP |
| 7 | **Meta Pixel + Conversions API** | قياس الحملات (Lead / Booking) **من غير بيانات صحية** | Meta | — | MVP |
| 8 | **TikTok Leads + Pixel / Events API** | Leads + قياس | TikTok for Business APIs | استيراد CSV | P2 (MVP: CSV) |
| 9 | **Google Analytics 4 + Tag Manager** | تحليلات الويبسايت | Google | Plausible / PostHog | MVP |
| 10 | **Google Maps** | خرايط الفروع | Maps Embed | OpenStreetMap | MVP |
| 11 | **Google Business Profile** | طلب تقييم عام من المرضى الراضيين | لينك التقييم المباشر | — | P2 |
| 12 | **Video consultation** | الاستشارة الأونلاين | MVP: لينك Google Meet / Zoom. P2: LiveKit (مفتوح المصدر وممكن نستضيفه) | Daily / Zoom Video SDK / Agora | MVP / P2 |
| 13 | **Object storage + CDN** | الملفات والصور والفيديو | Spaces / S3 + Cloudflare | Cloudflare R2 | MVP |
| 14 | **Video streaming** (فيديوهات التمارين) | تشغيل سلس على أي نت | MVP: MP4 على CDN. P2: Cloudflare Stream أو Mux | — | MVP / P2 |
| 15 | **PDF** | فواتير وتقارير بالعربي | Gotenberg (Self-hosted) | — | MVP |
| 16 | **Error monitoring** | الأخطاء | Sentry | — | MVP |
| 17 | **Uptime + Logs** | المراقبة | Better Stack / UptimeRobot | Grafana Cloud | MVP |
| 18 | **Bot protection** | حماية الفورمز العامة | Cloudflare Turnstile | reCAPTCHA | MVP |
| 19 | **Product analytics** | سلوك المستخدمين في التطبيق | PostHog (ممكن Self-host) | Mixpanel / Amplitude | P2 |
| 20 | **In-App Purchases** (لو لزم) | اشتراكات رقمية جوه التطبيق | RevenueCat (فوق Apple و Google) | StoreKit / Play Billing مباشرة | P2 |
| 21 | **Accounting / فاتورة إلكترونية** | تصدير للمحاسبة، والفاتورة الإلكترونية لو مطلوبة | حسب نظام Oxygen المحاسبي (Odoo / Zoho Books / QuickBooks / Daftra) | — | P3 |
| 22 | **أجهزة ومنصات صحية** | InBody · Apple Health · Google Health Connect | الـAPIs بتاعتهم | — | P3 |
| 23 | **المعامل** | استقبال نتايج التحاليل | حسب المعمل | — | P3 |
| 24 | **AI provider** | ميزات الـAI | يتحدد في P3 حسب الخصوصية والـDPA والتكلفة | — | P3 |
| 25 | **Calendar sync** | مزامنة مواعيد الأطباء مع Google Calendar | Google Calendar API | — | P3 |
| 26 | **Staff SSO** | دخول الموظفين بحساب الشركة | Google Workspace / Microsoft Entra ID | — | P3 |
| 27 | **Password manager** | حفظ وتسليم كلمات سر الحسابات | Bitwarden (Organization باسم Oxygen) | 1Password Business | من أول يوم |
| 28 | **Source control + CI** | الكود | GitHub (Organization باسم Oxygen) | GitLab | من أول يوم |
| 29 | **Design** | التصميم | Figma (Team باسم Oxygen) | — | من أول يوم |

### مبدأ مهم: كل خدمة خارجية وراها Adapter

- أي مزود (دفع، SMS، واتساب، فيديو) بنكلمه من خلال Interface داخلي (مثلاً `PaymentProvider`).
  **تغيير المزود = كتابة Adapter جديد بس**، من غير ما نلمس باقي النظام.
- كل الـWebhooks بتتسجل في `webhook_inbox` (بيمنع التكرار وبيسمح بإعادة المعالجة).
- لو المزود وقع: إعادة محاولة + بديل (الواتساب فشل ← SMS).

---

## 3. App Store و Google Play

### الحسابات

| | Apple App Store | Google Play |
|---|---|---|
| **نوع الحساب** | **Organization** باسم Oxygen (الكيان القانوني) | **Organization** باسم Oxygen |
| **المطلوب** | D-U-N-S Number + موقع رسمي + إيميل على دومين الشركة + شخص له صلاحية التوقيع عن الشركة | D-U-N-S Number + التحقق من المنظمة |
| **التكلفة** | $99 في السنة | $25 مرة واحدة |
| **ملاحظة مهمة** | إرشادات Apple (5.1.1 ix): تطبيقات الرعاية الصحية لازم يرفعها **الكيان اللي بيقدم الخدمة**، مش مطور فرد. يعني لازم يبقى حساب Oxygen نفسها | الحسابات **الشخصية** الجديدة لازم تعمل Closed testing مع عدد من المختبرين (حاليًا 12) لمدة 14 يوم قبل النشر. حساب الـOrganization مش مطلوب منه ده |

> ابدأوا في طلب الـD-U-N-S والحسابات **من دلوقتي**. ده أكتر حاجة بتأخر نشر التطبيقات.

### متطلبات النشر (Checklist)

- [ ] اسم التطبيق والوصف بالعربي والإنجليزي + Keywords.
- [ ] أيقونة 1024×1024 + Screenshots بالمقاسات المطلوبة + Feature graphic 1024×500 لجوجل.
- [ ] Privacy Policy URL + Support URL + الشروط.
- [ ] **App Privacy** (Apple) و**Data safety** (Google): بنعلن بالظبط الداتا اللي بنجمعها وليه.
- [ ] **Health apps declaration** في Google Play Console.
- [ ] **حذف الحساب من جوه التطبيق** (Apple) + **لينك ويب لحذف الحساب** (Google).
- [ ] نصوص واضحة لطلب الصلاحيات (الكاميرا، الصور، الإشعارات).
- [ ] **حساب تجريبي للمراجعين** + ملاحظات للمراجعة (والـOTP ثابت للحساب التجريبي بس).
- [ ] Medical disclaimer واضح، ومفيش ادعاءات طبية مبالغ فيها.
- [ ] Android: الـTarget API الحديث اللي جوجل بتطلبه (بيتجدد كل سنة، وExpo بيظبطه مع الترقية).
- [ ] Deep links (Universal Links / App Links) للإشعارات وللرجوع من الدفع.

### ⚠️ الدفع جوه التطبيق (مهم جدًا للـDigital Business)

Apple و Google بيفرضوا نظام الدفع بتاعهم (بعمولة 15–30%) على **المحتوى والخدمات الرقمية** اللي بتتباع جوه التطبيق.

| اللي بيتباع | الوضع الغالب | نظام الدفع |
|---|---|---|
| خدمات في العيادة (جلسات، باقات، برامج) | خدمات بتتقدم بره التطبيق (Apple 3.1.3 e) | **لازم** الـGateway بتاعنا، مش Apple / Google |
| استشارة لايف 1-لـ1 مع طبيب | Apple بتسمح بطرق دفع تانية للخدمات الشخصية اللايف زي الاستشارات الطبية (3.1.3 d) | الـGateway بتاعنا (ونتأكد من سياسة جوجل الحالية) |
| اشتراكات رقمية (محتوى، تتبع، برامج ذاتية) | محتوى أو خدمة رقمية جوه التطبيق (3.1.1) | غالبًا **لازم** In-App Purchase |
| اشتراك مختلط (خطة + متابعة أخصائي مش لايف) | منطقة رمادية | محتاج قرار ومراجعة الإرشادات قبل التنفيذ |

**التوصية:**
- نصمم الاشتراكات من الأول بحيث تدعم القناتين (العمود `channel` في الداتابيز).
- نقرر لكل منتج رقمي **قبل Phase 2** بعد مراجعة الإرشادات الحالية.
- البيع من الويبسايت ممكن، لكن في أغلب الدول **ممنوع نوجّه المستخدم من جوه التطبيق للشراء بره** (Anti-steering)، مع استثناءات في أسواق زي أمريكا والاتحاد الأوروبي.
- التفاصيل في [12-risks.md](12-risks.md) (R-02).

### التحديثات والإصدارات

- **EAS Update (OTA):** إصلاح Bugs في كود الـJavaScript من غير Review، بشرط إن التحديث ميغيرش غرض التطبيق.
- أي تغيير Native أو صلاحية جديدة = Build جديد + Review.
- مسار الإصدار: Internal testing ← TestFlight / Closed testing ← Phased / Staged rollout.
- المراجعة غالبًا من يوم لكام يوم، وأول مرة ممكن تطول، فبنرفع نسخة تجريبية بدري (من Sprint A5 في التطبيق).
