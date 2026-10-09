# 18 — سجل التنفيذ (اتعمل إيه، بالترتيب)

> كل خطوة بتتعمل في الكود بتتسجل هنا **بنفس الشكل**. الأقدم فوق والأحدث تحت.
> كل خطوة مكتوب جنبها: رقمها في الخطة ([16](16-website-plan.md))، والمشاكل اللي قابلتنا (`P-xx`) تحت في نفس الملف، والقرارات (`DEC-xx`) في [19](19-decisions.md).
> شكل الملفات والفولدرات النهائي في [17](17-project-structure.md).

**شكل كل خطوة:** اتعمل إيه · الملفات · المشاكل · القرارات · اتأكدنا إزاي.

---

## الفهرس

| ID | الخطوة | الخطة | التاريخ | الحالة |
|---|---|---|---|---|
| [L-01](#l-01) | الأدوات على الجهاز | 1.1 | 2026-10-05 | ✅ |
| [L-02](#l-02) | Git + الـWorkspace | 1.2 | 2026-10-05 | ✅ |
| [L-03](#l-03) | مشروع Next.js (`apps/web`) | 1.3 | 2026-10-05 | ✅ |
| [L-04](#l-04) | تحديث الـdocs على نظام Separate | — | 2026-10-05 | ✅ |
| [L-05](#l-05) | shadcn/ui | 1.4 | 2026-10-05 | ✅ |
| [L-06](#l-06) | مكتبات الموقع + Motion | 1.5 | 2026-10-05 | ✅ |
| [L-07](#l-07) | `packages/config` + `packages/shared` | 1.8 · 1.11 · 1.12 | 2026-10-05 | ✅ |
| [L-08](#l-08) | أساس الموقع (ألوان، خطوط، لغات، Layout، Store، env) | 1.7 → 1.13 | 2026-10-05 | ✅ |
| [L-09](#l-09) | أساس الداشبورد (`apps/dashboard`) | 1.14 | 2026-10-05 | ✅ |
| [L-10](#l-10) | Prettier + Husky + Lint | 1.6 | 2026-10-05 | ✅ |
| [L-11](#l-11) | مراجعة الأساس + التظبيطات الخمسة | — | 2026-10-05 | ✅ |
| [L-12](#l-12) | برومبتات التصميم v2 (الموقع + الداشبورد) | 0.1 | 2026-10-05 | ✅ |
| [L-13](#l-13) | مراجعة A0 + ملفات الهوية + نظام "قائمة الصور" | 0.1 | 2026-10-05 | ✅ |
| [L-14](#l-14) | برومبتات استخراج الصور من A0 (L1 → L6) | 0.1 | 2026-10-05 | ✅ |
| [L-15](#l-15) | A0 v1 اتستبدلت ← برومبت A0 v2 (فكرة «النَّفَس») | 0.1 | 2026-10-05 | ✅ |
| [L-16](#l-16) | Oxygen عندهم لوجو أخضر ← A0 v2 اتوقفت لحد ما ملفاته توصل | 0.1 · 0.2 | 2026-10-05 | ✅ |
| [L-17](#l-17) | صور البراند الحقيقية ← برومبت A0 v2 على لوجو Oxygen | 0.1 · 0.2 | 2026-10-05 | ✅ |
| [L-18](#l-18) | برومبتات اللوجو L1 → L4 على لوجو Oxygen، بوصف كامل من غير ما ترفق صورة | 0.1 | 2026-10-05 | ✅ |
| [L-19](#l-19) | A0 v2 بصورتين بس + برومبتات استخراجهم E1 · E2 | 0.1 | 2026-10-09 | ✅ |
| [L-20](#l-20) | A0 v2 اتقبلت: الألوان في الكود، واللوجو شفاف بنسخه، وبرومبتات A1 → A7 على الهوية الجديدة | 0.1 · 0.2 | 2026-10-09 | ✅ |
| [L-21](#l-21) | صور A0 المفرّغة وصلت (الـHero · الدكتورة · حلقة النقط · موجة النقط) + الصور بتتغير من الداشبورد | 0.1 | 2026-10-09 | ✅ |
| [L-22](#l-22) | الموقع بقى إنجليزي أساسي (العربي على /ar) | 1 | 2026-10-09 | ✅ |
| [L-23](#l-23) | برومبتات A1 → A7 بقت تشتغل لوحدها في شات جديد (الهوية كاملة في أول كل برومبت) | 0.1 | 2026-10-09 | ✅ |
| [L-24](#l-24) | A1 (الرئيسية — النص الأول) اتقبلت، وA2 بقت تكمّل عليها | 0.1 | 2026-10-09 | ✅ |
| [L-25](#l-25) | موجة النقط (الفاصل بين الأقسام) اتحفظت | 0.1 | 2026-10-09 | ✅ |
| [L-26](#l-26) | A2 (الرئيسية — النص التاني) اتقبلت، وA3 بقت تاخد الصفحة من A1 وA2 | 0.1 | 2026-10-09 | ✅ |
| [L-27](#l-27) | A3 (الرئيسية على الموبايل) اتقبلت، وA4 بقت تاخد الـNavbar وصورة العلاج الطبيعي المرفوعين | 0.1 | 2026-10-09 | ✅ |
| [L-28](#l-28) | الأشكال بتيجي صور: برومبتات أيقونات التخصصات (I1) والخريطة (M1) | 0.1 | 2026-10-09 | ✅ |
| [L-29](#l-29) | أيقونات التخصصات الأربعة وصلت واتقطعت 4 ملفات شفافة | 0.1 | 2026-10-09 | ✅ |
| [L-30](#l-30) | خريطة الفروع وصلت | 0.1 | 2026-10-09 | ✅ |
| [L-31](#l-31) | برومبتات الصور الناقصة: P1 (موبايل التطبيق) · D1 (3 أطباء للتطوير) · L5 (الصورة الافتراضية) | 0.1 | 2026-10-09 | ✅ |
| [L-32](#l-32) | موبايل شريط التطبيق (P1) وصل | 0.1 | 2026-10-09 | ✅ |
| [L-33](#l-33) | المرحلة 3: الـLayout + الصفحة الرئيسية بالكود، والداتا جاهزة للـAPI | 3.1 · 3.2 | 2026-10-09 | ✅ |
| [L-34](#l-34) | الصفحة على شاشة 320px: الـNavbar ومربعات التخصصات كانوا أعرض من الشاشة | 3 | 2026-10-09 | ✅ |
| [L-35](#l-35) | الـResponsive تحت 992px في النص + قايمة الاختيار + حركة أكتر + الـScrollbar | 3 | 2026-10-09 | ✅ |
| [L-36](#l-36) | `.gitignore` كامل + ربط الـRepo على GitHub | — | 2026-10-09 | 🔄 الـPush مستني صلاحية |

---

## الخطوات

<a id="l-01"></a>

### L-01 · الأدوات على الجهاز

- **اتعمل:**
  - اتأكدنا إن Node 24.12 وnpm 11.6 وGit 2.53 موجودين.
  - سطّبنا **pnpm 12.9.1** (`npm install -g pnpm`).
  - سطّبنا Extensions الـVS Code: ESLint · Prettier · Pretty TypeScript Errors · Markdown Mermaid. (Tailwind CSS IntelliSense كانت متسطبة قبل كده.)
- **الملفات:** —
- **اتأكدنا إزاي:** `pnpm -v` ← `12.9.1`.

<a id="l-02"></a>

### L-02 · Git + الـWorkspace

- **اتعمل:**
  - `git init -b main` في `D:\job\SMART CLINIC OS`، والـCommits بتتسجل باسمك.
  - ملفات الـRoot: `package.json` · `pnpm-workspace.yaml` (`apps/*` + `packages/*`) · `.gitignore`.
  - الـRepo على جهازك بس. الرفع على GitHub عليك في الوقت اللي يناسبك.
- **الملفات:** `package.json` · `pnpm-workspace.yaml` · `.gitignore`
- **القرارات:** [DEC-02](19-decisions.md#dec-02)

<a id="l-03"></a>

### L-03 · مشروع Next.js (`apps/web`)

- **اتعمل:**
  ```powershell
  mkdir apps
  pnpm create next-app@latest apps/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --yes
  ```
  النتيجة: Next.js 16.3.8 · React 19.2 · Tailwind 4.3 · Turbopack.
- **الملفات:** `apps/web/` كله (Next عمل كمان `AGENTS.md` و`CLAUDE.md`، وبيقولوا اقرا الـDocs اللي جوه `node_modules/next/dist/docs/` قبل أي كود).
- **المشاكل:** [P-01](#p-01) · [P-02](#p-02) · [P-03](#p-03)
- **اتأكدنا إزاي:** `pnpm dev` ← الموقع فتح على `http://localhost:3001` (HTTP 200).

<a id="l-04"></a>

### L-04 · تحديث الـdocs على نظام Separate

- **اتعمل:**
  - `CLAUDE.md`: القاعدة 1 (إنت فرونت بس) + القاعدة 2 (نظام Separate، والاتنين في Repo واحد).
  - `README` · `01` · `02` · `05` · `08 §10` · `11` · `14` · `15` · `16`:
    - نظام Separate.
    - RTK Query بدل TanStack Query.
    - Mocks بدل Orval/MSW.
    - ترتيب شغل الفرونت الجديد (الموقع التعريفي الأول).
- **القرارات:** [DEC-01](19-decisions.md#dec-01) · [DEC-02](19-decisions.md#dec-02) · [DEC-04](19-decisions.md#dec-04)

<a id="l-05"></a>

### L-05 · shadcn/ui

- **اتعمل:**
  ```powershell
  cd apps/web
  pnpm dlx shadcn@latest init --template next --base radix --preset nova --rtl --no-monorepo --yes
  pnpm dlx shadcn@latest add direction card badge input label textarea select separator sheet dialog accordion tabs avatar skeleton sonner navigation-menu dropdown-menu carousel tooltip --yes
  ```
- **الملفات:** `apps/web/components.json` (فيه `"rtl": true`) · `src/components/ui/*` (20 Component) · `src/lib/utils.ts` (`cn`).
- **القرارات:** [DEC-09](19-decisions.md#dec-09)

<a id="l-06"></a>

### L-06 · مكتبات الموقع + Motion

- **اتعمل:**
  ```powershell
  pnpm add @reduxjs/toolkit react-redux next-intl react-hook-form zod @hookform/resolvers dayjs libphonenumber-js motion
  ```
  النسخ: RTK 2.13 · react-redux 9.3 · next-intl 4.14 · Motion 14.0 · react-hook-form 7.89 · Zod 4.6 · dayjs 1.11.
- **المشاكل:** [P-04](#p-04)
- **القرارات:** [DEC-13](19-decisions.md#dec-13) · [DEC-17](19-decisions.md#dec-17)

<a id="l-07"></a>

### L-07 · `packages/config` + `packages/shared`

- **اتعمل:**
  - `tsconfig.base.json` في الـRoot: إعدادات TypeScript للـpackages.
  - **`@oxygen/config`:**
    - `src/tokens.ts`: ألوان Oxygen والخطوط والـradius.
    - `src/css.ts`: `tokensToCss()`.
  - **`@oxygen/shared`:**
    - `locales.ts`: اللغات و`directionOf`.
    - `format.ts`: `formatMoney`.
    - `localized.ts`.
    - `api/base-query.ts`: `createBaseQuery` + `MockHttpError`.
  - ربطناهم بالموقع: `"@oxygen/config": "workspace:*"`.
- **القرارات:** [DEC-05](19-decisions.md#dec-05) · [DEC-06](19-decisions.md#dec-06) · [DEC-12](19-decisions.md#dec-12)
- **اتأكدنا إزاي:** `tsc` على كل Package لوحده ← من غير Errors.

<a id="l-08"></a>

### L-08 · أساس الموقع

- **اتعمل:**
  - **مسحنا** ملفات Next الافتراضية: `src/app/layout.tsx` · `src/app/page.tsx` · صور `public/`.
  - **الألوان والخطوط:** `src/app/globals.css` بيربط `--oxy-*` بأسامي Tailwind وshadcn · `src/lib/fonts.ts`.
  - **اللغات:**
    - `src/i18n/routing.ts` · `request.ts` · `navigation.ts`.
    - `src/proxy.ts`.
    - `messages/ar.json` · `en.json`.
    - `next.config.ts` (alias بدل الـplugin).
  - **الـLayout:** `src/app/[locale]/layout.tsx` (اللغة + الاتجاه + الخطوط + الـTokens + الـMetadata) · `src/components/providers.tsx`.
  - **الداتا:**
    - `src/store/` (`base-api` · `store` · `store-provider`).
    - `src/mocks/handlers.ts`.
    - `src/api/leads.api.ts` · `src/types/lead.ts`.
  - **الأنيميشن:** `src/lib/motion.ts` · `src/components/shared/reveal.tsx`.
  - **الـenv:** `src/lib/env.ts` · `.env.local` · `.env.example` (وضفنا `!.env.example` في `apps/web/.gitignore` عشان يدخل Git).
  - **صفحة رئيسية مؤقتة:** `src/app/[locale]/(marketing)/page.tsx`، بس عشان نتأكد إن الأساس شغال.
- **المشاكل:** [P-05](#p-05) · [P-06](#p-06) · [P-07](#p-07)
- **القرارات:** [DEC-07](19-decisions.md#dec-07) · [DEC-08](19-decisions.md#dec-08) · [DEC-10](19-decisions.md#dec-10) · [DEC-11](19-decisions.md#dec-11)
- **اتأكدنا إزاي:**
  - `pnpm --filter web build` ← `/ar` و`/en` اتبنوا Static.
  - `pnpm dev`:
    - `/` بيحوّل لـ`/ar` (307).
    - `/ar` فيه `dir="rtl"` والـTokens والعنوان بالعربي.
    - `/en` فيه `dir="ltr"`.

<a id="l-09"></a>

### L-09 · أساس الداشبورد (`apps/dashboard`)

- **اتعمل:**
  ```powershell
  pnpm create vite@latest apps/dashboard --template react-ts --eslint --no-immediate --no-interactive
  cd apps/dashboard
  pnpm add antd @ant-design/icons dayjs @reduxjs/toolkit react-redux i18next react-i18next @tanstack/react-router @fontsource/ibm-plex-sans-arabic @fontsource-variable/inter "@oxygen/config@workspace:*" "@oxygen/shared@workspace:*"
  pnpm add -D @tanstack/router-plugin
  ```
  النسخ: Vite 8 · antd 6.6 · TanStack Router 1.170 · i18next 26.
  - **مسحنا** ملفات Vite الافتراضية: `App.tsx` · `App.css` · `index.css` · `assets/` · `public/icons.svg`.
  - **الإعدادات:**
    - `vite.config.ts`: Router plugin + `@` = `src` + Port 5173.
    - `tsconfig.app.json`: `paths` + JSON.
    - `index.html`: `lang="ar" dir="rtl"`.
    - `eslint.config.js`: تجاهل `routeTree.gen.ts`.
  - **الـenv:** `.env.local` · `.env.example` · `src/vite-env.d.ts` · `src/lib/env.ts`.
  - **الأساس:**
    - `src/app/theme.ts`: antd theme من الـTokens.
    - `src/app/i18n.ts`.
    - `src/app/providers.tsx`: RTL + `ar_EG` + Redux + dayjs.
  - **الداتا:** `src/store/` · `src/mocks/handlers.ts`.
  - **الترجمة:** `src/locales/ar.json` · `en.json`.
  - **الصفحات:** `src/routes/__root.tsx` · `index.tsx` (صفحة مؤقتة) · `src/main.tsx`.
- **القرارات:** [DEC-03](19-decisions.md#dec-03) · [DEC-14](19-decisions.md#dec-14)
- **اتأكدنا إزاي:**
  - `pnpm --filter dashboard dev` ← `http://localhost:5173` (HTTP 200)، و`routeTree.gen.ts` اتولد.
  - `pnpm --filter dashboard build` ← نجح.
  - **ملاحظة:** فيه تحذير "chunk أكبر من 500kB" وده طبيعي في الأول مع antd. بيصغر مع الـCode splitting لما الشاشات تزيد.

<a id="l-10"></a>

### L-10 · Prettier + Husky + Lint

- **اتعمل:**
  - في الـRoot: `prettier` · `prettier-plugin-tailwindcss` · `husky` · `lint-staged`.
  - **الإعدادات:** `.prettierrc` · `.prettierignore` · `.husky/pre-commit` (← `pnpm exec lint-staged`).
  - **أوامر الـRoot:** `dev` · `dev:web` · `dev:dashboard` · `build` · `lint` · `format`.
  - `pnpm format`: ظبط شكل الكود كله مرة واحدة.
- **المشاكل:** [P-08](#p-08) · [P-09](#p-09) · [P-10](#p-10)
- **القرارات:** [DEC-16](19-decisions.md#dec-16) · [DEC-18](19-decisions.md#dec-18)
- **اتأكدنا إزاي:** `pnpm lint` ← `Done` للاتنين.

<a id="l-11"></a>

### L-11 · مراجعة الأساس + التظبيطات الخمسة

- **المراجعة:**

  | الحاجة | النتيجة |
  |---|---|
  | الـStructure | سليم |
  | `package.json` و`pnpm-workspace.yaml` | سليمين |
  | `.env.local` | مش داخل Git |
  | `packages/` | بيعدّي TypeScript لوحده |
  | Build + Lint | بيعدّوا |

- **التظبيطات:**
  1. **توحيد النسخ بـ`catalog`:** الاتنين بقوا على TypeScript **6.0.3** وTypes الـNode **24** وReact **19.2.8**. الـESLint اتساب حسب كل Framework ([P-11](#p-11)).
  2. **مسحنا** ملفات `README.md` الافتراضية من `apps/web` و`apps/dashboard`.
  3. **نظام التسجيل:** [17](17-project-structure.md) · [18](18-dev-log.md) · [19](19-decisions.md) + قواعد التسجيل في `CLAUDE.md`.
  4. **الـdocs:**
     - `mockBaseQuery` اتغيّر لـ`createBaseQuery` في 02 و15.
     - ملف 16 اتنضف: الخطة بس، والتفاصيل هنا.
  5. **أول Commit** (نقطة رجوع للأساس)، وقبله `.gitattributes` ([P-12](#p-12)).
- **المشاكل:** [P-11](#p-11) · [P-12](#p-12)
- **القرارات:** [DEC-15](19-decisions.md#dec-15)
- **اتأكدنا إزاي:**
  - `pnpm peers check` ← `No peer dependency issues found`.
  - `pnpm lint` و`pnpm build` ← الاتنين نجحوا.

<a id="l-12"></a>

### L-12 · برومبتات التصميم v2 (الموقع + الداشبورد)

- **اتعمل:**
  - ملف [14](14-design-prompts.md) اتعمل من جديد على جلسات:
    - **A — الموقع** (A0 → A8): الهوية · الرئيسية (نصين + موبايل) · صفحة تخصص · الأطباء · الحجز · بوابة المريض · نسخة عربي.
    - **B — الداشبورد** (B0 → B6): الستايل + الدخول · الريسبشن · Patient 360 · الكشف · الـCRM · الـCEO · نسخة عربي.
  - الألوان في البرومبتات بقت نفس `tokens.ts` بالظبط (الحدود، والنص الثانوي، والخلفية كمان).
  - شرط **"تصميم أصلي، من غير تقليد"** في أول كل جلسة.
  - أسامي الصور بقت بأرقام الشاشات (`W-01-home-top.png` …) في `design/`.
  - برومبتات التطبيق والإضافي (الأسعار، الـFunnel، Dark mode) اتسابوا في نفس الملف تحت "بعدين".
- **الملفات:** `docs/14-design-prompts.md` · `docs/16-website-plan.md` (0.1) · `docs/17-project-structure.md` (`design/`)
- **القرارات:** [DEC-19](19-decisions.md#dec-19)
- **الجاي:** إنت بتطلّع الصور وتحطها في `design/`، وبعدها المرحلة 3 بتتبني عليها.

<a id="l-13"></a>

### L-13 · مراجعة A0 + ملفات الهوية + نظام "قائمة الصور"

- **اتعمل:**
  - **طريقة الشغل:** جلسة A (الموقع) الأول، وكل برومبت = صورة واحدة، وكل صورة بتتراجع قبل اللي بعدها.
  - **صورة A0 (Design System) اتقبلت** واتحفظت في `design/website/A0-design-system.png`. ملاحظات المراجعة في [سجل المراجعة](14-design-prompts.md#review).
  - **إنت المصمم:** الهوية من A0 نهائية ([DEC-20](19-decisions.md#dec-20)).
  - **أي صورة جوه التصميم بتطلع ملف لوحدها** ([DEC-21](19-decisions.md#dec-21)):
    - برومبتات **L1 → L5** اتضافت في [14](14-design-prompts.md): اللوجو الكامل، الأبيض، الرمز، أيقونة التطبيق، الصورة الافتراضية للطبيب.
    - **سجل الصور** اتعمل في 14، وفيه كل عنصر هييجي منين وحالته.
  - فولدر `design/brand/` اتعمل لملفات الهوية.
- **الملفات:** `design/website/A0-design-system.png` · `docs/14-design-prompts.md` · `docs/16-website-plan.md` (0.2) · `docs/17-project-structure.md`
- **القرارات:** [DEC-20](19-decisions.md#dec-20) · [DEC-21](19-decisions.md#dec-21)
- **الجاي:** L1 → L5 من ChatGPT (كل واحدة بتتراجع) ← A1.

<a id="l-14"></a>

### L-14 · برومبتات استخراج الصور من A0 (L1 → L6)

- **اتعمل:**
  - **كبّرنا اللوجو وأيقونة التطبيق من A0** عشان البرومبتات توصف الشكل بالظبط. طلع إن:
    - اللوجو فيه **4 فقاعات** مش 3، والخط اللي في نص حرف الـ**E** لونه تيل.
    - أيقونة التطبيق فيها **3 دواير** بيضا.
  - **برومبتات L1 → L4 اتصلّحت** على التفاصيل دي في [14](14-design-prompts.md).
  - **L6 اتضافت:** الشخصية (صورة الدكتورة اللي في كارت الطبيب) للتطوير والـMocks بس، في `design/mocks/` ([DEC-21](19-decisions.md#dec-21) اتحدّث).
  - فولدرك `structure and image/` اتساب زي ما هو: إنت هتضيفه للـ`.gitignore` بنفسك قبل الرفع.
- **الملفات:** `docs/14-design-prompts.md` · `docs/19-decisions.md` · `docs/17-project-structure.md`
- **القرارات:** [DEC-21](19-decisions.md#dec-21) (تحديث)
- **اتأكدنا إزاي:** قصّينا اللوجو (تكبير 4×) وأيقونة التطبيق (تكبير 6×) من A0 وبصّينا عليهم.
- **الجاي:** صور L1 → L6 من ChatGPT، وكل واحدة بتتراجع وتتحفظ ← A1.

<a id="l-15"></a>

### L-15 · A0 v1 اتستبدلت ← برومبت A0 v2 (فكرة «النَّفَس»)

- **اتعمل:**
  - **إنت حسيت إن A0 v1 شكلها متشاف قبل كده**، وطلبت حاجة أقوى بخبرة 10 سنين ومن غير ما نكسر قواعد الـUX.
  - **راجعناها:** طلعت UI Kit جاهز (السبب في [سجل المراجعة](14-design-prompts.md#review))، وفيها غلطتين contrast.
  - **برومبت A0 v2 اتكتب** في [14](14-design-prompts.md): فكرة «النَّفَس»، وألوان مخصوص كلها بتعدي AA، وخط Editorial للعناوين، وقواعد الـUX جوه البرومبت.
  - **L1 → L6 اتوقفت** لحد ما v2 تتقبل، لأن اللوجو هيتغير.
  - **الهوية القديمة لسه في `tokens.ts` وفي البرومبتات اللي بعد A0**، ومتعلّم عليها في 14 إنها هتتعدل.
- **الملفات:** `docs/14-design-prompts.md` · `docs/19-decisions.md` · `docs/16-website-plan.md` (0.2) · `docs/17-project-structure.md`
- **القرارات:** [DEC-22](19-decisions.md#dec-22) (جديد) · [DEC-20](19-decisions.md#dec-20) (تحديث)
- **اتأكدنا إزاي:** حسبنا الـcontrast بسكريبت بمعادلة WCAG: v1 (الأبيض على الكورال 2.57 · على التيل 4.14) و v2 (التيل 5.21 · Ember 4.67 · التخصصات من 5.06 لـ6.46 · النص الثانوي على Linen 5.27).
- **الجاي:** صورة A0 v2 من شات جديد ← نراجعها ← لو اتقبلت: `tokens.ts` + جدول الهوية + كل البرومبتات اللي بعد A0 تتعدل ← L1 → L6.

<a id="l-16"></a>

### L-16 · Oxygen عندهم لوجو أخضر ← A0 v2 اتوقفت لحد ما ملفاته توصل

- **اتعمل:**
  - **عرفنا إن Oxygen عندهم لوجو أخضر أصلًا**، والألوان اللي في برومبت A0 v2 مش ألوانه.
  - **برومبت A0 v2 اتوقف** (متعلّم عليه في [14](14-design-prompts.md)) لحد ما ملفات اللوجو توصل، وبعدها الألوان هتتبني عليه.
  - **فولدر `design/brand/original/` اتعمل** لملفات اللوجو الأصلية (SVG أو AI أو PDF). الصور بتتبعت في الشات.
- **الملفات:** `docs/14-design-prompts.md` · `docs/19-decisions.md` · `docs/16-website-plan.md` (0.2) · `docs/17-project-structure.md` · `design/brand/original/`
- **القرارات:** [DEC-20](19-decisions.md#dec-20) (تحديث: الألوان من لوجو Oxygen) · [DEC-22](19-decisions.md#dec-22) (⏸)
- **الجاي:** ملفات اللوجو ← نطلّع ألوانه بالكود ونشيك الـcontrast ← نعدّل برومبت A0 v2 عليه ← A0.

<a id="l-17"></a>

### L-17 · صور البراند الحقيقية ← برومبت A0 v2 على لوجو Oxygen

- **اتعمل:**
  - **وصلت صور البراند من الفيسبوك.** أول مجموعة (خطوط مايلة وكورال) طلعت لعيادة تانية بنفس الاسم، والصح هي اللي بعدها.
  - **حللناها:**
    - لقينا 3 لوجوهات مختلفة، واخترنا **O2 بالنقط**.
    - الألوان جاية من تدرّج اللوجو، ومعاها الكحلي والدهبي.
    - شيلنا البلوبز والشادو التقيل والنيون.
    - التفاصيل في [DEC-23](19-decisions.md#dec-23).
  - **برومبت A0 v2 اتكتب من جديد** في [14](14-design-prompts.md) على اللوجو الحقيقي. برومبت «النَّفَس» اتلغى قبل ما يتبعت.
  - **L1 → L4 اتلغت** لأن اللوجو موجود. L5 وL6 متوقفين لحد ما v2 تتقبل.
  - **صورتين اتحفظوا كمرجع** في `design/brand/original/`: اللوجو المربع (1200×1200) والغلاف (1600×640).
  - **محتوى لقيناه في البوستات (محتاج تأكيد من Oxygen):**
    - **التليفون:** 01032549164
    - **الفروع (قايمتين مختلفتين):**
      - بوستات بتقول: الشيخ زايد (كازان مول) · طنطا (شارع البحر، عمارة زهانا) · تلا (شارع المحكمة، عمارة عوض).
      - وبوست تاني بيقول: مصر الجديدة (شارع أحمد فؤاد، ميدان سانت فاتيما، أمام نادي الطيران) · التجمع الخامس (بجوار سور الجامعة الأمريكية، كمبوند لي روا) · تلا (عمارة عوض، الدور التالت).
    - **اسم صفحة الفيسبوك:** "عيادات أكسجين تخسيس و علاج طبيعي"، وبيرد منها Dr. Ahmed Elfarargy.
- **الملفات:** `docs/14-design-prompts.md` · `docs/19-decisions.md` · `docs/16-website-plan.md` (0.2) · `docs/17-project-structure.md` · `design/brand/original/`
- **القرارات:** [DEC-23](19-decisions.md#dec-23) (جديد) · [DEC-22](19-decisions.md#dec-22) (اتلغى)
- **اتأكدنا إزاي:** حسبنا الـcontrast لـ22 زوج ألوان بسكريبت بمعادلة WCAG. الكلام كله 4.5 أو أكتر، والحدود 3 أو أكتر. الاستثناء الوحيد الأكوا، وده للزينة بس.
- **الجاي:** صورة A0 v2 ← مراجعة ← `tokens.ts` وكل البرومبتات تتعدل ← ملف اللوجو الأصلي أو SVG بالكود.

<a id="l-18"></a>

### L-18 · برومبتات اللوجو L1 → L4 على لوجو Oxygen، بوصف كامل من غير ما ترفق صورة

- **اتعمل:**
  - **حللنا صورة اللوجو بالكود:**
    - طلّعنا شكل اللوجو الأبيض من الخلفية.
    - كبّرنا النقط 3×.
    - عدّينا الأشكال: 48 نقطة مدورة، نص قطرها من 1.6 لـ12.3px.
    - طلع إن الدايرة مفتوحة من الشمال، ومكانها عمود نقط على شكل S (العمود الفقري)، وعلى كل ناحية منه خط رفيع، والنقط الصغيرة بتتفرق ناحية الشمال.
    - طلّعنا الأبعاد: الدايرة حوالي ⅔ عرض كلمة OXYGEN، والجملة اللي تحتها حوالي 80% من عرضها.
  - **L1 → L4 اتكتبوا من جديد** في [14](14-design-prompts.md): الغامق، والأبيض، والرمز، وأيقونة التطبيق. **من غير ما ترفق صورة:** L1 فيه وصف اللوجو كامل، والباقي في نفس الشات.
  - **وصف اللوجو اتحط في برومبت A0 كمان** بدل "ارفع الصورة".
  - **رسم اللوجو SVG بالكود (potrace) اتوقف بطلبك** وهو لسه في فولدر مؤقت بره المشروع. مفيش ملفات اتضافت للمشروع منه.
- **الملفات:** `docs/14-design-prompts.md` · `docs/19-decisions.md` (DEC-23: التأثير)
- **القرارات:** [DEC-23](19-decisions.md#dec-23) (تحديث)
- **اتأكدنا إزاي:** الأرقام اللي في الوصف جاية من تحليل الصورة (مكان كل شكل وحجمه).
- **الجاي:** صور L1 → L4 ← مراجعة ← تتحفظ في `design/brand/` ← تتحول SVG.

<a id="l-19"></a>

### L-19 · A0 v2 بصورتين بس + برومبتات استخراجهم E1 · E2

- **اتعمل:**
  - **برومبت A0 v2 اتحدد فيه صورتين بس** في الـBoard كلها: صورة العلاج الطبيعي في الـHero، وصورة الدكتورة في الكارت. أي حاجة تانية كتابة وألوان ونقط.
  - **E1 وE2 اتضافوا** في [14](14-design-prompts.md): كل صورة منهم بتطلع لوحدها من نفس الشات. E2 بتحل محل L6.
- **الملفات:** `docs/14-design-prompts.md`
- **القرارات:** [DEC-21](19-decisions.md#dec-21)
- **الجاي:** صورة A0 v2 ← E1 ← E2 ← مراجعة كل واحدة.

<a id="l-20"></a>

### L-20 · A0 v2 اتقبلت: الألوان في الكود، واللوجو شفاف بنسخه، وبرومبتات A1 → A7 على الهوية الجديدة

- **اتعمل:**
  - **صورة A0 v2 اتقبلت** واتحفظت: `design/website/A0-design-system-v2.png`. المراجعة والملاحظات اللي هتتطبق في الكود في [سجل المراجعة](14-design-prompts.md#review).
  - **الألوان في الكود** (`packages/config/src/tokens.ts`) بقت زي [DEC-23](19-decisions.md#dec-23):
    - **اتضاف:** `brandFrom` · `brandTo` · `gold` · `mist` · `fieldBorder`
    - **اتشال:** `coral` · `mint`
    - **اتغيرت قيمته:** primary · ink · mutedText · background · border · التخصصات الأربعة
    - الـradius بقى 16.
  - **`globals.css`:** أسامي Tailwind الجديدة (`bg-gold` · `bg-mist` · `from-brand-from to-brand-to` · `border-field-border`)، وحدود الـInputs بقت `fieldBorder`. زرار "احجز" في الصفحة الرئيسية بقى `bg-gold text-ink`.
  - **اللوجو** ([DEC-24](19-decisions.md#dec-24)):
    - شلنا المربعات المرسومة من الخلفية بسكريبت Node: البكسل الرمادي بقى شفاف، والحواف بتتدرج.
    - طلّعنا منه 3 ملفات في `design/brand/`: `logo-color.png` · `logo-white.png` · `logo-symbol.png`.
    - نسخنا اللوجو لـ`apps/web/public/` و`apps/dashboard/public/`.
  - **ملف [14](14-design-prompts.md):**
    - جدول الهوية اتحدث.
    - A1 → A7 اتكتبوا من جديد على الهوية الجديدة: من غير كورال ولا فقاعات، وفيهم حلقة النقط والفروع الخمسة.
    - L5 اتعدل على الألوان الجديدة، وL1 → L3 وL6 مش محتاجينهم.
    - سجل الصور اتحدث على A0 v2.
- **الملفات:** `packages/config/src/tokens.ts` · `apps/web/src/app/globals.css` · `apps/web/src/app/[locale]/(marketing)/page.tsx` · `design/brand/*` · `design/website/A0-design-system-v2.png` · `apps/web/public/logo*.png` · `apps/dashboard/public/logo.png` · docs 14 · 16 · 17 · 19
- **المشاكل:** الملف اللي وصل شكله شفاف، بس المربعات جزء من الصورة نفسها (100% من البكسلات مش شفافة) — اتحلت في [DEC-24](19-decisions.md#dec-24).
- **القرارات:** [DEC-23](19-decisions.md#dec-23) ✅ · [DEC-24](19-decisions.md#dec-24)
- **اتأكدنا إزاي:**
  - `tsc` للموقع والداشبورد نجح، و`pnpm build` للاتنين نجح.
  - اللوجو بعد التنضيف: 80% من البكسلات شفافة، وحطيناه على خلفية Deep Teal وعلى Sand واتأكدنا إن مفيش حواف رمادي.
- **الجاي:** العناصر اللي جوه A0 (أولها حلقة النقط) ← E1 ← E2 ← A1.

<a id="l-21"></a>

### L-21 · صور A0 المفرّغة وصلت + الصور بتتغير من الداشبورد

- **اتعمل:** إنت بعت 4 صور من A0، واتحفظوا زي ما هما:
  - `design/website/A0-photo-hero.png`: العلاج الطبيعي، مفرّغة
  - `design/mocks/doctor-sample.png`: الدكتورة، مفرّغة
  - `design/website/A0-particle-ring.png`: حلقة النقط (مرجع للـSVG)
  - `design/website/A0-dots-wordmark.png`: موجة النقط وOXYGEN (مرجع للـSVG)
- **المشاكل:** [P-13](#p-13)
- **القرارات:** [DEC-25](19-decisions.md#dec-25)
- **اتأكدنا إزاي:** حطينا صورة الـHero على الخلفية الرملي بالكود وطلعت نضيفة.
- **الجاي:** A1 (إنجليزي — [DEC-26](19-decisions.md#dec-26)).

<a id="l-22"></a>

### L-22 · الموقع بقى إنجليزي أساسي

- **اتعمل:** `apps/web/src/i18n/routing.ts` بقى `defaultLocale: 'en'`. `DEFAULT_LOCALE` في `shared` فضل `ar` عشان الداشبورد.
- **الملفات:** `apps/web/src/i18n/routing.ts` · `docs/19-decisions.md` · `docs/16-website-plan.md`
- **القرارات:** [DEC-26](19-decisions.md#dec-26)
- **اتأكدنا إزاي:** `tsc` نجح، وشغلنا الموقع وجربنا:
  - `/` من غير لغة: بيروح `/en`، والصفحة `lang="en" dir="ltr"`.
  - `/` من متصفح عربي: بيروح `/ar`.
- **الجاي:** صورة A1 (البرومبت في [14](14-design-prompts.md)) ← مراجعة.

<a id="l-23"></a>

### L-23 · برومبتات A1 → A7 بقت تشتغل لوحدها في شات جديد

- **اتعمل:** إنت بتفتح شات ChatGPT جديد لكل صورة، فـChatGPT مش فاكر A0.
  - فكل برومبت من A1 لـA7 بقى أوله بلوك **"NEW CHAT — FULL DESIGN SYSTEM"**: وصف اللوجو، ولغة النقط، والألوان بالأرقام، والخطوط والشكل، وقواعد الـUX، والممنوعات.
  - أي جملة كانت بتقول "زي اللي في الـBoard" اتكتبت بالتفصيل: كارت الطبيب، وشريط الحجز، وخطوات الحجز المنقطة.
  - في 14: ارفع مع كل برومبت الصور اللي خلصت (A0 · اللوجو · العلاج الطبيعي · الدكتورة)، عشان ChatGPT يستخدمها زي ما هي وميعملش صور جديدة بدلها.
- **الملفات:** `docs/14-design-prompts.md`
- **اتأكدنا إزاي:** دورنا في 14 على "Same design system" و"like the board" و"from the board". مفيش أي واحدة فاضلة في A1 → A7. فيه واحدة بس في W-10، وده برومبت Phase 2 لسه هنعدله.
- **الجاي:** صورة A1 ← مراجعة.

<a id="l-24"></a>

### L-24 · A1 (الرئيسية — النص الأول) اتقبلت

- **اتعمل:**
  - صورة A1 اتحفظت: `design/website/W-01-home-top.png`. المراجعة والملاحظات اللي هتتطبق في الكود في [سجل المراجعة](14-design-prompts.md#review).
  - برومبت A2 بقى يقول لـChatGPT يكمّل على صورة A1 المرفوعة: نفس المسافات والخطوط، ومن غير ما يكرر الـNavbar والـHero.
- **الملفات:** `design/website/W-01-home-top.png` · `docs/14-design-prompts.md`
  - **اللوجو في البلوك:** بدل ما البرومبت يوصف اللوجو، بقى يقول لـChatGPT ياخد ملف اللوجو المرفوع زي ما هو، وفي الـNavbar يحطه بالعرض (الرمز + OXYGEN). ده لأن A1 طلّعت لوجو مرسوم من الوصف ومش مطابق. اتغير في A1 → A7.
- **الجاي:** صورة A2 (ارفع معاها A0 واللوجو والدكتورة وA1) ← مراجعة.

<a id="l-25"></a>

### L-25 · موجة النقط اتحفظت

- **اتعمل:** إنت بعت موجة النقط اللي بتفصل بين الأقسام (2048×117)، واتحفظت زي ما هي ([DEC-25](19-decisions.md#dec-25)):
  - `design/website/A0-dot-wave.png`: المرجع
  - `apps/web/public/images/shared/dot-wave.png`: اللي الموقع هيستخدمه
- **الملفات:** الصورتين · docs 14 · 17
- **الجاي:** صورة A2 ← مراجعة.

<a id="l-26"></a>

### L-26 · A2 (الرئيسية — النص التاني) اتقبلت

- **اتعمل:**
  - صورة A2 اتحفظت: `design/website/W-01-home-bottom.png`. المراجعة في [سجل المراجعة](14-design-prompts.md#review).
  - برومبت A3 (الموبايل) بقى يقول لـChatGPT ياخد نفس الصفحة من صور A1 وA2 المرفوعة، ويحط شريط الحجز تحت بعضه بدل الزرارين بس.
- **الملفات:** `design/website/W-01-home-bottom.png` · `docs/14-design-prompts.md`
- **الجاي:** صورة A3 ← مراجعة.

<a id="l-27"></a>

### L-27 · A3 (الرئيسية على الموبايل) اتقبلت

- **اتعمل:**
  - صورة A3 اتحفظت: `design/website/W-01-home-mobile.png`. المراجعة في [سجل المراجعة](14-design-prompts.md#review).
  - برومبت A4 بقى يستخدم صورة العلاج الطبيعي المرفوعة بدل ما يرسم واحدة جديدة، وياخد الـNavbar والـFooter والكروت من صورة الصفحة الرئيسية.
- **الملفات:** `design/website/W-01-home-mobile.png` · `docs/14-design-prompts.md`
- **الجاي:** صورة A4 ← مراجعة.

<a id="l-28"></a>

### L-28 · الأشكال بتيجي صور: برومبتات I1 → I4 وM1

- **اتعمل:**
  - إنت قلت إن الأشكال اللي في التصميم أغلبها هتبقى صور ([DEC-27](19-decisions.md#dec-27)). فطلّعنا من A1 → A3 الأشكال اللي محتاجة صورة:
    - 4 أيقونات تخصصات (I1 → I4)
    - خريطة الفروع (M1)
    - موبايل شريط التطبيق: بعدين
  - كل واحد ليه برومبت استخراج في [14](14-design-prompts.md)، ومكان ملفه في سجل الصور.
  - حلقة النقط وموجة النقط موجودين خلاص.
- **الملفات:** `docs/14-design-prompts.md` · `docs/19-decisions.md`
- **الجاي:** صور I1 → I4 وM1 · صورة A4.

<a id="l-29"></a>

### L-29 · أيقونات التخصصات الأربعة وصلت

- **اتعمل:**
  - برومبتات الأيقونات الأربعة بقت برومبت واحد (I1): الأربعة في صورة واحدة، والكود بيقطّعهم.
  - الصورة اللي وصلت اتحفظت زي ما هي: `design/website/A1-specialty-icons.png`.
  - **سكريبت Node:**
    - شال الخلفية البيضا: البكسل الملون بيفضل، والأبيض بيبقى شفاف.
    - لقى الـ4 أيقونات من المسافات الفاضية اللي بينهم.
    - حط كل أيقونة في مربع شفاف لوحدها.
  - الملفات: `apps/web/public/images/specialties/` · `nutrition.png` · `physio.png` · `derm.png` · `internal.png`.
- **اتأكدنا إزاي:** حطينا كل أيقونة على خلفية فاتحة من لون تخصصها، وطلعت نضيفة من غير حواف بيضا.
- **ملحوظة:** لون الجلدية والعلاج الطبيعي في الصورة أفتح شوية من ألوان `tokens.ts`. مقبول لأنها أيقونات مش كلام، فالـcontrast المطلوب 3 مش 4.5.
- **الجاي:** M1 (الخريطة) · صورة A4.

<a id="l-30"></a>

### L-30 · خريطة الفروع وصلت

- **اتعمل:** الخريطة (M1) اتحفظت زي ما هي:
  - `design/website/A2-branches-map.png`
  - `apps/web/public/images/home/branches-map.png`
  - أماكن الفروع منطقية: طنطا وطلا في الدلتا فوق، والشيخ زايد في الغرب، ومصر الجديدة والتجمع في الشرق.
- **مشكلة لسه مفتوحة:** أسامي الفروع مكتوبة بالإنجليزي جوه الصورة، فهتبان إنجليزي في صفحة `/ar` كمان.
- **اتغير بعدها:** الخريطة هتبقى Google Maps ([DEC-28](19-decisions.md#dec-28)). صورة M1 بقت مرجع للشكل بس، ونسخة الموقع منها اتشالت، وبرومبت M2 اتلغى.
- **الجاي:** صورة A4.

<a id="l-31"></a>

### L-31 · برومبتات الصور الناقصة من A0 → A3

- **اتعمل:** راجعنا سجل الصور في [14](14-design-prompts.md) ولقينا 3 صور ناقصة، واتكتب لكل واحدة برومبت:
  - **P1:** الموبايل اللي في شريط التطبيق
  - **D1:** صور الأطباء التلاتة التانيين، للتطوير بس، والكود بيقطّعهم
  - **L5:** الصورة الافتراضية للطبيب. اتكتبت من جديد بنفس ستايل الأيقونات المنقطة
  - **مش محتاجين برومبت:**
    - حلقة النقط: الكود بيشيل خلفيتها
    - علامات المتاجر وأيقونة الواتساب: الرسمية
- **الملفات:** `docs/14-design-prompts.md`
- **الجاي:** صور P1 وD1 وL5 · صورة A4.

<a id="l-32"></a>

### L-32 · موبايل شريط التطبيق وصل

- **اتعمل:**
  - الصورة الأصلية اتحفظت زي ما هي: `design/website/A2-app-phone.png`.
  - **الخلفية البيضا اللي بره الموبايل اتشالت بسكريبت:** بيبدأ من أطراف الصورة ويمشي على البكسلات البيضا لحد ما يقابل إطار الموبايل. فالشاشة البيضا اللي جوه الموبايل فضلت زي ما هي.
  - الملف اللي الموقع هيستخدمه: `apps/web/public/images/home/app-phone.png`.
- **اتأكدنا إزاي:** حطيناه على تدرّج البراند وطلع نضيف.
- **ملحوظة:** صورة البروفايل بتاعة "Sara" (المريضة) هي صورة الدكتورة بالبالطو. لو حابب تغيرها، ده برومبت تعديل.
- **الجاي:** D1 وL5 · صورة A4.

<a id="l-33"></a>

### L-33 · المرحلة 3: الـLayout + الصفحة الرئيسية بالكود

- **اتعمل:**
  - **Commit للشغل اللي فات** قبل ما نبدأ (`66036c8`).
  - **الخطوط:** Montserrat وAlexandria للعناوين ([DEC-29](19-decisions.md#dec-29)).
  - **الداتا جاهزة للـAPI** ([DEC-30](19-decisions.md#dec-30)):
    - `types/public.ts`: الـSchemas والـTypes.
    - `mocks/public/*`: ردود وهمية بنفس شكل الـAPI (`{ data: [...] }`).
    - `api/public/*`: `fetchPublic` و`fetchPublicList`. بيرجّعوا Result، وفيهم Schema وtimeout، والأخطاء متقسمة 5 أنواع.
    - `formatTime` و`formatNumber` اتضافوا في `packages/shared`.
  - **Components مشتركة:**
    - زراير الهوية (`brandButton`: دهبي · تيل · Outline)، ارتفاعها 44px.
    - `Container` · `SectionHeading` · `Logo` (الرمز صورة، وجنبه OXYGEN بالكود).
    - **`ParticleRingImage`:** أي صورة جوه حلقة النقط. بتقبل أي صورة، ولو مفيش صورة بيظهر شكل افتراضي (DEC-25). والحلقة اتقصّت مربع مركزه هو مركز الفتحة.
    - `DotWave` · `DoctorCard` · `SpecialtyCard`.
    - `SectionState` + `RetryButton`: الخطأ والفاضي في أي قسم.
    - `OfflineNotice`: شريط بيظهر لما النت يقطع.
  - **الـLayout:**
    - Navbar ثابت فوق.
    - قايمة الموبايل بتفتح من ناحية البداية.
    - تغيير اللغة.
    - Footer كحلي.
    - زرار واتساب عايم.
    - رابط "انتقل للمحتوى".
  - **الصفحة الرئيسية:**
    - **الـHero + شريط الحجز:** التخصص والفرع ← `/book?specialty=&branch=`.
    - **الأرقام · التخصصات (2×2 في الموبايل) · Secret Seven:** النقط بالعرض في الكمبيوتر، وبالطول في الموبايل، والخطوة 7 بتقفل حلقة.
    - **البرامج · الأطباء:** أول 4 أطباء.
    - **الفروع على Google Maps:** بتتحمّل لما الزائر يوصل لها، وفيها زرار "الاتجاهات" ([DEC-28](19-decisions.md#dec-28)).
    - **شريط التطبيق.**
  - **صفحات الخطأ:** `error.tsx` · `not-found.tsx` · `[...rest]`. اللينكات اللي صفحاتها لسه متعملتش بتوصل لـ404 بلغة الزائر.
  - **الـFavicon** بقى رمز O2 (`app/icon.png`).
  - **النصوص كلها** في `messages/en.json` و`ar.json`.
- **اختلافات عن الصور (مقصودة):**
  - **شريط التطبيق:** التدرّج من Deep Teal لـOcean بدل الأكوا، لأن الكلام الأبيض على الأكوا contrast بتاعه 2.2.
  - **خلفية مربعات التخصصات:** لون التخصص الفاتح فوق أبيض مش رملي، عشان "Learn more" يبقى 4.7 بدل 4.45.
  - **علامات App Store وGoogle Play:** مؤقتة (كلام + أيقونة) لحد العلامات الرسمية.
  - **آراء المرضى:** مستنية آراء حقيقية. والـCTA الأخير مش موجود في الصور.
- **الملفات:**
  - `apps/web/src/{api/public, mocks/public, types/public.ts, components/layout, components/shared, app/[locale]/(marketing), app/[locale]/error.tsx, not-found.tsx, [...rest]}`
  - `lib/fonts.ts` · `lib/env.ts` · `lib/whatsapp.ts` · `messages/*.json` · `.env.example`
  - `public/images/{shared, home, mocks}` · `app/icon.png` · `packages/shared/src/format.ts`
- **المشاكل:** [P-14](#p-14) · [P-15](#p-15)
- **القرارات:** [DEC-29](19-decisions.md#dec-29) · [DEC-30](19-decisions.md#dec-30)
- **اتأكدنا إزاي:**
  - `tsc` · `pnpm lint` · `pnpm build` من غير Errors.
  - **صوّرنا الصفحة بـEdge:** إنجليزي وعربي على 1440، وموبايل 390 جوه iframe. وقارناها بصور A1 · A2 · A3.
  - **جربنا كل حالة بـ`MOCK_SCENARIO`:**
    - **network:** 4 أقسام بتعرض "مش قادرين نتصل" + "حاول تاني"، وشريط الأرقام بيستخبى، والـHero بيعرض الصورة الافتراضية.
    - **empty:** 4 أقسام بتعرض "مفيش حاجة هنا لسه".
    - **server · invalid:** الصفحة بتكمل، والقسم بيعرض رسالته.
  - **سكريبت WCAG للألوان المستخدمة:** كلها AA بعد تعديل خلفية التخصصات.
  - `/en/doctors` (لسه متعملتش) بترجع 404 بلغة الزائر.
- **الجاي:**
  - صور A4 → A7 لما الليمت يرجع.
  - الصورتين D1 وL5.
  - المرحلة 4: باقي الصفحات.

<a id="l-34"></a>

### L-34 · الصفحة على شاشة 320px

- **اتعمل:** إنت جربت الصفحة على 320px، ولقيت حاجة مخلية الصفحة أعرض من الشاشة ([P-16](#p-16)). اتصلحت حاجتين:
  - **الـNavbar:**
    - الزرار الدهبي بقى مكتوب عليه "Book" / "احجز" بس تحت 640px، زي A3.
    - كلمة OXYGEN بقت أصغر والمسافة بين حروفها أقل.
    - المسافة بين اللوجو والزراير قلت.
  - **مربعات التخصصات:** عمود واحد تحت 400px، واتنين من 400 لفوق. والعنوان بيتكسر لو الكلمة طويلة.
- **الملفات:** `components/layout/navbar.tsx` · `components/shared/logo.tsx` · `components/shared/specialty-card.tsx` · `(marketing)/_components/specialties-section.tsx` · `messages/*.json` (`nav.book`)
- **المشاكل:** [P-16](#p-16)
- **اتأكدنا إزاي:**
  - صوّرنا الصفحة كلها جوه iframe عرضه 320px، بالإنجليزي وبالعربي.
  - مفيش حاجة طالعة بره الشاشة، والـNavbar باين كله (اللوجو + احجز + ☰).
  - `tsc` و`build` من غير Errors.

<a id="l-35"></a>

### L-35 · الـResponsive تحت 992px + قايمة الاختيار + الحركة + الـScrollbar

- **اتعمل (طلبك):**
  - **`lg` بقى 992px بدل 1024** (`--breakpoint-lg` في `globals.css`). تحت كده الموقع بيتعامل كموبايل وتابلت.
  - **لينكات الـNavbar على الكمبيوتر بقت من 1280 (`xl`)**، لأن اللينكات والزراير مش بتساع في 992. تحت كده بتبان القايمة (☰).
  - **الـHero تحت 992:**
    - الصورة فوق.
    - العنوان والكلام تحتها في النص.
    - بعدهم شريط الحجز، وزرار الواتساب في النص.
  - **مربع الأرقام:** الأرقام في نص كل خانة تحت 992.
  - **عناوين الأقسام (`SectionHeading`):** في النص تحت 992، ومن البداية فوقها.
  - **Secret Seven:**
    - تحت 1280 العنوان والزرار فوق في النص، والخطوات تحتهم.
    - تحت 992 الخطوات بالطول في نص الصفحة.
  - **قايمة الاختيار في شريط الحجز:**
    - بتفتح تحت الخانة على طول وبنفس عرضها (`position="popper"`).
    - كل اختيار ارتفاعه 44px.
    - اللي مختار بيبقى بلون التيل.
    - جنب كل تخصص نقطة بلونه.
    - السهم بيلف لما القايمة تفتح، والخانة بيبان حواليها إطار وهي مفتوحة.
  - **الحركة:**
    - **الحلقة اللي حوالين صورة الـHero بتتنفس:** بتكبر وتلف سنة كل 4.5 ثانية، على الحلقة بس مش على الصورة (DEC-13).
    - **Secret Seven:** النقط بتظهر ورا بعض، والخط المنقط بيترسم بينهم.
    - **الكروت:** كروت التخصصات والبرامج والأطباء بتظهر ورا بعض (`RevealGroup`)، وبتطلع لفوق سنة لما الماوس يعدي عليها.
    - **الزراير:** بتصغر سنة لما تدوس عليها.
    - كل الحركة بتقف لو الزائر مقفل الحركة في جهازه.
  - **الـScrollbar:** أرفع (8px)، ولونه تيل على خلفية رملي.
- **الملفات:**
  - `app/globals.css`
  - `lib/motion.ts`
  - `components/shared/{reveal-group.tsx (جديد), section-heading, particle-ring-image, brand, doctor-card, specialty-card}`
  - `components/layout/navbar.tsx`
  - `(marketing)/_components/{hero, booking-bar, trust-bar, journey-section, journey-steps (جديد), specialties-section, programs-section, doctors-section}`
- **اتأكدنا إزاي:**
  - `tsc` و`lint` و`build`.
  - صوّرنا الصفحة على 390 إنجليزي و800 عربي: الصورة فوق والكلام في النص.

<a id="l-36"></a>

### L-36 · `.gitignore` كامل + ربط الـRepo على GitHub

- **اتعمل:**
  - **`.gitignore` اللي في الـRoot بقى زي المشاريع الكبيرة:**
    - المكتبات (`node_modules`).
    - ملفات الـBuild والـCache (`.next` · `dist` · `.turbo` · `*.tsbuildinfo` …).
    - كل ملفات الـenv ما عدا `.env.example`.
    - اللوجز.
    - ملفات الويندوز والماك والـEditors.
    - ملفاتك الشخصية: `structure and image/` وصورتين في `public/images/`.
  - **ربط الـRepo:** `origin` = `https://github.com/elraikmido799-blip/SMART-CLINIC-OS.git`.
- **مشكلة لسه مفتوحة:** الـPush رجع `Repository not found`. يعني الحساب المتسجل على الجهاز ملوش صلاحية على الـRepo، أو اللينك فيه غلطة.
- **اتأكدنا إزاي:** `git ls-files -ci --exclude-standard` مرجّعش حاجة، يعني مفيش ملف متسجل في Git داخل تحت أي قاعدة من القواعد الجديدة.
- **الجاي:** إنت تظبط الصلاحية، وبعدين `git push -u origin main`.

---

## المشاكل وحلولها

| ID | المشكلة | الحل |
|---|---|---|
| [P-01](#p-01) | create-next-app: "path is not writable" | نعمل فولدر `apps` الأول |
| [P-02](#p-02) | create-next-app عمل Workspace لوحده جوه `apps/web` | نمسحه ونرجّع الموقع للـWorkspace الأساسي |
| [P-03](#p-03) | Port 3000 مشغول | الموقع بيشتغل على 3001 لوحده |
| [P-04](#p-04) | pnpm 12 وقف التسطيب (Ignored build scripts) | `allowBuilds` |
| [P-05](#p-05) | `@swc/core` مش بيشتغل (صلاحيات الويندوز) | استغنينا عن next-intl plugin |
| [P-06](#p-06) | TypeScript: `DirectionProvider` عايز `dir` | استخدمنا `dir` |
| [P-07](#p-07) | Errors في `.next/dev/types` على ملفات اتمسحت | مسحنا `.next` |
| [P-08](#p-08) | ESLint: قراية `ref` أثناء الـrender | `useState(makeStore)` |
| [P-09](#p-09) | ESLint: `react-refresh` في routes الداشبورد | استثناء لفولدر `routes` |
| [P-10](#p-10) | ESLint: `setState` جوه effect في الـcarousel | استثناء لفولدر `components/ui` |
| [P-11](#p-11) | ESLint 10 مش مدعوم من إضافات Next | الموقع على ESLint 9 |
| [P-12](#p-12) | Git: "LF will be replaced by CRLF" على كل الملفات | `.gitattributes` |
| [P-13](#p-13) | قريت صورة مفرّغة على إنها متقطعة غلط | نحطها على خلفية الموقع قبل ما نحكم |
| [P-14](#p-14) | خانات الاختيار (Select) فضلت 32px رغم `h-11` | `data-[size=default]:h-11` |
| [P-15](#p-15) | Edge headless مش بيصغّر الشاشة لـ390px | الصفحة جوه iframe عرضه 390 |
| [P-16](#p-16) | على 320px الصفحة كانت أعرض من الشاشة | الـNavbar أقصر + التخصصات عمود واحد تحت 400px |

<a id="p-01"></a>

### P-01 · create-next-app: "The application path is not writable"

- **حصل في:** [L-03](#l-03)
- **السبب:** create-next-app بيتأكد إن الفولدر الأب (`apps`) موجود وينفع يكتب فيه، والفولدر مكانش موجود.
- **الحل:** `mkdir apps` قبل الأمر.

<a id="p-02"></a>

### P-02 · create-next-app عمل Workspace لوحده

- **حصل في:** [L-03](#l-03)
- **السبب:** لما بتستخدم pnpm، create-next-app بيعمل `pnpm-workspace.yaml` و`pnpm-lock.yaml` جوه `apps/web`، فـpnpm بيعامل الموقع كمشروع منفصل عن الـRepo.
- **الحل:**
  1. نقلنا `allowBuilds` لـ`pnpm-workspace.yaml` اللي في الـRoot.
  2. مسحنا `apps/web/pnpm-workspace.yaml` و`pnpm-lock.yaml` و`node_modules`.
  3. شلنا `packageManager` من `apps/web/package.json`.
  4. `pnpm install` من الـRoot.
- **اتأكدنا إزاي:** `pnpm install` بيكتب **"Scope: all … workspace projects"**.

<a id="p-03"></a>

### P-03 · Port 3000 مشغول

- **حصل في:** [L-03](#l-03)
- **السبب:** فيه برنامج Node تاني على جهازك فاتح Port 3000.
- **الحل:** Next بيشتغل على **3001** لوحده. لو عايز 3000، اقفل البرنامج التاني.

<a id="p-04"></a>

### P-04 · pnpm 12 وقف التسطيب (ERR_PNPM_IGNORED_BUILDS)

- **حصل في:** [L-06](#l-06)
- **السبب:** pnpm 12 مش بيشغّل أي Build script إلا لو الـPackage متسجلة في `allowBuilds`. وnext-intl جاب معاه `@swc/core` و`@parcel/watcher`.
- **الحل:** سجلناهم `false` في `allowBuilds`، لأنهم بينزلوا بنسخ جاهزة (Prebuilt) — [DEC-17](19-decisions.md#dec-17).

<a id="p-05"></a>

### P-05 · `@swc/core` مش بيشتغل (Failed to load native binding)

- **حصل في:** [L-08](#l-08)
- **الرسالة:** `SWC native addon: validate cache root … DACL grants replacement rights …`
- **السبب:**
  - `@swc/core` بيفك ملفه في فولدر Cache، وبيتأكد إن **كل الفولدرات اللي فوقه لحد أول الـDrive** مش مفتوحة لحد غيرك.
  - على جهازك: `AppData\Local` عليه صلاحيات لبرامج ويندوز تانية، و`D:\` مفتوح لكل المستخدمين.
  - جربنا 3 أماكن مختلفة، وكلهم اترفضوا.
- **الحل:** next-intl كان بيحمّل `@swc/core` عن طريق الـplugin بس، فاستغنينا عن الـplugin بسطر واحد بيعمل نفس شغله — [DEC-07](19-decisions.md#dec-07).

<a id="p-06"></a>

### P-06 · TypeScript: `Property 'dir' is missing`

- **حصل في:** [L-08](#l-08)
- **السبب:** `DirectionProvider` اللي shadcn عمله بياخد الاسمين (`dir` و`direction`)، بس الـType طالب `dir`.
- **الحل:** `<DirectionProvider dir={dir}>`.

<a id="p-07"></a>

### P-07 · Errors في `.next/dev/types/validator.ts`

- **حصل في:** [L-08](#l-08)
- **السبب:** أول `pnpm dev` ولّد Types بتشاور على `src/app/page.tsx` و`layout.tsx`، وإحنا مسحناهم بعد كده.
- **الحل:** مسحنا فولدر `apps/web/.next` (بيتولد تاني لوحده مع أي dev أو build).

<a id="p-08"></a>

### P-08 · ESLint: `Cannot access refs during render`

- **حصل في:** [L-10](#l-10)
- **السبب:** قواعد React Hooks الجديدة بتمنع قراية `ref.current` أثناء الـrender. والـ`StoreProvider` كان بيعمل الـStore بـ`useRef`.
- **الحل:** `const [store] = useState(makeStore)`: بيعمل الـStore مرة واحدة بس، ومن غير قراية `ref`.

<a id="p-09"></a>

### P-09 · ESLint: `react-refresh/only-export-components` في routes الداشبورد

- **حصل في:** [L-10](#l-10)
- **السبب:** كل ملف Route في TanStack Router بيعمل export لـ`Route`، والـComponent بيفضل جوه الملف. والقاعدة دي بتعتبر ده غلط.
- **الحل:** قفلنا القاعدة لفولدر `src/routes/` بس — [DEC-18](19-decisions.md#dec-18).

<a id="p-10"></a>

### P-10 · ESLint: `react-hooks/set-state-in-effect` في الـcarousel

- **حصل في:** [L-10](#l-10)
- **السبب:** ملف `carousel.tsx` اللي shadcn عمله بيزامن الـstate مع مكتبة Embla جوه `useEffect`.
- **الحل:** قفلنا القاعدة لفولدر `src/components/ui/` بس، عشان ملفات shadcn بنسيبها زي ما هي — [DEC-18](19-decisions.md#dec-18).

<a id="p-11"></a>

### P-11 · ESLint 10 مش مدعوم من إضافات Next

- **حصل في:** [L-11](#l-11)
- **الرسالة:** `unmet peer eslint` من `eslint-plugin-import` و`eslint-plugin-jsx-a11y` و`eslint-plugin-react` (دول جوه `eslint-config-next`).
- **الحل:** الموقع رجع ESLint **9**، والداشبورد فضل على **10**. ESLint بيراجع الكود بس ومش بيترجمه، فالفرق ده مش بيأثر على `packages/` — [DEC-15](19-decisions.md#dec-15).

<a id="p-12"></a>

### P-12 · Git: "LF will be replaced by CRLF"

- **حصل في:** [L-11](#l-11) (قبل أول Commit)
- **السبب:**
  - Git على الويندوز متظبط إنه يحوّل نهايات السطور لـCRLF.
  - Prettier بيكتب LF.
  - النتيجة: الملفات هتفضل تبان "متغيرة" من غير ما حد يلمسها، وPrettier هيفضل يرجّعها.
- **الحل:** ملف `.gitattributes` في الـRoot (`* text=auto eol=lf`): كل الملفات النصية LF على أي جهاز، والصور والخطوط Binary.

<a id="p-13"></a>

### P-13 · قريت صورة مفرّغة على إنها متقطعة غلط

- **حصل في:** [L-21](#l-21). قلت إن خلفية صورة العلاج الطبيعي اتشالت غلط، وإن فيه سواد وتوهج حوالين الناس.
- **السبب:** البرنامج اللي Claude بيفتح بيه الصور بيعرض الجزء الشفاف أسود، فالحواف الناعمة بتبان كأنها توهج.
- **الحل:** قبل ما نحكم على أي صورة شفافة، نحطها بالكود على خلفية الموقع (Sand `#FAF7F0`) ونبص عليها.

<a id="p-14"></a>

### P-14 · خانات الاختيار (Select) فضلت 32px رغم `h-11`

- **حصل في:** [L-33](#l-33). خانات شريط الحجز في الصورة كانت أقصر من الزراير اللي جنبها.
- **السبب:** `SelectTrigger` بتاع shadcn فيه `data-[size=default]:h-8`. الكلاس ده فيه Selector على الـattribute، فـCSS بيديله أولوية أعلى من `h-11` العادي.
- **الحل:** نكتب `data-[size=default]:h-11` بنفس الشكل، من غير ما نعدّل ملف shadcn.

<a id="p-15"></a>

### P-15 · Edge headless مش بيصغّر الشاشة لـ390px

- **حصل في:** [L-33](#l-33). صورة الموبايل طلعت مقصوصة، والـNavbar كان ظاهر فيه زرار "Patient Login".
- **السبب:**
  - Edge headless ليه أقل عرض للشاشة، فالصفحة اتعرضت أعرض من 390.
  - ومعاها غلطة حقيقية: `hidden` كان متضاف لكلاسات الزرار من غير `cn()`، فـ`inline-flex` كان بيكسب.
- **الحل:**
  - الصور بتتاخد لصفحة HTML فيها iframe عرضه 390px.
  - الزرار بقى بـ`cn()`.

<a id="p-16"></a>

### P-16 · على 320px الصفحة كانت أعرض من الشاشة

- **حصل في:** [L-34](#l-34). إنت لقيتها وإنت بتجرب على 320.
- **السبب:**
  - **الـNavbar:** مجموع عرض اللوجو + "Book Now" + زرار القايمة كان حوالي 350px، وده أكبر من 288px (320 ناقص الهوامش). فزرار القايمة كان بيطلع بره الشاشة.
  - **مربعات التخصصات:** كانت اتنين جنب بعض. كلمة زي "Dermatology" مبتتكسرش، فالمربع بيكبر ويزق الـGrid بره الشاشة.
- **الحل:** [L-34](#l-34). ومن هنا ورايح: أي صفحة بتتجرب على 320 كمان، مش 390 بس.

---

## مستنيين إيه ومن مين

| الحاجة | من مين | محتاجينها في |
|---|---|---|
| صور التصميم (برومبتات [14](14-design-prompts.md): جلسة A للموقع وجلسة B للداشبورد) ← في `design/` | إنت | **قبل المرحلة 3** ([DEC-19](19-decisions.md#dec-19)) |
| صور الموقع (برومبتات المرحلة 2 في [16](16-website-plan.md)) | إنت | صفحات الموقع |
| المحتوى: الأطباء، الفروع، الأسعار، Secret Seven، اللوجو، رقم الواتساب | Oxygen | الخطة 0.2 |
| الأرقام إنجليزي ولا هندي | Oxygen | [DEC-12](19-decisions.md#dec-12) |
| ملف `openapi.yaml` + لينك الـStaging | مبرمج الباك | الربط بالـAPI (في الآخر) |
| رفع الـRepo على GitHub | إنت (في الوقت اللي يناسبك) | — |
| فولدر `structure and image/` في الـ`.gitignore` ✅ ([L-36](#l-36)) | — | — |
| صلاحية الحساب على الـRepo عشان الـPush ([L-36](#l-36)) | إنت | الرفع |
| اللوجو ✅ ([L-20](#l-20)). لو Oxygen عندهم **الملف الأصلي** (SVG أو AI)، هيبقى أحسن من الـPNG | Oxygen (عن طريقك) | مش مستعجل |
| **تأكيد الفروع والتليفون** (البوستات فيها قايمتين فروع مختلفتين — [L-17](#l-17)) | Oxygen | صفحة الفروع والـFooter |
