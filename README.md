# Oxygen Digital Platform — Smart Clinic OS

> **الحالة:** بدأنا التنفيذ. **الأساس خلص** للموقع والداشبورد ([16](docs/16-website-plan.md) — المرحلة 1 ✅)، والجاي: المرحلة 3 (الـLayout + الصفحة الرئيسية).
> اللي اتعمل خطوة بخطوة في [18-dev-log.md](docs/18-dev-log.md).

منظومة رقمية واحدة لـOxygen Clinics بتربط المريض والعيادة والأطباء والتخصصات الأربعة (Nutrition · Physiotherapy · Dermatology · Internal Medicine)
مع الـCRM والحجز والدفع والمتابعة والخدمات الرقمية المدفوعة والإدارة، على **قاعدة بيانات واحدة ونظام واحد**،
وقابلة للتوسع: Multi-branch من أول يوم، وجاهزة لـMulti-specialty والـSubscriptions والـCorporate والـSaaS.

---

## الـTech Stack باختصار

**النظام: Separate.** الموقع والداشبورد أبلكيشنين منفصلين في Repo فرونت واحد، والباك في Repo لوحده.

| الجزء | التكنولوجيا | المكان |
|---|---|---|
| Website + Patient Portal | Next.js + Tailwind + shadcn/ui | `apps/web` |
| Staff / Clinic / CEO Dashboard | React + Vite + antd | `apps/dashboard` |
| Patient App (iOS + Android) — **بعد الويب** | Expo + NativeWind | `apps/mobile` |
| الداتا في كل الواجهات | RTK Query | جوه كل أبلكيشن |
| المشترك الحقيقي بس | Types + Formatters + Design tokens | `packages/` |
| Backend API (اقتراح لمبرمج الباك) | NestJS + PostgreSQL + Redis | **Repo منفصل** |
| اللغة | **TypeScript** · Repo الفرونت بـpnpm workspace | |

ليه الاختيار ده وإيه البدائل: [docs/01-tech-stack.md](docs/01-tech-stack.md) · قرارات التنفيذ: [docs/19-decisions.md](docs/19-decisions.md)

---

## التشغيل

```powershell
pnpm install          # أول مرة بس
pnpm dev:web          # الموقع      → http://localhost:3000 (أو 3001)
pnpm dev:dashboard    # الداشبورد   → http://localhost:5173
```

أول مرة على أي جهاز: انسخ `.env.example` لـ`.env.local` في `apps/web` و`apps/dashboard`.
باقي الأوامر وكل فولدر بيعمل إيه: [docs/17-project-structure.md](docs/17-project-structure.md).

---

## الملفات

| الملف | فيه إيه |
|---|---|
| [brief.md](docs/brief.md) | **البريف الأصلي** زي ما هو في الـPDF، بصيغة Markdown |
| [00-requirements-catalog.md](docs/00-requirements-catalog.md) | البريف حرف بحرف متقسّم لأكتر من 450 متطلب مرقّم + التعارضات + الأسئلة المفتوحة |
| [01-tech-stack.md](docs/01-tech-stack.md) | الـStack المقترح، ليه، والمطلوب على جهازك |
| [02-architecture.md](docs/02-architecture.md) | الـArchitecture: الـ4 مستويات + OXYGEN CORE + الـEngines + الأحداث |
| [03-modules.md](docs/03-modules.md) | تقسيم المنظومة لـ35 Module + إزاي نضيف تخصص جديد |
| [04-database.md](docs/04-database.md) | تصميم الداتابيز (ERDs + الجداول المهمة + القيود) |
| [05-apps-structure.md](docs/05-apps-structure.md) | هيكل الويبسايت والتطبيق والداشبورد + جرد الشاشات + تعريف الـKPIs |
| [06-roles-permissions.md](docs/06-roles-permissions.md) | الأدوار والصلاحيات + Workflow يومي لكل Role |
| [07-lifecycles.md](docs/07-lifecycles.md) | **رسومات السايكلز:** دورة المريض، الـCRM، المواعيد، البرامج، الباقات، الاشتراكات، الدفع، دورة التطوير |
| [08-roadmap.md](docs/08-roadmap.md) | **MVP / Phase 2 / Phase 3 + الـTimeline + الخطوات** |
| [09-infrastructure-costs.md](docs/09-infrastructure-costs.md) | السيرفرات، الصيانة، الـBackup، والتكلفة الشهرية التقديرية |
| [10-security.md](docs/10-security.md) | الأمان والخصوصية |
| [11-integrations-stores.md](docs/11-integrations-stores.md) | الـAPIs والخدمات الخارجية + متطلبات App Store و Google Play |
| [12-risks.md](docs/12-risks.md) | المخاطر وإزاي نقللها |
| [13-ownership-handover.md](docs/13-ownership-handover.md) | الملكية وتسليم الكود والحسابات لـOxygen |
| [14-design-prompts.md](docs/14-design-prompts.md) | **برومبتات ChatGPT** لتطليع صور التصميم |
| [15-frontend-backend-contract.md](docs/15-frontend-backend-contract.md) | **الاتفاق بين الفرونت والباك:** OpenAPI، الـMocks، الأخطاء، الـAuth، مين مسؤول عن إيه |
| [16-website-plan.md](docs/16-website-plan.md) | **خطة الموقع وحالتها:** المراحل والخطوات، والحجز والبورتال (شكل)، وبرومبتات الصور |
| [17-project-structure.md](docs/17-project-structure.md) | **خريطة المشروع:** كل فولدر وملف، والأوامر، والـenv، وتحط الحاجة الجديدة فين، وقواعد الكود |
| [18-dev-log.md](docs/18-dev-log.md) | **سجل التنفيذ:** كل خطوة اتعملت بالترتيب، والمشاكل اللي قابلتنا وحلها |
| [19-decisions.md](docs/19-decisions.md) | **سجل القرارات:** ليه اخترنا كل حاجة، والبدائل اللي رفضناها |

### الـ20 بند اللي البريف طلبهم من الـDeveloper (§30)

| # | البند | الملف |
|---|---|---|
| 1 | Proposed System Architecture | [02](docs/02-architecture.md) |
| 2 | Modules List | [03](docs/03-modules.md) |
| 3 | Database structure | [04](docs/04-database.md) |
| 4 | Web / App / Dashboard structure | [05](docs/05-apps-structure.md) |
| 5 | User roles & permissions | [06](docs/06-roles-permissions.md) |
| 6–9 | MVP · Phase 2 · Phase 3 · Timeline | [08](docs/08-roadmap.md) |
| 10–12, 14, 18 | Infrastructure · Server/cloud · Maintenance · Backup · Running costs | [09](docs/09-infrastructure-costs.md) |
| 13 | Security architecture | [10](docs/10-security.md) |
| 15–17 | App Store/Google Play · APIs/integrations · Third-party services | [11](docs/11-integrations-stores.md) |
| 19 | Technical risks | [12](docs/12-risks.md) |
| 20 | تسليم الكود والتوثيق والحسابات | [13](docs/13-ownership-handover.md) |

---

## هنمشي إزاي (الخلاصة)

```text
النهارده      → مراجعة الملفات + إرسال الأسئلة المفتوحة لـOxygen + فتح الحسابات باسم Oxygen + صور التصميم
أسابيع 1–8    → Discovery & Design: SRS · Journeys · Workflows · Database · Architecture · Figma Prototype
~22 أسبوع     → تطوير الويب: Backend + Dashboard + Website + Patient Portal (Demo لـOxygen كل Sprint)
~5 أسابيع     → Testing + UAT + Penetration test
~6 أسابيع     → Pilot في فرع واحد
منتصف 2027   → Launch الويب
بعدها         → تطبيق المريض (~12 أسبوع) ← Phase 2 (Digital Business) ← Phase 3
```

التفاصيل والـGantt: [docs/08-roadmap.md](docs/08-roadmap.md)

---

## إزاي تشوف الرسومات

الملفات فيها رسومات **Mermaid**. في VS Code سطّب Extension اسمها **Markdown Preview Mermaid Support**، وبعدين افتح أي ملف واضغط `Ctrl+Shift+V`.
(على GitHub بتظهر لوحدها.)

---

## الافتراضات اللي اتبنت عليها الخطة

- **بلد التشغيل: مصر** (من لهجة البريف). لو غير كده، الـPayment gateway ومزود الـSMS والقوانين ومكان السيرفرات هيتغيروا.
- **الفريق:** Frontend (الموقع + الداشبورد، وبعدهم التطبيق) و Backend مبرمج تاني في Repo منفصل. الـStack الخاص بالباك في [01](docs/01-tech-stack.md) **اقتراح**، والقرار ليه.
- **الأولوية للويب:** الـBackend والداشبورد والموقع الأول، وتطبيق الموبايل بعدهم.
- **اللغات:** عربي (RTL) + إنجليزي.
- **التقديرات الزمنية** محسوبة على فريق 4 مطورين + مصمم + QA.
- **كل الأسعار تقديرية** ولازم تتراجع قبل التعاقد.
- الحاجات اللي محتاجة قرار من Oxygen متجمعة في [الأسئلة المفتوحة](docs/00-requirements-catalog.md#open-questions).
