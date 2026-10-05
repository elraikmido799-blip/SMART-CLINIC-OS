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
