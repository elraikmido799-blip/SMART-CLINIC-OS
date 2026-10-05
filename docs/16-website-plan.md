# 16 — خطة الموقع خطوة بخطوة (Website + Booking + Portal)

> **الهدف:** الموقع كله (W-01 → W-18 + PP-01 → PP-08 في [05](05-apps-structure.md)) مبني وشغال بالشكل النهائي.
> **الحجز والدفع والـLogin والبورتال = شكل بس دلوقتي** بداتا وهمية (Mocks). لما الـAPI يجهز بنغيّر سطرين ونربط.
> اشتغل بالترتيب، وكل خطوة ليها رقم (1.1، 1.2…) عشان نرجع لها.

**الملف ده = الخطة وحالتها بس.** الباقي في ملفات تانية:

| عايز تعرف | الملف |
|---|---|
| فين كل حاجة، وتحط الجديد فين، وقواعد الكود | [17-project-structure.md](17-project-structure.md) |
| اتعمل إيه بالظبط، والمشاكل اللي قابلتنا وحلها | [18-dev-log.md](18-dev-log.md) |
| ليه اخترنا كده | [19-decisions.md](19-decisions.md) |

**الحالة:** ✅ خلصت · 🔄 شغالين فيها · ⏳ لسه

---

## القرارات اللي الخطة مبنية عليها

| الموضوع | القرار | التفاصيل |
|---|---|---|
| النظام | **Separate**: الخطة دي لـ`apps/web`، والداشبورد في نفس الـRepo | [DEC-01](19-decisions.md#dec-01) · [DEC-02](19-decisions.md#dec-02) |
| الـStack | Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui | [DEC-09](19-decisions.md#dec-09) |
| الداتا | **RTK Query** في الصفحات التفاعلية · Functions على السيرفر في الصفحات التعريفية | [DEC-04](19-decisions.md#dec-04) · [DEC-11](19-decisions.md#dec-11) |
| الـMocks | `createBaseQuery`: التبديل للـAPI بمتغير واحد في الـenv | [DEC-05](19-decisions.md#dec-05) |
| اللغات | next-intl: عربي (الافتراضي، RTL) + إنجليزي | [DEC-07](19-decisions.md#dec-07) · [DEC-08](19-decisions.md#dec-08) |
| الألوان | `packages/config`: مصدر واحد للموقع والداشبورد | [DEC-06](19-decisions.md#dec-06) |
| الأنيميشن | [Motion](https://motion.dev) | [DEC-13](19-decisions.md#dec-13) |
| الفولدرات | **Colocation** + أقرب فولدر مشترك | [DEC-10](19-decisions.md#dec-10) |
| الفورمز | react-hook-form + Zod + shadcn `form` | — |
| الأرقام | إنجليزي (1، 2، 3) حتى في العربي | [DEC-12](19-decisions.md#dec-12) |

---

## نظرة سريعة على المراحل

| المرحلة | المحتوى | المدة التقريبية | الحالة |
|---|---|---|---|
| 0 | قبل الكود: اتجاه التصميم + المحتوى المطلوب من Oxygen | 2–3 أيام | ⏳ عليك وعلى Oxygen |
| 1 | التسطيب والأساس (الموقع + الداشبورد) | 3–4 أيام | ✅ |
| 2 | الصور (برومبتات ChatGPT) | 2–3 أيام (بالتوازي) | ⏳ عليك |
| 3 | الـLayout + الصفحة الرئيسية | أسبوع | ⏳ |
| 4 | باقي صفحات الموقع التعريفي | 2–3 أسابيع | ⏳ |
| 5 | الحجز + الدفع + الدخول (شكل) | أسبوع | ⏳ |
| 6 | بوابة المريض (شكل) | أسبوع ونص – أسبوعين | ⏳ |
| 7 | SEO + الأداء + المراجعة النهائية | أسبوع | ⏳ |
| | **الإجمالي** | **~9–10 أسابيع** | |

---

## المرحلة 0 — قبل الكود

### 0.1 اتجاه التصميم

- برومبتات [14-design-prompts.md](14-design-prompts.md)، صورة صورة، وكل صورة بتتراجع مع Claude قبل اللي بعدها:
  - **جلسة A** للموقع (A0 → A8) — **الأول**.
  - **جلسة B** للداشبورد (B0 → B6) — بعد ما صور الموقع تخلص.
- احفظ الصور اللي عجبتك في `design/website/` و`design/dashboard/` بالأسامي اللي في آخر ملف 14.
- **المرحلة 3 بتبدأ بعد الصور دي**، عشان الشاشات تتبني على الشكل اللي اخترته على طول ([DEC-19](19-decisions.md#dec-19)).

### 0.2 المحتوى المطلوب من Oxygen

لحد ما يوصل، بنشتغل بداتا وهمية واضح إنها وهمية.

- [x] ~~اللوجو والهوية~~: من تصميمك في A0 ([DEC-20](19-decisions.md#dec-20)). المطلوب من Oxygen بس: موافقتهم، لو عندهم لوجو قديم
- [ ] الأطباء: **صور حقيقية**، الاسم، اللقب، نبذة، التخصص، الفروع والأيام
- [ ] الفروع: العنوان، اللوكيشن على الخريطة، المواعيد، التليفون، صور حقيقية
- [ ] الخدمات: الاسم، المدة، السعر لكل فرع
- [ ] تفاصيل Secret Seven
- [ ] أرقام حقيقية للـTrust bar (عدد المرضى، الأطباء، الفروع)
- [ ] آراء مرضى **حقيقية** بموافقتهم
- [ ] رقم الواتساب ولينكات السوشيال
- [ ] نصوص الصفحات القانونية (من المحامي)

---

## المرحلة 1 — التسطيب والأساس ✅

> اتعملت للموقع **والداشبورد** مع بعض. الأوامر والنسخ والمشاكل اللي قابلتنا في [18-dev-log.md](18-dev-log.md)، وشكل الفولدرات النهائي في [17-project-structure.md](17-project-structure.md).

| # | الخطوة | الحالة | التفاصيل |
|---|---|---|---|
| 1.1 | الأدوات (pnpm 12 + Extensions الـVS Code) | ✅ | [L-01](18-dev-log.md#l-01) |
| 1.2 | Git + الـWorkspace | ✅ | [L-02](18-dev-log.md#l-02) |
| 1.3 | مشروع Next.js (`apps/web`) | ✅ | [L-03](18-dev-log.md#l-03) |
| 1.4 | shadcn/ui (Radix + RTL) | ✅ | [L-05](18-dev-log.md#l-05) |
| 1.5 | المكتبات + Motion | ✅ | [L-06](18-dev-log.md#l-06) |
| 1.6 | Prettier + Husky + Lint | ✅ | [L-10](18-dev-log.md#l-10) |
| 1.7 | الفولدرات | ✅ | [17 §4](17-project-structure.md) |
| 1.8 | الألوان (`packages/config`) والخطوط والـRTL | ✅ | [L-07](18-dev-log.md#l-07) · [L-08](18-dev-log.md#l-08) |
| 1.9 | اللغات (next-intl) | ✅ | [L-08](18-dev-log.md#l-08) |
| 1.10 | الـLayout والـProviders | ✅ | [L-08](18-dev-log.md#l-08) |
| 1.11 | RTK Query + الـMocks + ملفات الـenv | ✅ | [L-07](18-dev-log.md#l-07) · [L-08](18-dev-log.md#l-08) |
| 1.12 | الـHelpers المشتركة (`packages/shared`) | ✅ | [L-07](18-dev-log.md#l-07) |
| 1.13 | الأنيميشن (Motion + `Reveal`) | ✅ | [L-08](18-dev-log.md#l-08) |
| 1.14 | أساس الداشبورد (`apps/dashboard`) | ✅ | [L-09](18-dev-log.md#l-09) |
| 1.15 | مراجعة الأساس + توحيد النسخ + نظام التسجيل + أول Commit | ✅ | [L-11](18-dev-log.md#l-11) |

**اتأكدنا:**
- `pnpm build` و`pnpm lint` بيعدّوا على الاتنين.
- `/ar` بيفتح RTL وعربي، و`/en` LTR وإنجليزي.
- الداشبورد بيفتح على `http://localhost:5173`.

---

## المرحلة 2 — الصور (برومبتات ChatGPT)

### قبل ما تبدأ

- كل البرومبتات في **محادثة واحدة جديدة** عشان الستايل يفضل واحد.
- ابدأ بالبرومبت **2.0** دايمًا، وبعده الباقي **واحد واحد**.
- ⚠️ **ممنوع AI** في: صور أطباء Oxygen، صور Before/After، آراء المرضى. دول لازم حقيقيين.
  صورة متولدة على إنها "دكتور عندنا" أو "نتيجة علاج" بتضلل المريض، وممكن تعمل مشكلة قانونية.
- صور الفروع والعيادة المتولدة **Placeholder** لحد ما يتعمل تصوير حقيقي.

### 2.0 الـArt Direction (أول برومبت)

```text
You are the art director and photographer for "Oxygen Clinics", a modern multi-branch clinic group in Egypt (Nutrition, Physiotherapy, Dermatology, Internal Medicine) that also offers online health programs.

For this whole chat, follow this art direction for every image I request:
- 100% original images. Do not imitate, recreate or reference any existing photo, stock image, brand, campaign, artist or website.
- Photographic, editorial, warm and human, never generic stock. Real-looking Egyptian / Middle-Eastern people of different ages; some women wear hijab and some don't; natural skin texture, natural hands, genuine expressions; nobody looks at the camera unless I ask.
- Setting: a bright modern clinic with white walls, light oak wood, soft green plants, rounded furniture, glass and lots of daylight. Never a cold hospital look.
- Color grade: airy whites and soft mint (#E6F4F1); Oxygen Teal (#0E8C7F) appears naturally in small details (a scrub, a towel, a mug, a chair); a tiny touch of warm coral (#FF7A59). Low contrast, soft shadows.
- Signature motif: very subtle soft light bubbles / bokeh, like oxygen in the air, barely visible.
- Camera: 35mm or 50mm lens, shallow depth of field, eye level, natural light.
- Absolutely no text, letters, numbers, logos, watermarks or UI in the image unless I ask.
- Avoid clichés: handshakes, thumbs up, stethoscope poses, staged smiles at the camera, plastic skin, extra fingers.

Reply "Ready", then create a first test image: a calm, bright reception area of an Oxygen clinic with no people, landscape 3:2.
```

### 2.1 Hero الصفحة الرئيسية · `W-01`

```text
Image for the website HERO, landscape 3:2, high resolution.
A nutrition specialist (woman, early 30s, teal scrubs) and a patient (man, around 40, casual clothes) sit together at a light wood desk, looking at a tablet that shows a soft abstract chart (no readable text). A genuine, relaxed conversation; a glass of water and a small plant on the desk.
Composition: the people are on the LEFT half of the frame; the RIGHT 45% is clean, soft, bright negative space (an out-of-focus clinic wall with subtle light bubbles) so a headline can sit there.
```

### 2.2 التخصصات الأربعة · `W-03`

```text
New series "Specialties": 4 images with identical lighting, lens, color grade and framing (landscape 4:3, subject centered with breathing room). Create them ONE BY ONE: start with #1 now and wait for me to say "next".
#1 Nutrition: a dietitian's hands arranging a colorful balanced plate (grilled chicken, salad, brown rice, fruit) on a light wood table in a bright consultation room; a measuring tape and a glass of water nearby; the patient softly out of focus.
#2 Physiotherapy: a physiotherapist gently guiding a patient's knee bend on a treatment bed; focus on the supportive hands and the controlled movement; a teal towel.
#3 Dermatology: a dermatologist examining a woman's cheek with a handheld dermatoscope by a large window; calm, respectful, soft daylight.
#4 Internal Medicine: a doctor measuring the blood pressure of a woman in her 60s with a cuff; both relaxed; the monitor faces away so no numbers are visible.
```

### 2.3 أيقونات Secret Seven · `W-09`

```text
For this request only, switch from photography to a 3D icon style.
Create 7 matching icons for the stages of a patient journey, in this order, evenly spaced in one row on a transparent background (wide canvas):
1 Assessment: a clipboard with a soft body-outline silhouette
2 Plan: a folded map with a dotted path
3 Treatment: two caring hands holding a small glowing bubble
4 Follow-up: a calendar page with a check mark
5 Progress: a rising line chart on a small card
6 Stabilization: three balanced smooth stones
7 Maintenance: a leaf inside a circular loop arrow
Style: soft rounded 3D clay look, matte, gentle shadows; Oxygen Teal #0E8C7F and mint #E6F4F1 with white; one tiny coral #FF7A59 accent per icon; same size, same lighting, same camera angle. No text, no numbers.
```

### 2.4 البرامج الرقمية · `W-10`

```text
New series "At-home digital care": same art direction, but at HOME (a bright modern Egyptian apartment, light wood, plants), landscape 4:3. One by one, start with #1:
#1 Online Nutrition: a woman in her 30s photographs her healthy lunch with her phone at the kitchen counter.
#2 Physio Home: a man in his 40s does a guided leg exercise on a yoga mat in the living room, following a video on a tablet leaning on the sofa (screen blurred, no UI).
#3 Derm Follow-up: a young woman near a window checks her skin in a handheld mirror, her phone on the shelf beside her, soft morning light.
#4 Chronic Care: a man in his 60s checks his blood pressure at the dining table with a home monitor, a cup of tea and his phone next to him (no readable screens).
```

### 2.5 الاستشارة الأونلاين · `W-08`

```text
A patient (woman, 40s) at home on a sofa having a video consultation on a laptop. The laptop screen shows a blurred, friendly doctor in teal scrubs (no UI, no text). She is taking notes. Warm afternoon light. Landscape 3:2; the people are on the left, clean negative space on the right.
```

### 2.6 أماكن العيادة (Placeholder) · `W-02` `W-06`

```text
New series "Oxygen spaces": empty spaces, no people, landscape 3:2. One by one, start with #1:
#1 Reception: a curved light-wood reception desk, a mint accent wall, comfortable waiting chairs, plants, big windows.
#2 Physiotherapy room: treatment beds, an exercise mat, resistance bands neatly arranged, daylight.
#3 Consultation room: a calm desk with two chairs, a small plant, a body-composition scale in the corner.
```

### 2.7 ترويج التطبيق · `W-15`

```text
A natural, relaxed hand holding a modern smartphone, front-facing and perfectly straight. The screen is completely plain pure white (I will place the real app screenshot on it later). Soft mint background with very subtle bubbles. Landscape 3:2; the phone is on the left half, negative space on the right.
```

### 2.8 صفحة عرض / حملة · `W-12`

```text
Campaign hero for a summer healthy-weight program: a woman in her 30s in sportswear and hijab walks briskly along a riverside promenade at sunrise, holding a water bottle; energetic but calm. Landscape 3:2; the person is on the left third, soft sky negative space on the right; warm golden light with teal tones.
```

### 2.9 أغلفة المقالات · `W-13`

```text
New series "Learn covers": editorial still life, top-down or 45°, landscape 16:9, no brand labels. One by one, start with #1:
#1 A healthy Egyptian breakfast flat-lay: ful medames, boiled eggs, cucumber, tomatoes, whole-wheat baladi bread, mint tea.
#2 Knee-friendly exercise gear: a yoga mat, a resistance band, a foam roller and a water bottle on a light wood floor.
#3 A gentle skincare routine: unlabeled cleanser, moisturizer and sunscreen bottles on a white shelf with a small plant.
#4 Heart-health still life: a home blood pressure monitor (screen off), oats, nuts, berries and a measuring tape.
```

### 2.10 رسومات الحالات (404، نجاح، فاضي…) · كل الصفحات

```text
New series "Spot illustrations": switch to a minimal line illustration style with 2px rounded strokes in Deep Ink #0B2E2B, soft teal and mint fills, lots of white space, a few soft bubbles, transparent background, square 1:1, no text. One by one, start with #1:
#1 Page not found: a small paper map with a dotted path that ends in a question-mark-shaped bubble.
#2 Booking confirmed: a calendar page with a big check mark and floating bubbles.
#3 No appointments yet: an empty calendar with a small plant beside it.
#4 Payment failed: a card with a small gentle warning bubble; calm, not scary.
#5 No documents yet: an empty folder with a soft bubble floating out.
```

### برومبتات التعديل

| عايز إيه | الصق ده |
|---|---|
| الإيدين أو الوشوش مش طبيعية | `Keep everything identical, but make the hands and faces look natural and realistic.` |
| نفس المشهد بناس تانيين | `Same scene with different people (different ages and looks), same art direction.` |
| أفتح وأهدى | `Lighter and airier: more white space, softer shadows, less saturation.` |
| ظهر كلام أو لوجو | `Remove any text, letters, numbers or logos, keep everything else identical.` |
| المساحة الفاضية مش كفاية | `Make the negative space on the right cleaner and wider for a headline.` |

### صور الأطباء الحقيقية (دليل التصوير)

عشان صور الأطباء تطلع شبه بعض:
- نفس الخلفية: حيطة Mint فاتحة أو أبيض.
- نفس الإضاءة: نور شباك أو Softbox.
- كادر من الصدر لفوق، مقاس **4:5**، والدكتور بيبص للكاميرا بابتسامة طبيعية.
- اللبس: Scrubs Teal أو بالطو أبيض.

### بعد ما تطلّع الصور

1. احفظها في `apps/web/public/images/<page>/` بأسماء `kebab-case`، زي `home-hero.png` · `specialty-nutrition.png`.
2. اضغطها لـWebP (أقل من ~300KB) من [squoosh.app](https://squoosh.app).
3. اعرضها بـ`next/image` دايمًا، مع `alt` بالعربي والإنجليزي من ملفات الترجمة.
4. صور الناس مفيهاش كتابة، فينفع تعكسها في الإنجليزي بـ`ltr:-scale-x-100`، عشان المساحة الفاضية تيجي ناحية النص.

---

## المرحلة 3 — الـLayout + الصفحة الرئيسية

### 3.1 الـLayout المشترك · `components/layout/`

- **Navbar:** اللوجو · التخصصات · البرامج · Digital · الأطباء · الفروع · Learn · `LanguageSwitcher` · "دخول المريض" (Ghost) · "احجز الآن" (Coral).
- **MobileMenu:** `Sheet` بيفتح من ناحية البداية (يمين في العربي).
- **Footer:** اللينكات · الفروع · السوشيال · الصفحات القانونية.
- **WhatsAppButton:** زرار عائم، ورسالة جاهزة مختلفة لكل صفحة من `lib/whatsapp.ts`.
- **LanguageSwitcher:** `router.replace(pathname, { locale })` من `i18n/navigation`.
- `(marketing)/layout.tsx` بيجمعهم.

### 3.2 الصفحة الرئيسية · `W-01` · `(marketing)/page.tsx`

| Section | الـComponent | الداتا |
|---|---|---|
| Hero | `_components/hero.tsx` | نصوص + صورة 2.1 |
| Trust bar | `_components/trust-bar.tsx` | أرقام (حقيقية من Oxygen) |
| التخصصات | `_components/specialties-section.tsx` + `SpecialtyCard` | `getSpecialties()` |
| Secret Seven | `_components/journey-section.tsx` | أيقونات 2.3 |
| البرامج الرقمية | `_components/digital-section.tsx` | صور 2.4 |
| الأطباء | `_components/doctors-carousel.tsx` + `DoctorCard` (shared) | `getDoctors()` |
| الفروع | `_components/branches-section.tsx` + `BranchCard` (shared) | `getBranches()` |
| التطبيق | `_components/app-promo.tsx` | صورة 2.7 |
| آراء المرضى | `_components/testimonials.tsx` | **حقيقية بس** (تتخفي لحد ما توصل) |
| CTA أخير | `_components/cta-band.tsx` | — |

> الصفحة **Server Component**. اللي فيه تفاعل بس (الـCarousel) هو اللي عليه `'use client'`.

---

## المرحلة 4 — باقي صفحات الموقع التعريفي

> كل صفحة: `page.tsx` بيجيب الداتا من `src/api/public` ← بيركّب Sections من `_components/` ← النصوص من `messages/`.
> وأي صفحة `[slug]` فيها `generateStaticParams` من نفس الداتا.

| # | الصفحة | المسار | Sections أساسية | shadcn زيادة |
|---|---|---|---|---|
| 4.1 | التخصصات + كل تخصص · `W-03` | `/specialties` · `/specialties/[slug]` | Hero بلون التخصص · بنعالج إيه · الخدمات · الأطباء · البرامج المرتبطة · FAQ · CTA | — |
| 4.2 | الخدمة · `W-04` | `/services/[slug]` | الوصف · المدة · "يبدأ من" السعر · مناسبة لمين · تتوقع إيه · التحضير · الفروع · الأطباء · FAQ · احجز ← `/book?service=` | `breadcrumb` |
| 4.3 | الأطباء + البروفايل · `W-05` | `/doctors` · `/doctors/[slug]` | فلاتر (تخصص / فرع) في الـURL · Grid · البروفايل: النبذة، التخصصات، الفروع والأيام، الخدمات، احجز مع الدكتور | — |
| 4.4 | الفروع + الفرع · `W-06` | `/branches` · `/branches/[slug]` | الخريطة (Google Maps embed) · العنوان والمواعيد · تليفون وواتساب · الخدمات · الأطباء · الصور · الاتجاهات | — |
| 4.5 | البرامج + Secret Seven · `W-09` | `/programs` · `/programs/[slug]` | المراحل السبعة · بتاخد إيه في كل مرحلة · مناسب لمين · FAQ · CTA (من غير وعود طبية مبالغ فيها) | — |
| 4.6 | عن Oxygen · `W-02` | `/about` | القصة · الرسالة والقيم · الأرقام · صور الأماكن (2.6) · CTA | — |
| 4.7 | تواصل · `W-14` | `/contact` | التليفونات · الواتساب · الفروع باختصار · فورم ← `useCreateLeadMutation` | `form` |
| 4.8 | المقالات · `W-13` | `/learn` · `/learn/[slug]` | فلتر بالتخصص · كروت · صفحة المقال (Markdown بـ`react-markdown`) · مقالات مرتبطة · CTA | — |
| 4.9 | العروض (Template واحد) · `W-12` | `/offers/[slug]` | Hero العرض · المزايا · السعر قبل وبعد · فورم Lead · FAQ · الشروط | — |
| 4.10 | الاستشارة الأونلاين · `W-08` | `/online-consultation` | بتشتغل إزاي (3 خطوات) · التخصصات المتاحة · السعر · المطلوب · FAQ · احجز أونلاين | — |
| 4.11 | البرامج الرقمية · `W-10` | `/digital` · `/digital/[slug]` | الـ4 منتجات (صور 2.4) · المزايا · فورم "سجّل اهتمامك" (Lead) | — |
| 4.12 | تحميل التطبيق · `W-15` | `/app` | المزايا · صورة 2.7 · بادجات المتاجر "قريبًا" | — |
| 4.13 | الصفحات القانونية · `W-18` | `privacy` · `terms` · `refund-policy` · `medical-disclaimer` · `delete-account` | Template واحد للنص + فورم طلب حذف الحساب | — |

> **Membership (`W-11`)** في Phase 2، فمش هتتعمل دلوقتي.

### ✅ آخر المرحلة 4

كل الصفحات شغالة عربي وإنجليزي، Responsive، ومفيش لينك بيودّي لصفحة مش موجودة.

---

## المرحلة 5 — الحجز + الدفع + الدخول (شكل)

### 5.1 الحجز · `W-07` · `/book`

- `book/page.tsx` (Server) بيجيب التخصصات والخدمات والفروع والأطباء من `src/api/public` ويبعتهم للـWizard.
- **حالة الـWizard في الـURL:** `?service=&branch=&doctor=&slot=`. كده الـRefresh وزرار الرجوع بيشتغلوا، واللينك ينفع يتبعت.
- **الخطوات:**
  1. الخدمة
  2. الفرع
  3. الطبيب ("أي طبيب متاح") + الميعاد: شريط الأيام + المواعيد مقسّمة صباحًا / ظهرًا / مساءً. الـ`SlotPicker` في `components/shared` لأن البورتال هيستخدمه في التأجيل.
  4. بياناتك + OTP (الكود الوهمي `123456`) من `auth.api.ts`.
  5. التأكيد أو الدفع.
- **كارت الملخص** ثابت جنب الخطوات (تحتها على الموبايل).
- `book/_api/booking.api.ts`: `getSlots` · `createBooking` (+ الـMocks بتاعتهم في `mocks/handlers.ts`).
- shadcn: `radio-group` · `calendar` · `popover` · `input-otp` · `progress`.

### 5.2 الدفع · `W-16` · `/checkout`

- ملخص الطلب · كود خصم (الكود الوهمي `OXY10`) · "ادفع".
- بنقلّد التحويل لصفحة الدفع ← `/checkout/success` أو `/checkout/failed` (صور 2.10).
- صفحة النجاح: تفاصيل الحجز · "ضيف للتقويم" · تحميل التطبيق.

### 5.3 الدخول · `W-17` · `/login`

- رقم الموبايل (مصري، بـ`libphonenumber-js`) ← OTP (`123456`) ← البورتال.
- عداد "ابعت الكود تاني".

---

## المرحلة 6 — بوابة المريض (شكل) · `/portal`

- `portal/layout.tsx`: Sidebar على الديسكتوب + Bottom nav على الموبايل + Guard وهمي (لو مش داخل ← `/login`).
- `portal/_api/`: ملف لكل Resource (`appointments.api.ts` · `documents.api.ts` …)، مشترك بين صفحات البورتال.

| # | الصفحة | المحتوى | shadcn زيادة |
|---|---|---|---|
| 6.1 | الملخص · `PP-01` | الموعد الجاي · مرحلة البرنامج · الجلسات المتبقية · آخر الملفات | — |
| 6.2 | المواعيد · `PP-02` | الجاية / السابقة · تأجيل بالـ`SlotPicker` · إلغاء بـDialog وسياسة الإلغاء | — |
| 6.3 | الـPassport · `PP-03` | Timeline بفلاتر · رسوم الوزن والقياسات | `chart` |
| 6.4 | الملفات · `PP-04` | قايمة · معاينة · رفع (شكل) | — |
| 6.5 | الخطط · `PP-05` | خطة لكل تخصص · قايمة التمارين بالفيديو | — |
| 6.6 | الباقات · `PP-06` | الجلسات المتبقية (Progress) · تاريخ الانتهاء | — |
| 6.7 | الفواتير · `PP-07` | جدول · حالة كل فاتورة · تحميل PDF (شكل) | `table` |
| 6.8 | البروفايل والخصوصية · `PP-08` | تعديل البيانات · الموافقات · تصدير البيانات · حذف الحساب | `switch` |

> كل صفحة فيها الـ4 حالات: **Loading** (Skeleton) · **Empty** (`EmptyState` + صور 2.10) · **Error** · الداتا.

---

## المرحلة 7 — SEO + الأداء + المراجعة النهائية

### 7.1 SEO

- `generateMetadata` لكل صفحة بالعربي والإنجليزي + `alternates.languages` (hreflang).
- `app/sitemap.ts` (كل الصفحات بالغتين وكل الـslugs) + `app/robots.ts`.
- JSON-LD: `MedicalClinic` في الرئيسية والفروع، و`Physician` في صفحات الأطباء.
- صورة OG لكل صفحة.
- `noindex` على: `/portal` · `/login` · `/checkout`.

### 7.2 الأداء (هدف Lighthouse موبايل 90 أو أكتر)

- `next/image` لكل الصور، و`priority` لصورة الـHero بس.
- `'use client'` على الحاجات التفاعلية بس.
- الخطوط من `next/font` بس.

### 7.3 Accessibility

- عنوان `h1` واحد في كل صفحة، والعناوين بالترتيب.
- `label` لكل Input، و`alt` لكل صورة.
- الصفحة تتمشي بالكيبورد، والـFocus باين.
- تباين الألوان مقبول (خصوصًا النص على Mint).

### 7.4 الصفحات الخاصة

- `[locale]/not-found.tsx` + `[locale]/[...rest]/page.tsx` بيعمل `notFound()` (404 مترجمة).
- `error.tsx` و`loading.tsx` للصفحات اللي محتاجاها.

### 7.5 Demo

- لينك Preview (مثلًا Vercel على حساب Oxygen) بيتبعت لـOxygen آخر كل أسبوع.

---

## لما الـAPI يجهز

1. `NEXT_PUBLIC_API_MOCKING=disabled` + `NEXT_PUBLIC_API_URL` الحقيقي.
2. الـFunctions اللي في `src/api/public` تتحول لـ`fetch` مع `revalidate`.
3. امسح فولدر `src/mocks` كله.

> **محتاج من مبرمج الباك:** ملف `openapi.yaml` + لينك الـStaging.

---

## قواعد الكود

موجودة في [17 §9](17-project-structure.md): مكان واحد لكل حاجة، والـRTL، والألوان، وMotion، والتسمية.

### كل خطوة تعتبر خلصت لما

- [ ] عربي وإنجليزي، والـRTL مظبوط (الأسهم بتتقلب)
- [ ] Responsive من 360px لحد الديسكتوب
- [ ] مفيش نص ولا لون مكتوب جوه Component
- [ ] الـComponents المشتركة مستخدمة، ومفيش حاجة متنسخة
- [ ] حالات Loading / Empty / Error (في الصفحات اللي فيها RTK Query)
- [ ] الصور بـ`next/image` ولها `alt`
- [ ] الـMetadata بالغتين
- [ ] `pnpm lint` و`pnpm build` من غير Errors
- [ ] **اتسجلت:** خطوة في [18](18-dev-log.md) · أي قرار في [19](19-decisions.md) · أي ملف أو فولدر جديد في [17](17-project-structure.md) · الحالة هنا ✅
- [ ] Commit
