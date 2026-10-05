# 01 — الـTech Stack المقترح

## الخلاصة

> **TypeScript في كل حتة:**
> **Next.js + Tailwind + shadcn/ui** (Website + Patient Portal) · **React + Vite + antd** (Staff Dashboard) · **NestJS** (Backend API) · **PostgreSQL + Prisma** (Database) · **Redis + BullMQ** (Jobs والتذكيرات)
> وفي الآخر: **Expo + NativeWind** (Patient App). **الأولوية للويب، والتطبيق بعده.**
> **النظام: Separate.** الموقع (`apps/web`) والداشبورد (`apps/dashboard`) أبلكيشنين منفصلين في **Repo فرونت واحد**، والداتا فيهم بـ**RTK Query**، والباك في **Repo منفصل**.

### مين بيعمل إيه

| الجزء | مين | ملاحظة |
|---|---|---|
| Website + Patient Portal + Staff Dashboard | **Frontend developer** | الشغل الأساسي دلوقتي |
| Patient App (موبايل) | Frontend / Mobile | بعد ما الويب يخلص |
| Backend + Database + Infrastructure | **Backend developer** | الـStack المكتوب هنا **اقتراح** له، والقرار النهائي ليه |

> اللي الفرونت محتاجه من الباك، أيًا كانت لغته، متجمّع في [15-frontend-backend-contract.md](15-frontend-backend-contract.md).

### ليه مش "مكتبة واحدة"؟

المشروع 4 منتجات: Website، App موبايل، Dashboard داخلي، وBackend.
مفيش مكتبة واحدة بتعمل الأربعة كويس. الحل إننا نستخدم **لغة واحدة (TypeScript)** وأدوات متناسقة مع بعض،
فاللي يعرف جزء يقدر يشتغل في الباقي، وأنواع البيانات (Types) وقواعد التحقق بتتكتب مرة واحدة وتتشارك في كل حتة.

---

## الجدول الكامل

| الطبقة | التكنولوجيا | ليه |
|---|---|---|
| **Backend API** | NestJS على Fastify | هيكل Modules جاهز (مناسب لفكرة "Modular" في البريف)، Guards للصلاحيات، Swagger تلقائي، وأي مطور Node بيفهمه بسرعة |
| **Database** | PostgreSQL | Transactions مضمونة للفلوس، JSONB للفورمز الطبية المرنة، قيود بتمنع الحجز المزدوج من الداتابيز نفسها، وبتستحمل ملايين السجلات |
| **ORM** | Prisma | الـSchema نفسها مقروءة وبتعتبر توثيق للداتا، Migrations آمنة، Type-safety |
| **Jobs & Cache** | Redis + BullMQ | التذكيرات والإشعارات والتجديد التلقائي والتقارير التقيلة بتشتغل في الخلفية |
| **Website + Portal** | Next.js (App Router) | SEO للإعلانات وجوجل، تحميل سريع، عربي وإنجليزي |
| **Staff Dashboard** | React + Vite + **antd** + TanStack Router | SPA سريعة وبسيطة. وantd فيه الجداول والفورمز والفلاتر والتواريخ جاهزة، والعربي RTL جاهز، وده أقل مجهود لأكبر جزء في المشروع |
| **UI** | الموقع: Tailwind CSS + shadcn/ui · الداشبورد: antd · التطبيق: NativeWind + React Native Reusables | كل جزء بالمكتبة الأنسب له، وكلهم بياخدوا الألوان والخطوط من **ملف Design tokens واحد** |
| **Patient App** (بعد الويب) | Expo (React Native) | كود واحد لـiOS وAndroid، بيشارك الكود مع الويب، تحديثات OTA سريعة، والرفع على المتاجر سهل (EAS) |
| **Validation** | Zod | نفس قواعد التحقق في الباك والفرونت والموبايل |
| **Data fetching** | RTK Query (Redux Toolkit) | نفس الطريقة في الموقع والداشبورد والتطبيق: Caching، حالات Loading / Error، وMocks لحد ما الـAPI يجهز |
| **API Contract** | REST + OpenAPI (Swagger) | الـEndpoints بتتولد من ملف الـOpenAPI بـ`@rtk-query/codegen-openapi` |
| **Realtime** | Socket.IO | الحجز الجديد يظهر عند الريسبشن والطبيب في نفس اللحظة |
| **Files** | S3-compatible Storage | التحاليل والأشعة والصور: Private + لينكات مؤقتة |
| **Repo الفرونت** | pnpm workspace | الموقع والداشبورد (والتطبيق بعدين) في Repo واحد، كل واحد أبلكيشن لوحده، والمشترك الحقيقي بس في `packages/`. Turborepo بنضيفه لو الـBuild بطّأ |
| **DevOps** | Docker + GitHub Actions + Expo EAS | نشر تلقائي، وقابل للنقل لأي Cloud |
| **Monitoring** | Sentry + Uptime monitoring | نعرف المشكلة قبل ما المريض يشتكي |

---

## الـStack ده بيحقق شروط البريف إزاي

| شرط البريف | إزاي |
|---|---|
| **Scalable** | Modular monolith بيكبر أفقيًا (نزود Instances)، PostgreSQL + Read replica، Redis. ونقدر نفصل أي Module لـService مستقلة بعدين من غير ما نعيد البناء |
| **Secure** | Guards + RBAC + Branch scope، Prisma بيمنع SQL Injection، تشفير، 2FA للموظفين، Audit log — [10-security.md](10-security.md) |
| **Maintainable** | لغة واحدة، Types مشتركة، هيكل NestJS معروف عالميًا، Tests أوتوماتيك |
| **Fast** | Next.js SSG/ISR للويبسايت، Redis caching، Indexes مدروسة، Dashboard SPA |
| **قابل للتطوير** | Specialty plugins + Form engine + Program builder + Catalog engine — [03-modules.md](03-modules.md) |
| **مش رهينة لشخص واحد** | TypeScript / React / Node أكبر سوق مطورين في العالم وفي مصر، فسهل تلاقي حد يكمّل. وكله Open source بدون Licenses |

## "ومتتعبنيش" — الـStack ده بيريّحك إزاي

1. **لغة واحدة**: TypeScript في الباك والفرونت والموبايل.
2. **Types مشتركة**: لو غيّرت شكل الـAPI، الـFrontend يطلع Error وقت الكتابة قبل ما يتحول لـBug عند المريض.
3. **الـAPI بيتولد لوحده**: Endpoints الـRTK Query بتتولد من ملف الـOpenAPI، يعني مش هتكتب `fetch` بإيدك.
4. **Dashboard جاهز نص الطريق**: antd فيه الجداول والفورمز والفلاتر والـDate pickers والـDrawers جاهزة، والعربي RTL بسطر واحد.
5. **Expo EAS**: بيبني ويرفع على المتاجر بأمر واحد، وبيبني iOS على السحابة فـ**مش محتاج Mac**.
6. **Mocks**: بتشتغل على الشاشات بداتا وهمية من غير ما تستنى الباك، والتبديل للـAPI الحقيقي بمتغير واحد في الـenv.

---

## تفاصيل كل جزء

### Backend — NestJS (اقتراح لمبرمج الباك)

- **Fastify adapter** عشان الأداء.
- **Modular monolith**: كل Module (crm, scheduling, clinical, billing…) فولدر مستقل فيه Controller + Service + Repository، ومفيش Module بيلمس جداول Module تاني إلا من خلال الـService بتاعته.
- **Auth**: JWT (Access token قصير ~15 دقيقة + Refresh token بيتغير مع كل استخدام)، `argon2` للباسوردات، OTP للمرضى على الموبايل، و2FA (TOTP) للموظفين.
- **RBAC**: Guard + Decorator زي `@RequirePermission('appointments.manage')` + Branch scope.
- **Validation**: Zod (عن طريق `nestjs-zod`).
- **Swagger / OpenAPI** بيتولد تلقائي.
- **BullMQ Workers**: Reminders، Notifications، Renewals، Reports.
- **Socket.IO Gateway** + Redis adapter عشان الـReal-time.
- **Logs**: `pino` (JSON).
- **PDF بالعربي** (فواتير وتقارير): Gotenberg (خدمة Docker بتشغّل Chromium وبتطلع العربي صح).

### Database — PostgreSQL + Prisma

- PostgreSQL (Managed، من غير ما ندير سيرفر داتابيز بإيدنا).
- Extensions: `pg_trgm` للبحث بالاسم، `btree_gist` لمنع الحجز المزدوج، `citext`.
- Prisma Migrate، ومعاه Migrations بـSQL يدوي للحاجات المتقدمة (Constraints / Views).
- IDs من نوع **UUIDv7** (بيترتب بالوقت وآمن في الـURLs).
- التفاصيل في [04-database.md](04-database.md).

### Website + Patient Portal — Next.js

- App Router: الصفحات التسويقية Static/ISR (سريعة جدًا)، والبورتال Dynamic.
- `next-intl` للعربي والإنجليزي مع RTL.
- SEO: Metadata، Sitemap، و Schema.org (`MedicalClinic` / `Physician`).
- Analytics: GA4 + Meta Pixel/Conversions API + TikTok Pixel — **من غير أي بيانات طبية**.

### Staff Dashboard — React + Vite + antd

- **antd (Ant Design)** لكل الـComponents: `Table` (ترتيب، فلاتر، صفحات، أعمدة ثابتة)، `Form`، `DatePicker` / `RangePicker`، `Drawer`، `Modal`، `Upload`، `Steps`…
- **عربي و RTL** من `ConfigProvider`:

  ```tsx
  import { ConfigProvider } from 'antd';
  import arEG from 'antd/locale/ar_EG';

  <ConfigProvider
    direction="rtl"
    locale={arEG}
    theme={{ token: { colorPrimary: '#0E8C7F', borderRadius: 12, fontFamily: '"IBM Plex Sans Arabic", Inter, sans-serif' } }}
  >
    <App />
  </ConfigProvider>
  ```

- **الألوان والخطوط** جاية من نفس ملف الـDesign tokens اللي الموقع والتطبيق بياخدوا منه، فالهوية واحدة.
- TanStack Router (Routes بـTypes) + **RTK Query** (نفس اللي في الموقع).
- **الفورمز:** `Form` بتاع antd + Adapter صغير بيحوّل الـZod schemas لقواعد antd، فالتحقق يفضل نفس اللي في الـAPI.
- **التواريخ:** Day.js (اللي antd بيستخدمه) + الـtimezone plugin عشان توقيت الفرع.
- **الرسوم البيانية:** Recharts أو `@ant-design/charts`.
- **كالندر الريسبشن** (عمود لكل طبيب أو غرفة): الـ`Calendar` بتاع antd مش بيعمل ده، فهنستخدم FullCalendar (الـResource view بتاعه مدفوع) أو EventCalendar (مجاني MIT) — نحسمها في Sprint المواعيد.
- **متخلطش Tailwind مع antd** في الداشبورد: الـpreflight بتاع Tailwind بيبوّظ ستايلات antd. لو احتجته، اقفل الـpreflight.
- `react-i18next` للترجمة.
- **المصمم:** فيه Ant Design kit رسمي على Figma، فالتصميم بيطلع بنفس الـComponents اللي هتتنفذ.
- **الموظفين على الموبايل:** الشاشات المهمة (Executive Dashboard، My Day، الكالندر) بتتعمل Responsive، والداشبورد بيتسطب على الموبايل كـPWA. تطبيق موبايل للموظفين مش مطلوب في البريف، ولو احتجناه بعد الـPilot نعمله بـExpo.

### Patient App — Expo (React Native) — بييجي بعد الويب

- Expo Router + NativeWind (نفس Tailwind على الموبايل) + **React Native Reusables** (نسخة shadcn للموبايل، فشكله قريب من الموقع). antd مبيشتغلش على React Native.
- RTK Query بنفس الطريقة اللي في الويب.
- `expo-notifications` (Push)، `expo-secure-store` (التوكنز)، `expo-local-authentication` (البصمة/الوش)، `expo-image-picker` (الصور)، `expo-video` (فيديوهات التمارين).
- Charts: `victory-native` أو `react-native-gifted-charts`.
- EAS Build / Submit / Update.

### Shared Packages (المشترك الحقيقي بس)

| Package | فيه إيه | مش فيه |
|---|---|---|
| `packages/shared` | Types، Enums (حالات المواعيد، الأدوار)، أسماء الصلاحيات، اللغات، Formatters (فلوس، تواريخ، موبايل، BMI، توحيد الحروف العربية للبحث) | أي React component |
| `packages/config` | **Design tokens** (الألوان والخطوط والـradius): الموقع بيحوّلها لـCSS variables، والداشبورد بيحطها في antd theme، والتطبيق بعدين | — |

> الـComponents **مبتتشاركش**: الموقع بـshadcn والداشبورد بـantd. والترجمة كل أبلكيشن ليه ملفاته.

### Testing

| النوع | الأداة |
|---|---|
| Unit | Vitest |
| API Integration (على PostgreSQL حقيقية) | Supertest + Testcontainers |
| E2E للويب والداشبورد | Playwright |
| E2E للموبايل | Maestro |

### جودة الكود

ESLint + Prettier · Husky + lint-staged · Conventional Commits · Renovate (تحديث المكتبات أوتوماتيك) · `dependency-cruiser` (بيمنع أي Module إنه يتعدى على Module تاني).

---

## هيكل Repo الفرونت (نظام Separate)

```text
SMART CLINIC OS/
├── apps/
│   ├── web/            Next.js + Tailwind + shadcn: الموقع + الحجز + بوابة المريض
│   ├── dashboard/      React + Vite + antd: داشبورد الموظفين والـCEO
│   └── mobile/         Expo: تطبيق المريض (بعد الويب)
├── packages/
│   ├── shared/         Types + Enums + الصلاحيات + Formatters
│   └── config/         Design tokens
├── docs/               ← الملفات دي
├── CLAUDE.md           قواعد المشروع
└── package.json · pnpm-workspace.yaml
```

**قواعد Separate:**
- كل أبلكيشن ليه `package.json` بتاعه، وبيتبني ويتنشر لوحده.
- **ممنوع أبلكيشن يستورد من التاني.** المشترك بيعدي من `packages/` بس.
- **الـUI مبيتشاركش:** shadcn + Tailwind في `web` بس، وantd في `dashboard` بس.
- `packages/` فيه منطق وTypes وTokens بس، من غير React components.

> **الباك في Repo منفصل** بتاع مبرمج الباك. الربط بينا عن طريق ملف الـOpenAPI بس — [15-frontend-backend-contract.md](15-frontend-backend-contract.md).

---

## البدائل اللي فكرنا فيها، وليه استبعدناها

| البديل | ليه لأ |
|---|---|
| **Flutter** للموبايل | ممتاز، بس لغة تانية (Dart) ومفيش مشاركة كود مع الويب والباك |
| **Laravel / Django** | ممتازين، بس لغة تانية غير الفرونت، يعني محتاجين نوعين مطورين |
| **Firebase / Supabase** | بداية سريعة، لكن منطق المشروع (اشتراكات، CRM تلقائي، صلاحيات طبية) هيبقى صعب ومتبعتر. وFirebase بالذات NoSQL، فالتقارير صعبة وفيه Lock-in |
| **Microservices من أول يوم** | تكلفة وتعقيد من غير فايدة دلوقتي. الـModular monolith بيدّينا نفس الفصل ونقدر نقسّم بعدين |
| **Next.js بس (Full-stack)** | ممكن، لكن Backend بالحجم ده (Jobs، Webhooks، موبايل، Integrations) محتاج هيكل NestJS |
| **أنظمة جاهزة (Odoo وغيره)** | هتحارب النظام عشان تعمل الـJourney والـDigital products زي البريف، ومش هتبقى ملكية كاملة لـOxygen |
| **shadcn/ui للداشبورد** | شكل أحلى والكود بتاعك، لكن هتبني الجداول والفورمز والفلاتر بنفسك. antd أسرع بكتير لداشبورد بالحجم ده |
| **antd للموقع كمان** | الموقع هيطلع شكله "سيستم" مش موقع عيادة، وأتقل في التحميل، وده بيأثر على جوجل والإعلانات |

---

## المطلوب على جهازك قبل ما نبدأ (Windows)

| الأداة | الحالة على جهازك | ملاحظة |
|---|---|---|
| Node.js | ✅ v24.12.0 | تمام (LTS) |
| npm | ✅ 11.6.2 | |
| Git | ✅ 2.53 | |
| pnpm | ✅ 12.9.1 | |
| Docker Desktop | مش محتاجه | ده للباك، والفرونت شغال بـMocks |
| Android Studio | — | لما نوصل للتطبيق: للـEmulator (اختياري، ممكن تجرب على موبايلك بـExpo Go) |
| حساب Expo | — | لما نوصل للتطبيق: عشان EAS (بيبني iOS على السحابة من غير Mac) |

**Extensions في VS Code (كلهم متسطبين ✅):** ESLint · Prettier · Tailwind CSS IntelliSense · Pretty TypeScript Errors · **Markdown Preview Mermaid Support** (عشان الرسومات اللي في الملفات دي).
