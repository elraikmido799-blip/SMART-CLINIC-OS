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
│   ├── brand/               ← ملفات الهوية: اللوجو بأشكاله، أيقونة التطبيق، صورة الطبيب الافتراضية
│   ├── mocks/               ← صور للتطوير بس (زي الشخصية L6)، مش بتتحط في الموقع الحقيقي
│   ├── website/             ← صور شاشات الموقع المقبولة (A0 v1 اتستبدلت، v2 ⏳ — DEC-22)
│   └── dashboard/ ⏳        ← صور شاشات الداشبورد
├── docs/                    ← التوثيق (الملفات دي)
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
│   └── images/                  صور الموقع، مقسّمة بالصفحات
├── src/
│   ├── app/                     الصفحات (Next.js App Router)
│   │   ├── globals.css          بيربط ألوان packages/config بأسامي Tailwind و shadcn (ممنوع hex هنا)
│   │   ├── favicon.ico          ⏳ يتغيّر بلوجو Oxygen
│   │   └── [locale]/            كل الصفحات تحت اللغة: /ar/… و /en/…
│   │       ├── layout.tsx       الـRoot layout: اللغة + الاتجاه + الخطوط + الألوان + Providers + Metadata
│   │       ├── (marketing)/     الموقع التعريفي (القوسين = مش بيظهروا في الـURL)
│   │       │   ├── page.tsx     الصفحة الرئيسية (مؤقتة دلوقتي — المرحلة 3)
│   │       │   └── …            ⏳ about · specialties · doctors · branches · … (المرحلة 4)
│   │       ├── book/ ⏳ · checkout/ ⏳ · login/ ⏳ · portal/ ⏳     (المرحلة 5 و 6)
│   ├── api/                     الكلام مع الـAPI اللي بتستخدمه أكتر من صفحة
│   │   ├── leads.api.ts         RTK Query: إرسال أي فورم (Contact · العروض …)
│   │   └── public/ ⏳           Functions على السيرفر للصفحات التعريفية (الأطباء، الفروع…)
│   ├── components/
│   │   ├── ui/                  Components بتاعة shadcn (بنسيبها زي ما الـCLI عملها)
│   │   ├── shared/              Components بتستخدمها أكتر من صفحة
│   │   │   └── reveal.tsx       الظهور مع الـScroll (Motion)
│   │   ├── layout/ ⏳           Navbar · Footer · MobileMenu · LanguageSwitcher · WhatsAppButton
│   │   └── providers.tsx        الـProviders: الاتجاه · Motion · Redux · Tooltip · Toaster
│   ├── i18n/                    اللغات (next-intl)
│   │   ├── routing.ts           اللغات المتاحة (من packages/shared)
│   │   ├── request.ts           بيحدد اللغة ويحمّل ملف الترجمة
│   │   └── navigation.ts        Link · useRouter · usePathname (استخدمهم بدل بتوع Next)
│   ├── lib/
│   │   ├── env.ts               كل متغيرات الـenv
│   │   ├── fonts.ts             Inter + IBM Plex Sans Arabic
│   │   ├── motion.ts            الحركات المتكررة (fadeUp · stagger)
│   │   └── utils.ts             cn() — دمج الـClasses
│   ├── mocks/
│   │   └── handlers.ts          الداتا الوهمية لكل Endpoint (بيتمسح لما الـAPI يجهز)
│   ├── store/
│   │   ├── base-api.ts          RTK Query: الأساس اللي كل الـEndpoints بتتضاف عليه
│   │   ├── store.ts             الـRedux store
│   │   └── store-provider.tsx   بيدّي الـStore للصفحات
│   ├── types/
│   │   └── lead.ts              شكل الـLead اللي بيتبعت
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
│   └── favicon.svg              ⏳ يتغيّر بلوجو Oxygen
├── src/
│   ├── app/                     تشغيل الأبلكيشن
│   │   ├── providers.tsx        RTL + لغة antd (ar_EG) + Redux + لغة التواريخ
│   │   ├── theme.ts             ألوان Oxygen في antd (من packages/config)
│   │   └── i18n.ts              اللغات (i18next)
│   ├── routes/                  الصفحات (TanStack Router): كل ملف = صفحة
│   │   ├── __root.tsx           الـLayout العام (⏳ Sidebar + Top bar)
│   │   └── index.tsx            الصفحة الرئيسية (مؤقتة)
│   ├── routeTree.gen.ts         بيتولد لوحده من فولدر routes (متعدّلوش)
│   ├── features/ ⏳             كل جزء في فولدر (calendar · patients · crm …) — خطة الداشبورد
│   ├── components/ ⏳           Components مشتركة بين الـfeatures
│   ├── locales/
│   │   └── ar.json · en.json    النصوص
│   ├── lib/
│   │   └── env.ts               كل متغيرات الـenv
│   ├── mocks/
│   │   └── handlers.ts          الداتا الوهمية
│   ├── store/
│   │   ├── base-api.ts          RTK Query
│   │   └── store.ts             الـRedux store
│   ├── main.tsx                 نقطة البداية: الخطوط + antd reset + اللغات + الـRouter
│   └── vite-env.d.ts            أنواع متغيرات الـenv
├── .env.local · .env.example    §3
├── index.html                   الصفحة الوحيدة (lang="ar" dir="rtl")
├── vite.config.ts               Vite + Router plugin + @ = src + Port 5173
├── eslint.config.js             قواعد ESLint (+ استثناء routes — DEC-18)
├── tsconfig.json · tsconfig.app.json · tsconfig.node.json
└── package.json
```

---

## 6. المشترك — `packages/`

| Package | الملف | فيه إيه |
|---|---|---|
| `@oxygen/config` | `src/tokens.ts` | **ألوان Oxygen والخطوط والـradius**، والمصدر الوحيد ليهم ([DEC-06](19-decisions.md#dec-06)) |
| | `src/css.ts` | `tokensToCss()`: بيحوّل الألوان لـCSS variables للموقع |
| `@oxygen/shared` | `src/locales.ts` | `LOCALES` · `DEFAULT_LOCALE` (عربي) · `isLocale` · `directionOf` |
| | `src/format.ts` | `formatMoney(125000, 'EGP', 'ar')`: الفلوس جاية بالقروش |
| | `src/localized.ts` | `localized(doctor, 'name', locale)`: بيختار `name_ar` أو `name_en` |
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
| **صفحة في الداشبورد** | `apps/dashboard/src/routes/<اسم>.tsx` | الـplugin بيضيفها لـ`routeTree.gen.ts` لوحده |

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
  - `bg-primary` · `bg-coral` · `text-ink` · `bg-mint` · `bg-physio/10` …
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
