# 17 — خريطة المشروع (كل فولدر وملف بيعمل إيه)

> لو مش عارف حاجة مكانها فين، أو عايز تضيف حاجة جديدة وتحطها فين، **الملف ده**.
> ليه اتعملت كده: [19-decisions.md](19-decisions.md) · اتعملت إمتى وإزاي: [18-dev-log.md](18-dev-log.md).
> ⏳ = لسه متعملش (هيتعمل في الخطة) · من غير علامة = موجود فعلًا.

---

## 1. الصورة الكبيرة

النظام **Separate** ([DEC-01](19-decisions.md#dec-01)): الموقع والداشبورد أبلكيشنين منفصلين، في **Repo واحد** ([DEC-02](19-decisions.md#dec-02)).

```text
SMART CLINIC OS/
├── apps/                    ← الأبلكيشنز. كل واحد مشروع كامل لوحده
│   ├── web/                 ← الموقع + الحجز + بوابة المريض (Next.js + Tailwind + shadcn)
│   ├── dashboard/           ← داشبورد الموظفين (React + Vite + antd)
│   └── mobile/ ⏳           ← تطبيق المريض (Expo) في الآخر
├── packages/                ← حاجات صغيرة مشتركة بين الأبلكيشنز (منطق وألوان، من غير شكل)
│   ├── config/              ← ألوان Oxygen والخطوط
│   └── shared/              ← اللغات، تنسيق الفلوس، الـMocks
├── design/                  ← التصميم من ChatGPT (DEC-19 · DEC-20 · DEC-21)
│   ├── brand/               ← ملفات الهوية: logo-color.png · logo-white.png · logo-symbol.png (شفافين، DEC-24) · بعدين: app-icon · doctor-avatar
│   │   └── original/        ← مراجع Oxygen زي ما وصلت
│   ├── mocks/               ← صور للتطوير بس: doctor-sample.png (الدكتورة)، مش بتتحط في الموقع الحقيقي
│   ├── website/             ← صور شاشات الموقع المقبولة: A0-design-system-v2.png ✅ (المرجع) · A0-photo-hero.png · A0-particle-ring.png · A0-dots-wordmark.png · A0-dot-wave.png · A1-specialty-icons.png · A2-branches-map.png · A2-app-phone.png
│   └── dashboard/           ← صور شاشات الداشبورد المقبولة (جلسة B في 14): D-01-login.png ✅ · D-02-reception.png ✅ · D-10-doctor-day.png ✅ · D-09-patient-360.png ✅ · D-11-encounter.png ✅ · D-20-crm.png ✅ · D-28-executive.png ✅ · D-02-reception-ar.png ✅
├── docs/                    ← التوثيق (الملفات دي): الخطط في 16 (الموقع) و20 (الداشبورد)
├── node_modules/            ← المكتبات المتسطبة (واحد للكل، ومش بيدخل Git)
└── ملفات الـRoot             ← §7
```

---

## 2. التشغيل

**أول مرة على أي جهاز:**

```powershell
pnpm install
copy apps\web\.env.example apps\web\.env.local
copy apps\dashboard\.env.example apps\dashboard\.env.local
```

**كل يوم (من فولدر المشروع):**

| الأمر | بيعمل إيه | اللينك |
|---|---|---|
| `pnpm dev:web` | الموقع بس | `http://localhost:3000` (أو 3001 لو 3000 مشغول — [P-03](18-dev-log.md#p-03)) |
| `pnpm dev:dashboard` | الداشبورد بس | `http://localhost:5173` |
| `pnpm dev` | الاتنين مع بعض | الاتنين |
| `pnpm build` | Build للاتنين (وبيراجع TypeScript) | — |
| `pnpm lint` | ESLint للاتنين | — |
| `pnpm format` | Prettier على كل الكود | — |

> قبل أي Commit، Husky بيشغّل Prettier لوحده على الملفات اللي داخلة الـCommit.

---

## 3. ملفات الـenv

| الأبلكيشن | الملف | المتغير | بيعمل إيه |
|---|---|---|---|
| الموقع | `apps/web/.env.local` | `NEXT_PUBLIC_SITE_URL` | لينك الموقع (الـSEO والـsitemap) |
| | | `NEXT_PUBLIC_API_URL` | لينك الـAPI بتاع مبرمج الباك |
| | | `NEXT_PUBLIC_API_MOCKING` | `enabled` = داتا وهمية · `disabled` = الـAPI الحقيقي |
| | | `MOCK_SCENARIO` | على السيرفر بس، مع الـMocks: `ok` · `empty` · `network` · `server` · `not-found` · `invalid`. بيجرّب كل حالة خطأ ([DEC-30](19-decisions.md#dec-30)) |
| | | `NEXT_PUBLIC_WHATSAPP_NUMBER` | رقم الواتساب بالصيغة الدولية من غير + |
| الداشبورد | `apps/dashboard/.env.local` | `VITE_API_URL` | لينك الـAPI |
| | | `VITE_API_MOCKING` | `enabled` · `disabled` |

- `.env.local` **مش بيدخل Git** (فيه القيم الحقيقية).
- `.env.example` **بيدخل Git** (الأسامي والشرح بس).
- الكود بيقرا الـenv من مكان واحد بس: `src/lib/env.ts` في كل أبلكيشن.
- أي متغير جديد: ضيفه في الـ3 أماكن (`.env.local` · `.env.example` · `lib/env.ts`) وفي الجدول ده.

---

## 4. الموقع — `apps/web`

```text
apps/web/
├── messages/
│   ├── ar.json · en.json        نصوص الموقع، مقسّمة بالصفحات (home · nav · footer …)
├── public/
│   ├── logo.png · logo-white.png   اللوجو الملون والأبيض (شفافين، من design/brand)
│   └── images/                  صور الموقع: shared/ (particle-ring · dot-wave · logo-symbol) · home/ (hero · app-phone) · specialties/ (الأيقونات المنقطة + hero-<تخصص> + physio-home) · conditions/ (أيقونات "بنعالج إيه": <تخصص>-<id>.png) · articles/ (الأغلفة: <slug>.png) · doctors/ (default.png) · mocks/ (للتطوير بس)
├── src/
│   ├── app/                     الصفحات (Next.js App Router)
│   │   ├── globals.css          بيربط ألوان packages/config بأسامي Tailwind و shadcn (ممنوع hex هنا) + قواعد الطباعة (.print-area)
│   │   ├── icon.png             الـFavicon (رمز O2 من design/brand)
│   │   ├── sitemap.ts · robots.ts   sitemap.xml (كل الصفحات باللغتين) · robots.txt (البوابة والدفع والدخول مقفولين) — 7.1
│   │   └── [locale]/            كل الصفحات تحت اللغة: /ar/… و /en/…
│   │       ├── layout.tsx       الـRoot layout: اللغة + الاتجاه + الخطوط + الألوان + Providers + Metadata
│   │       ├── error.tsx        أي خطأ مش متوقع: رسالة + "حاول تاني"
│   │       ├── not-found.tsx    صفحة 404 بلغة الزائر
│   │       ├── opengraph-image.tsx صورة المشاركة لكل الصفحات (next/og: تدرّج + لوجو)
│   │       ├── [...rest]/       أي مسار مش معروف ← not-found
│   │       ├── (marketing)/     الموقع التعريفي (القوسين = مش بيظهروا في الـURL)
│   │       │   ├── layout.tsx   Navbar + Footer + زرار واتساب + شريط النت المقطوع
│   │       │   ├── page.tsx     الصفحة الرئيسية W-01 (A1 · A2 · A3)
│   │       │   ├── _components/ أقسام الرئيسية: hero · booking-bar · specialties · doctors · branches · app-promo
│   │       │   ├── specialties/ W-03 (A4 · A8): page.tsx القايمة · [slug]/page.tsx صفحة التخصص
│   │       │   │   └── [slug]/_components/ specialty-hero · conditions-section · services-section (+ البرنامج)
│   │       │   ├── services/[slug]/ W-04 صفحة الخدمة
│   │       │   │   └── _components/ service-hero · service-details · service-booking-card
│   │       │   ├── doctors/     W-05 (A5): page.tsx القايمة بالفلاتر (+ _components/branch-filter)
│   │       │   │   └── [slug]/      البروفايل: page.tsx + _components/ doctor-profile-hero · doctor-booking-card
│   │       │   ├── branches/    W-06: page.tsx الخريطة + الفروع · [slug]/ صفحة الفرع (+ _components/branch-hero)
│   │       │   ├── programs/    W-09: page.tsx (Secret Seven + الأونلاين) · [slug]/ صفحة البرنامج (+ _components/program-hero)
│   │       │   ├── about/       W-02 "عن Oxygen"
│   │       │   ├── contact/     W-14 (الفورم = LeadForm المشترك)
│   │       │   ├── offers/[slug]/ W-12: صفحة أي عرض (حملة إعلانية)
│   │       │   ├── (الرئيسية) _components/offers-strip.tsx  شريط "عروض الشهر" (العروض الشغالة بس) — 4.14
│   │       │   ├── online-consultation/ W-08: الاستشارة الأونلاين (السعر لكل تخصص من content/online-consultation)
│   │       │   ├── book/        W-07: الحجز (page.tsx سيرفر + _components: الـWizard · الخطوات · الملخص · use-booking-state)
│   │       │   ├── checkout/    W-16: الدفع (page) · success/ · failed/ (+ _components: checkout-view · result-view) — noindex
│   │       │   ├── login/       W-17: الدخول (PhoneOtpForm + "في البوابة بتاعتك") — ?next= · noindex
│   │       │   ├── faqs/        الأسئلة الشائعة متجمعة (التخصصات + الأونلاين + Secret Seven) — L-56
│   │       │   ├── digital/     W-10: صفحة واحدة (المنتجات = البرامج الأونلاين · فورم "مهتم بإيه؟") — DEC-37
│   │       │   ├── app/         W-15: تحميل التطبيق (بادجات "قريبًا" + فورم "بلّغني")
│   │       │   ├── (legal)/     W-18: privacy · terms · refund-policy · medical-disclaimer · delete-account (+ _components/legal-page = الـTemplate)
│   │       │   ├── learn/       W-13: page.tsx (فلتر + كروت) · [slug]/ المقالة (+ _components/article-body: الـMarkdown)
│   │       │   └── …            (المرحلة 4 و5 كاملين)
│   │       ├── portal/          بوابة المريض (المرحلة 6 · DEC-39): layout.tsx لوحده (Sidebar + Bottom nav + Guard) · noindex
│   │       │   ├── page.tsx · appointments · passport · documents · plans · packages · invoices · profile   PP-01 → PP-08 (كل page.tsx سطرين، والصفحة في _components)
│   │       │   ├── _api/        appointments · care (البرنامج والباقات والـPassport والخطط) · documents · account (الفواتير والبروفايل)
│   │       │   └── _components/ portal-shell · portal-nav · <اسم>-view · page-header · portal-card · status-badge · program-stages · progress-bar · document-icon · weight-chart (SVG) · query-error
│   ├── api/                     الكلام مع الـAPI اللي بتستخدمه أكتر من صفحة
│   │   ├── leads.api.ts         RTK Query: إرسال أي فورم (Contact · العروض …)
│   │   ├── account-deletion.api.ts RTK Query: طلب حذف الحساب (W-18)
│   │   ├── auth.api.ts          RTK Query: الدخول بالـOTP (getMe · sendOtp · verifyOtp · logout) — الحجز والدخول والبوابة
│   │   ├── bookings.api.ts      RTK Query: المواعيد الفاضية · إنشاء حجز · حجز واحد — الحجز والدفع والبوابة (DEC-38)
│   │   ├── payments.api.ts      RTK Query: كود الخصم · بداية الدفع (+ completeDemoPayment للـMocks بس)
│   │   └── public/              Functions على السيرفر للصفحات التعريفية (DEC-11 · DEC-30)
│   │       ├── fetch-public.ts  GET /public/* ← Result (ok أو نوع الخطأ) + Schema + Mocks + timeout
│   │       └── specialties · doctors · branches · programs · content (home + about + online-consultation) .ts   Endpoint في كل ملف (specialties فيه كمان getSpecialty(slug)) · services (getServices · getService) · doctors (+ getDoctor) · branches (+ getBranch) · programs (+ getProgram) · articles (getArticles · getArticle) · offers (getOffers · getOffer)
│   ├── components/
│   │   ├── ui/                  Components بتاعة shadcn (بنسيبها زي ما الـCLI عملها)
│   │   ├── shared/              Components بتستخدمها أكتر من صفحة
│   │   │   ├── brand.ts         زراير الهوية (brandButton) + ألوان كل تخصص + أيقوناته
│   │   │   ├── container · section-heading · logo · dot-wave · particle-ring-image
│   │   │   ├── doctor-card · specialty-card · page-breadcrumb (مسار الصفحة، "الرئيسية" أوله)
│   │   │   ├── faq-section · booking-banner · doctors-grid-section · service-list   أقسام بتتكرر في صفحات المرحلة 4
│   │   │   ├── select-styles.ts شكل خانات الاختيار (شريط الحجز + فلتر الفروع)
│   │   │   ├── branches-map.tsx الخريطة + كروت الفروع (الرئيسية وصفحة الفروع)
│   │   │   ├── journey-section (+ journey-steps) · programs-section   Secret Seven والبرامج الأونلاين (الرئيسية وصفحة البرامج)
│   │   │   ├── lead-form.tsx    أي فورم Lead (تواصل · العروض · ديجيتال) — DEC-36 · interest = "مهتم بإيه؟" (DEC-37)
│   │   │   ├── article-card · specialty-chips   كارت المقالة · فلتر التخصص (الأطباء والمقالات)
│   │   │   ├── trust-bar.tsx    شريط الأرقام (الرئيسية و"عن Oxygen")
│   │   │   ├── store-badges.tsx بادجات المتاجر "قريبًا" (شريط التطبيق في الرئيسية + صفحة التطبيق)
│   │   │   ├── slot-picker · phone-otp-form   اختيار الميعاد (الحجز + التأجيل) · الدخول برقم الموبايل + OTP
│   │   │   ├── booking-details · sign-in-gate   تفاصيل حجز (الدفع والنجاح والبوابة) · الدخول مكان الصفحة لو مش داخل
│   │   │   ├── empty-state.tsx      الحالة الفاضية (أيقونة في دايرة منقطة + زرار) — البوابة وأي List
│   │   │   ├── json-ld.tsx          داتا منظمة لجوجل (MedicalOrganization · MedicalClinic · Physician)
│   │   │   ├── markdown-body · field-message   كلام Markdown (المقالات والقانوني) · رسايل أخطاء الفورمات
│   │   │   ├── dotted-steps.tsx خطوات مرقّمة منقطة بالطول (الخدمة ومراحل البرنامج)
│   │   │   ├── section-state · retry-button   حالات الخطأ والفاضي في أي قسم
│   │   │   ├── offline-notice.tsx شريط "إنت مش متصل بالنت"
│   │   │   ├── reveal-group.tsx Lists عناصرها بتظهر ورا بعض (RevealGroup · RevealItem)
│   │   │   └── reveal.tsx       الظهور مع الـScroll (Motion)
│   │   ├── layout/              navbar · mobile-menu · language-switcher · footer · whatsapp-button · nav-links · account-link (+ -view: الشكل · -live: بيسأل الـAPI، lazy — "دخول المريض" أو "بوابتي")
│   │   └── providers.tsx        الـProviders: الاتجاه · Motion · Redux · Tooltip · Toaster
│   │   ├── client-messages.tsx  الترجمات اللي بتروح للمتصفح بالـnamespace (BASE + اللي الصفحة محتاجاه) — DEC-40
│   ├── i18n/                    اللغات (next-intl)
│   │   ├── routing.ts           اللغات المتاحة (من packages/shared)
│   │   ├── request.ts           بيحدد اللغة ويحمّل ملف الترجمة
│   │   └── navigation.ts        Link · useRouter · usePathname (استخدمهم بدل بتوع Next)
│   ├── lib/
│   │   ├── maps.ts             لينك Google Maps Embed (الرئيسية والفروع)
│   │   ├── programs.ts         SECRET_SEVEN_SLUG
│   │   ├── offers.ts           todayInCairo · isOfferActive (العرض شغال ولا خلص)
│   │   ├── submit-error.ts     toSubmitError · isOffline (أي فورم بيبعت)
│   │   ├── dates.ts            توقيت مصر: todayInCairo · addDays · cairoIso · cairoHourOf · isUpcoming · hoursUntil · greetingPeriod
│   │   ├── calendar.ts         "ضيف للتقويم": ملف .ics + لينك Google Calendar
│   │   ├── seo.ts              absoluteUrl · languageAlternates · openingHours · SCHEMA_SPECIALTY
│   │   ├── env.ts               كل متغيرات الـenv
│   │   ├── fonts.ts             Inter + IBM Plex Sans Arabic (الكلام) · Montserrat + Alexandria (العناوين — DEC-29)
│   │   ├── whatsapp.ts          لينك واتساب برسالة جاهزة (+ رقم فرع)
│   │   ├── phone.ts             normalizeEgyptianMobile: أي شكل للرقم ← "+201XXXXXXXXX" · formatEgyptianMobile للعرض
│   │   ├── motion.ts            الحركات المتكررة (fadeUp · stagger)
│   │   └── utils.ts             cn() — دمج الـClasses
│   ├── mocks/
│   │   ├── handlers.ts          الداتا الوهمية لـRTK Query (بيتمسح لما الـAPI يجهز)
│   │   ├── db.ts · auth.ts · booking.ts · payments.ts · portal.ts (تاريخ تجريبي) · test-phones.ts   Mocks ليها حالة (localStorage: الجلسة والحجوزات) — DEC-38
│   │   └── public/              ردود /public/* الوهمية بنفس شكل الـAPI ({ data: [...] })
│   ├── store/
│   │   ├── base-api.ts          RTK Query: الأساس اللي كل الـEndpoints بتتضاف عليه
│   │   ├── store.ts             الـRedux store
│   │   └── store-provider.tsx   بيدّي الـStore للصفحات
│   ├── types/
│   │   ├── lead.ts              شكل الـLead اللي بيتبعت
│   │   ├── booking.ts · auth.ts · payment.ts · portal.ts · account.ts   Schemas الحجز والدخول والدفع والبوابة + طلب حذف الحساب
│   │   └── public.ts            Schemas (zod) + Types لداتا الصفحات التعريفية
│   └── proxy.ts                 بيحوّل أي زائر لـ/ar أو /en (Next 16 سمّى middleware بـproxy)
├── .env.local · .env.example    §3
├── next.config.ts               إعدادات Next (ومنها سطر next-intl — DEC-07)
├── components.json              إعدادات shadcn (RTL مفعّل)
├── eslint.config.mjs            قواعد ESLint (+ استثناء ملفات shadcn — DEC-18)
├── postcss.config.mjs           Tailwind
├── tsconfig.json                TypeScript
├── package.json                 مكتبات الموقع
├── AGENTS.md · CLAUDE.md        Next عملهم لوحده: "اقرا الـDocs اللي جوه node_modules/next قبل أي كود"
└── .gitignore
```

---

## 5. الداشبورد — `apps/dashboard`

```text
apps/dashboard/
├── public/
│   ├── favicon.png              رمز O2 (64px، من أيقونة الموقع)
│   ├── logo.png                 اللوجو الملون (264px — P-26)
│   ├── logo-symbol.png          الرمز بس (للـSider المقفول على التابلت)
│   └── logo-white.png           الأبيض (بانل الدخول)
├── src/
│   ├── app/                     تشغيل الأبلكيشن
│   │   ├── providers.tsx        RTL + لغة antd (ar_EG) + Redux + لغة التواريخ
│   │   ├── theme.ts             ثيم antd من tokens.ts بقواعد DEC-41
│   │   ├── tones.ts             ألوان الـTags الفاتحة (خلفية فاتحة + كلام غامق، اتفحصت ≥ 4.9)
│   │   ├── router.ts            الـRouter + الـcontext (الـstore) + staticData.nav
│   │   ├── i18n.ts · i18next.d.ts  اللغات (namespace لكل جزء) + أنواع المفاتيح
│   │   ├── use-locale.ts        اللغة الحالية كـLocale
│   │   └── global.css           الستايل العام القليل (flip-rtl · focus · reduced-motion)
│   ├── routes/                  الصفحات (TanStack Router): كل ملف = صفحة
│   │   ├── __root.tsx           الأساس + صفحة 404
│   │   ├── login.tsx            الدخول (D-01)
│   │   ├── _app.tsx             الـGuard + الـLayout لكل الصفحات اللي محتاجة دخول (من غير URL)
│   │   └── _app/                index.tsx (الرئيسية حسب الدور) + صفحة لكل قسم · patients.index.tsx (البحث) · patients.$patientId.tsx (ملف المريض) · front-desk.{index,pos,closing}.tsx (الطابور · التحصيل · التقفيل)
│   ├── routeTree.gen.ts         بيتولد لوحده من فولدر routes (متعدّلوش)
│   ├── features/                كل جزء في فولدر: الـapi والـtypes والـcomponents بتاعته
│   │   ├── auth/                الدخول والصلاحيات: permissions.ts · types.ts · auth.api.ts · use-me.ts · components/
│   │   ├── branches/            الفروع + use-branch-scope.ts (الفرع المختار)
│   │   ├── appointments/        المواعيد والدكاترة والأوض والوقت المقفول: types · appointments.api · status (لون كل حالة) · grid (مقاسات الكالندر) · errors · use-check-in · use-clinic-clock · components/ (time-grid · appointment-block · appointment-drawer · appointment-panel · booking-modal · cancel-modal)
│   │   ├── calendar/            الكالندر (3.2): search.ts (الحالة في الـURL) · components/ (calendar-page · block-time-modal)
│   │   ├── patients/            المرضى: types (المصادر) · patients.api (الملف · التسجيل) · overview.ts (شكل الـ360) · tabs.ts (11 تاب بصلاحياتها) · recent.ts (آخر 5 اتفتحوا) · components/ (register-patient-drawer · patients-page · patient-page · overview-tab · weight-chart)
│   │   ├── doctor-day/              يوم الدكتور (الرئيسية بتاعة الدكتور والأخصائي): doctor-day.api (مستني منك) · components/ (doctor-day-page · next-patient-card · pending-card)
│   │   ├── encounters/          الكشف: types (Template + الكشف) · encounters.api · use-start-encounter · errors · components/ (encounter-page · form-renderer = Template ← antd Form · patient-sidebar · encounters-tab)
│   │   ├── care-plans/          خطة العلاج الطبيعي: types · care-plans.api · components/plan-panel (أهداف · جلسات · تمارين من المكتبة، حفظ تلقائي)
│   │   ├── nutrition-plans/     خطة التغذية: types · nutrition-plans.api · components/nutrition-panel (هدف · وجبات وبدايل · متابعة وزن)
│   │   ├── derm-plans/          خطة الجلدية: types · derm-plans.api · components/derm-panel (إجراءات وجلساتها)
│   │   ├── photos/              صور المريض: types · photos.api · components/photos-section (معرض · رفع · مقارنة قبل/بعد)
│   │   ├── measurements/        القياسات: types (labFlag) · measurements.api · components/ (measurements-tab · medications-panel · sparkline)
│   │   ├── form-builder/        بنّاء الفورمات: types · form-builder.api · builder-state (ترتيب + تحقق) · components/ (forms-page · builder-page · field-editor)
│   │   ├── programs/            البرامج: types · enrollment-types · programs.api · enrollments.api · stage-timing · components/ (programs-manage-page · program-builder-page · programs-board-page · programs-tab)
│   │   ├── crm/                 الـCRM: types (المراحل والمصادر) · crm.api · sla · phone (إخفاء الموبايل) · components/ (crm-page · lead-card · new-lead-modal · lead-drawer · activity-timeline · lead-actions · crm-tabs · campaigns-page)
│   │   ├── tasks/               المهام والمتابعات (6.3): types (bucketOf) · tasks.api · components/ (tasks-page · task-list · task-modal · related-tasks)
│   │   ├── catalog/             الكتالوج (7.1): types · catalog.api · components/ (catalog-page · item-drawer · catalog-tabs · codes-page · code-modal · codes-types · codes.api)
│   │   ├── dashboards/          الداشبوردات (8.x): types · dashboards.api · components/ (executive-page · branch-page · journey-page · dashboard-tabs · kpi-grid)
│   │   ├── reports/             التقارير (8.4): types · reports.api · components/reports-page (التصدير: lib/export-csv)
│   │   ├── content/             المحتوى (9.1): types · content.api · components/ (content-page · content-drawer · site-images) · lib/image-resize
│   │   ├── exercises/           مكتبة التمارين: types · exercises.api · components/exercises-page
│   │   ├── billing/             التحصيل والتقفيل والفواتير (3.6 · 3.7 · 7.3): types · totals (الحساب) · billing.api · closing.api · invoices.api · components/ (pos-page · invoice-view · closing-page · invoices-page · patient-billing-tab · refunds-page · refund-modals · billing-tabs · refunds.api · refunds-types)
│   │   └── front-desk/          الاستقبال: front-desk.api (أرقام اليوم) · arriving.ts · use-visit-actions · components/ (today-board · today-stats · arriving-now · quick-actions · queue-board · queue-page · front-desk-tabs)
│   ├── components/              Components مشتركة بين الـfeatures (charts/: palette · line-chart · bar-list · donut)
│   │   ├── layout/              app-layout · app-header · nav-menu · nav-items (الأقسام وصلاحياتها) · branch-select · patient-search · user-menu
│   │   ├── states/              Loading (النقط) · Empty · Error · Forbidden · NotFound
│   │   ├── kanban/              kanban-board: لوحة أعمدة بسحب من مقبض + بديل "انقل إلى" (مشترك: البرامج 5.2 · الـCRM 6.1)
│   │   └── page-header · tags (StatusTag · SpecialtyTag) · specialty-icon · danger-button · stat-card · money · person-avatar · coming-soon
│   ├── locales/
│   │   └── ar/ · en/            ملف لكل namespace: common · nav · auth · appointments · frontDesk · calendar · patients · billing · programs · doctorDay · encounters · carePlans · nutritionPlans · dermPlans · photos · measurements · formBuilder · programs · crm · tasks · catalog · dashboards · reports · content · exercises
│   ├── lib/
│   │   ├── env.ts               كل متغيرات الـenv
│   │   ├── api-error.ts         كود الخطأ من رد الـAPI
│   │   ├── use-debounced.ts     القيمة بعد ما المستخدم يوقف كتابة (البحث)
│   │   ├── use-autosave.ts      حفظ تلقائي بعد ما المستخدم يبطّل تعديل (خطط التغذية والجلدية)
│   │   ├── image.ts             تصغير الصورة في المتصفح قبل الرفع (صور المريض)
│   │   ├── list.ts              move: نقل عنصر في قايمة (الترتيب بأزرار فوق/تحت)
│   │   ├── use-now.ts           الوقت دلوقتي بيتحدّث كل دقيقة (عدّاد الـSLA)
│   │   └── clinic-time.ts       الوقت بتوقيت مصر (النهارده · الدقيقة دلوقتي · ISO بفرق التوقيت · addDays · أول الأسبوع السبت)
│   ├── mocks/                   الداتا الوهمية (بتتمسح كلها لما الـAPI يجهز)
│   │   ├── db.ts                داتابيز وهمية في localStorage (oxygen-staff-mock-db)
│   │   ├── seed.ts              الفروع · حساب لكل دور · الأدوار وصلاحياتها
│   │   ├── auth.ts              الدخول والتحقق
│   │   ├── clinic.ts            الخدمات · الدكاترة في كل فرع · الأوض · المرضى (بحث) · توليد مواعيد كل يوم واستراحاته · حجز · تأجيل · إلغاء · مجاش · وصول · قفل وقت · أرقام اليوم
│   │   ├── handlers.ts          كل الـMocks + حالة الـAPI (عادي · فاضي · خطأ · بطيء)
│   │   └── mock-tools.tsx       أدوات التجربة: مبدّل الدور + حالة الـAPI + مسح الداتا
│   ├── store/
│   │   ├── base-api.ts          RTK Query (+ الـMocks بـimport() متأخر)
│   │   ├── ui-slice.ts          الفرع المختار
│   │   └── store.ts             الـRedux store + useAppDispatch · useAppSelector
│   ├── main.tsx                 نقطة البداية: الخطوط + antd reset + global.css + اللغات + الـRouter
│   └── vite-env.d.ts            أنواع متغيرات الـenv
├── .env.local · .env.example    §3
├── index.html                   الصفحة الوحيدة (lang="ar" dir="rtl")
├── vite.config.ts               Vite + Router plugin (autoCodeSplitting) + @ = src + Port 5173
├── eslint.config.js             قواعد ESLint (+ استثناء routes — DEC-18)
├── tsconfig.json · tsconfig.app.json · tsconfig.node.json
└── package.json
```

**الدخول في وضع الـMocks:** أي إيميل من `mocks/seed.ts` (زي `reception@oxygen.demo` أو `ceo@oxygen.demo`) · الباسورد `oxygen123` · الكود `123456` · `locked@oxygen.demo` بيجرّب "الحساب مقفول". وزرار أدوات التجربة (تحت على الجنب) بيدخلك بأي دور ([DEC-44](19-decisions.md#dec-44)).

---

## 6. المشترك — `packages/`

| Package | الملف | فيه إيه |
|---|---|---|
| `@oxygen/config` | `src/tokens.ts` | **ألوان Oxygen والخطوط والـradius**، والمصدر الوحيد ليهم ([DEC-06](19-decisions.md#dec-06)) |
| | `src/css.ts` | `tokensToCss()`: بيحوّل الألوان لـCSS variables للموقع |
| `@oxygen/shared` | `src/locales.ts` | `LOCALES` · `DEFAULT_LOCALE` (عربي) · `isLocale` · `directionOf` |
| | `src/format.ts` | `formatMoney(125000, 'EGP', 'ar')`: الفلوس جاية بالقروش |
| | `src/localized.ts` | `localized(doctor, 'name', locale)`: بيختار `name_ar` أو `name_en` |
| | `src/phone.ts` | `normalizeEgyptianMobile` (أي شكل ← `+201XXXXXXXXX` أو null) · `formatEgyptianMobile` (للعرض) — اتنقلت من الموقع ([DEC-47](19-decisions.md#dec-47)) |
| | `src/api/base-query.ts` | `createBaseQuery` (API حقيقي أو Mocks) + `MockHttpError` ([DEC-05](19-decisions.md#dec-05)) |

- الاستيراد: `import { tokens } from '@oxygen/config'` · `import { formatMoney } from '@oxygen/shared'`.
- **ممنوع** أي React component هنا. الشكل كل أبلكيشن بيعمله بمكتبته.

---

## 7. ملفات الـRoot

| الملف | بيعمل إيه |
|---|---|
| `package.json` | أوامر التشغيل (§2) + أدوات الكود (Prettier · Husky) |
| `pnpm-workspace.yaml` | بيربط `apps/` و`packages/` كمشروع واحد + **`catalog`** (نسخ المكتبات المشتركة — [DEC-15](19-decisions.md#dec-15)) + `allowBuilds` ([DEC-17](19-decisions.md#dec-17)) |
| `pnpm-lock.yaml` | بيثبّت نسخ المكتبات بالظبط. **بيتعمل لوحده، متعدّلوش** |
| `tsconfig.base.json` | إعدادات TypeScript للـ`packages/` |
| `.prettierrc` · `.prettierignore` | شكل الكود، ومستثنى منه `docs/` و`*.md` ([DEC-16](19-decisions.md#dec-16)) |
| `.husky/pre-commit` | بيشغّل Prettier قبل أي Commit |
| `.gitignore` | الحاجات اللي مش بتدخل Git (`node_modules` · `.next` · `.env.local`) |
| `.gitattributes` | كل الملفات النصية بـLF على أي جهاز (عشان الملفات متبانش متغيرة على الويندوز — [P-12](18-dev-log.md#p-12)) |
| `CLAUDE.md` | قواعد المشروع لـClaude (فرونت بس · Separate · التسجيل) |
| `README.md` | تعريف المشروع وفهرس الـdocs |

---

<a id="where"></a>

## 8. عايز أضيف حاجة؟ تتحط فين

القاعدة ([DEC-10](19-decisions.md#dec-10)): أي حاجة بتتحط في **أقرب فولدر مشترك** بين اللي بيستخدموها.

| عايز أضيف | فين | ملاحظات |
|---|---|---|
| **صفحة في الموقع** | `apps/web/src/app/[locale]/(marketing)/<اسم>/page.tsx` | Server Component. النصوص في `messages/` |
| **Component لصفحة واحدة** | `…/<الصفحة>/_components/` | الشرطة (`_`) معناها إن الفولدر ده مش صفحة |
| **Component لأكتر من صفحة** | `apps/web/src/components/shared/` | — |
| **Component من shadcn** | `pnpm dlx shadcn@latest add <name>` (من `apps/web`) | بيتحط في `components/ui/` لوحده |
| **داتا لصفحة تعريفية** | `apps/web/src/api/public/<name>.ts` | Function على السيرفر، ودلوقتي بترجّع من `mocks/` ([DEC-11](19-decisions.md#dec-11)) |
| **Endpoint تفاعلي (فورم، حجز، بورتال)** | `_api/<name>.api.ts` جنب الصفحة، أو `src/api/` لو مشترك | `baseApi.injectEndpoints(...)` + **Mock بنفس الاسم** في `mocks/handlers.ts` |
| **Mock يرجّع Error** | جوه الـhandler: `throw new MockHttpError(422, 'CODE')` | — |
| **نص جديد** | `messages/ar.json` و`en.json` (الاتنين مع بعض) | ممنوع نص جوه Component |
| **لون جديد** | `packages/config/src/tokens.ts` + سطر في `globals.css` (`--color-x: var(--oxy-x)`) | بيظهر في الموقع والداشبورد مع بعض |
| **صورة** | `apps/web/public/images/<الصفحة>/` | بـ`next/image`، ولها `alt` من الترجمة |
| **متغير env** | §3 | — |
| **مكتبة لأبلكيشن واحد** | `pnpm --filter web add <name>` (أو `dashboard`) | — |
| **مكتبة للاتنين** | نسختها في `catalog` (`pnpm-workspace.yaml`)، وفي كل `package.json` تتكتب `"catalog:"` | — |
| **حاجة مشتركة بين الموقع والداشبورد** | `packages/shared/src/` + export في `index.ts` | منطق بس، من غير شكل |
| **صفحة في الداشبورد** | `apps/dashboard/src/routes/_app/<اسم>.tsx` (ورا الدخول) | الـplugin بيضيفها لـ`routeTree.gen.ts` لوحده · `staticData: { nav: '<القسم>' }` عشان القايمة والصلاحية |
| **جزء جديد في الداشبورد** | `apps/dashboard/src/features/<اسم>/` (`<اسم>.api.ts` · `types.ts` · `components/`) | الـEndpoints بـ`baseApi.injectEndpoints` + Mock بنفس الاسم في `mocks/` |
| **نص في الداشبورد** | `apps/dashboard/src/locales/ar/<namespace>.json` و`en/` (الاتنين) | namespace جديد = سطر في `app/i18n.ts` · المفاتيح بتتفحص في tsc |
| **قسم في قايمة الداشبورد** | `components/layout/nav-items.ts` (+ صلاحياته) | — |

---

## 9. قواعد الكود (في كل خطوة)

**مكان واحد لكل حاجة:**

| الحاجة | مكانها |
|---|---|
| النصوص | `messages/` في الموقع · `locales/` في الداشبورد |
| الألوان | `packages/config` |
| المنطق المشترك (الفلوس، اللغات) | `packages/shared` |
| الـenv | `lib/env.ts` |
| الـAPI | `_api/` أو `src/api/` |

**الموقع:**
- **Server Component افتراضيًا**، و`'use client'` على الحاجة التفاعلية بس.
- **الـRTL:**
  - `ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start` `text-end` بس.
  - **ممنوع** `ml-` `mr-` `pl-` `pr-` `left-` `right-`.
  - الأيقونات اللي ليها اتجاه: `rtl:rotate-180`.
- **الألوان:**
  - `bg-primary` · `bg-gold` · `text-ink` · `bg-mist` · `bg-physio/10` · `from-brand-from to-brand-to` …
  - **ممنوع hex** جوه أي Component أو في `globals.css`.
- **Motion** ([DEC-13](19-decisions.md#dec-13)):
  - `<Reveal>` للظهور مع الـScroll.
  - `transform` و`opacity` بس.
  - صورة الـHero والعنوان الرئيسي من غير Fade.
- **الروابط:** `Link` من `@/i18n/navigation` (مش من `next/link`) عشان اللغة تفضل في الـURL.

**الكود عمومًا:**
- **Component صغير بمسؤولية واحدة.** لو عدّى ~200 سطر قسّمه، والمنطق في Hooks أو Functions بره الـJSX.
- **قاعدة التلاتة:** لو نسخت حاجة للمرة التالتة، طلّعها في مكان مشترك.
- **التسمية:**
  - الملفات `kebab-case`.
  - الـComponents `PascalCase`.
  - الـHooks `useX`.
  - الـBoolean `isX` / `hasX`.
  - الـEvents `onX` / `handleX`.
- **TypeScript strict:** ممنوع `any`.
- **مفيش أرقام سحرية:** `NO_SHOW_GRACE_MINUTES = 15` بدل `15` متبعترة في الكود.
- **الكومنت** بيشرح "ليه" مش "إيه".

> **الصفحة تعتبر خلصت إمتى؟** الـChecklist في آخر [16-website-plan.md](16-website-plan.md).
