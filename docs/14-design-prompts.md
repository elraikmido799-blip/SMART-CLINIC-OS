# 14 — برومبتات ChatGPT للتصميم (Design Prompts)

> **الهدف:** صور تصميم نمشي عليها (الشكل والـLayout) قبل ما نبني الشاشات.
> **الصور اللي بتختارها بتتحفظ في فولدر `design/` جوه المشروع، وClaude بيقراها ويبني الشاشات عليها.**
> البرومبتات بالإنجليزي عشان النتايج بتطلع أدق، والنص جوه الصور بيطلع أصح.

---

## الجلسات

| الجلسة | لإيه | إمتى |
|---|---|---|
| **A** | الموقع + بوابة المريض (شكل shadcn + Tailwind) | دلوقتي |
| **B** | داشبورد الموظفين (شكل antd) | دلوقتي |
| **C** | صور الناس والعيادة اللي هتتحط جوه الموقع | بعد ما تختار الشكل — [16 المرحلة 2](16-website-plan.md) |
| **D** | تطبيق الموبايل | في الآخر (بعد الويب) |

**الطريقة:**
1. **جلسة A (الموقع) الأول.** جلسة B (الداشبورد) بعد ما صور الموقع تخلص.
2. **محادثة جديدة في ChatGPT لكل جلسة** (الموديل اللي بيعمل صور).
3. **كل برومبت = صورة واحدة.** ابدأ بأول برومبت (A0 أو B0)، وبعده الباقي بالترتيب، في نفس المحادثة عشان الستايل يفضل ثابت.
4. **كل صورة بتتراجع مع Claude قبل اللي بعدها** (الألوان، الـLayout ينفع يتعكس عربي، ينفع يتبني بالمكتبة، الوضوح). يا نكمل، يا نصلّحها ببرومبت تعديل.
5. اللي يتقبل يتحفظ في `design/` بالأسامي اللي في آخر الملف، ويتسجل في [سجل المراجعة](#review).
6. **أي صورة جوه صورة مقبولة بتطلع ملف لوحدها** ([DEC-21](19-decisions.md#dec-21)). Claude بيطلّع "قائمة الصور" بتاعتها في [سجل الصور](#assets)، وكل عنصر جنبه هييجي منين: ChatGPT ببرومبت لوحده · SVG بالكود · أيقونة Lucide · صورة حقيقية.
7. **إنت المصمم:** الهوية اللي بتطلع هنا (اللوجو، الألوان، شكل الـComponents) **نهائية** ([DEC-20](19-decisions.md#dec-20)). أما الـLayout والنصوص اللي جوه صور الصفحات، فدي مرجع بيتبني بالكود، والنصوص الصح من ملفات الترجمة.

---

## الهوية (نفس `packages/config/src/tokens.ts`)

> ⏳ **الهوية بتتغير** ([DEC-22](19-decisions.md#dec-22)): الألوان والخطوط الجديدة في برومبت A0 تحت. الجدول ده و`tokens.ts` لسه بالهوية القديمة، وهيتحدثوا لما صورة A0 v2 تتقبل.
> ومعاهم كل البرومبتات اللي بعد A0 (A1 → A8 · B · D)، لأنها لسه مكتوبة بالألوان القديمة والفقاعات.

| العنصر | القيمة |
|---|---|
| Primary — Oxygen Teal | `#0E8C7F` |
| النص (Deep Ink) · النص الثانوي | `#0B2E2B` · `#5E7A76` |
| Mint (خلفيات ناعمة) | `#E6F4F1` |
| خلفية الصفحة · الكروت · الحدود | `#F7FAF9` · `#FFFFFF` · `#DCE8E5` |
| Accent — Coral (الزرار الأهم بس) | `#FF7A59` |
| الحالات | Success `#16A34A` · Warning `#F59E0B` · Danger `#E5484D` · Info `#3B82F6` |
| التخصصات | Nutrition `#65A30D` · Physio `#3B82F6` · Derm `#E66A8D` · Internal Medicine `#7C5CFC` |
| الخطوط | Inter (إنجليزي) + IBM Plex Sans Arabic (عربي) |
| الشكل | زوايا 12px، ظلال خفيفة، مساحات بيضا كتير، أيقونات خطية رفيعة، "فقاعات أكسجين" خفيفة في الخلفيات |

> لو اللون اتغيّر في `tokens.ts`، غيّره هنا كمان عشان الصور الجاية تطلع بنفس الألوان.

---

## A — الموقع (محادثة جديدة)

### A0 · الهوية + اللغة البصرية (v2: فكرة «النَّفَس»)

> - **شات جديد** (مش شات النسخة الأولى، عشان ميتأثرش بيها).
> - النسخة الأولى (v1) اتستبدلت لأنها كانت شكل UI Kit جاهز. السبب في [سجل المراجعة](#review)، والقرار في [DEC-22](19-decisions.md#dec-22).
> - **الفكرة:** خط واحد هادي زي النَّفَس بيلف ويعمل حرف O. الخط ده هو اللوجو، وهو نفسه اللي بيمشي في الموقع: بيحضن الصور، وبيوصل خطوات الحجز، وبيرسم أيقونة كل تخصص.
> - **الألوان اللي في البرومبت كلها بتعدي WCAG AA** (اتحسبت بالكود): التيل مع الأبيض 5.2 · Ember مع الأبيض 4.7 · ألوان التخصصات مع الأبيض من 5.1 لـ6.5.

```text
You are a creative director with 10+ years of experience building healthcare and wellness brands. Create an ORIGINAL, ownable visual identity for "Oxygen Clinics" — a premium multi-specialty clinic group in Egypt (Nutrition, Physiotherapy, Dermatology, Internal Medicine) that also sells online health programs. Arabic is the main language (right-to-left), English is second.

It must NOT look like a UI kit or a template. Avoid every healthcare cliché: no bubbles, leaves, lungs, hearts, pulse lines, medical crosses, stethoscope logos or DNA; no Dribbble-style component sheets, no glassmorphism, no purple-blue AI gradients, no star ratings, no stock-photo clichés. Do not copy or imitate any existing brand, website or template.

CONCEPT — "Breath": oxygen is the breath that gives life. The brand is built on ONE continuous, calm line — like a slow breath — that loops once into an open "O" and then trails off softly. This single gesture is both the logo symbol and the visual system: the same line flows through layouts, frames photos, connects steps, and draws the simple one-line illustration of each specialty. Calm, warm, human, premium — never cold or hospital-like.

PALETTE (use exactly — every text/background pair passes WCAG AA):
- Oxygen Teal #0B7A6F — brand color and primary buttons (white text)
- Deep Ink #0B2E2B — headings and text · Muted text #5A6B66
- Linen #FAF7F2 — warm page background · White #FFFFFF — cards · Hairline #E7E1D7 — borders
- Breath Mist #E3F2EE — soft tinted surfaces and the airy light in backgrounds
- Ember #C94A2C — ONLY for the single most important action (booking), white text
- Specialty colors: Nutrition #4F7A28 · Physiotherapy #1F6FB2 · Dermatology #B8466A · Internal Medicine #5B4BC4

TYPOGRAPHY: editorial and expressive, with strong scale contrast — a soft, warm serif for English headlines (in the spirit of Fraunces), an elegant modern Arabic display face for Arabic headlines, and a highly legible sans for body text in both scripts (in the spirit of IBM Plex Sans Arabic). Arabic text must be correct, fully connected and right-to-left.

UX RULES: clear hierarchy, one primary action per area, touch targets of at least 44px, generous spacing on an 8px grid, layouts that mirror cleanly for RTL, and everything buildable with Tailwind CSS + shadcn/ui (soft 16–24px radii, hairline borders, very soft shadows).

Now create ONE image — a BRAND & VISUAL LANGUAGE BOARD (landscape 3:2), art-directed like a top agency presentation: few elements, shown big and confident, with lots of breathing space:
1. The logo, large on Linen: the breath-line symbol + "Oxygen" wordmark + "Clinics". Beside it, the symbol alone as an app icon on Oxygen Teal.
2. A hero moment in Arabic: the headline "نَفَس جديد لصحتك", the English subline "Better Health. More Life.", the breath line flowing behind the text, one Ember button "احجز موعدك" and one secondary button "اكتشف التخصصات".
3. The palette as tall elegant swatches with names and hex codes.
4. A type specimen: one huge headline in each script, plus a short body paragraph.
5. Three signature components in this style: a doctor card (photo framed by the breath line, name, specialty, years of experience, a "Book" button — no stars, no heart icon); four specialty tiles, each with its one-line illustration in its specialty color; and a 3-step booking progress where the line connects the steps.

Flat high-fidelity design, crisp correctly spelled text, realistic content, no lorem ipsum, no device frames.
```

### L1 → L6 · الصور اللي بتطلع من A0 (في نفس المحادثة، بعد A0 وقبل A1)

> ⏸ **متوقفة لحد ما A0 v2 تتقبل:** البرومبتات دي مكتوبة على لوجو v1 (الفقاعات)، وهتتعدل على اللوجو الجديد.

> - **في نفس شات A0.** لو شات جديد: ارفع صورة A0 مع أول برومبت.
> - كل برومبت بيطلّع ملف واحد بخلفية شفافة. لو ChatGPT طلّع أي خلفية، Claude بيشيلها.
> - جملة "Better Health. More Life." **مش** جوه ملف اللوجو: بتتكتب نص في الموقع عشان تتترجم.
> - **تفاصيل اللوجو في A0** (اتأكدنا بتكبير الصورة): **4 فقاعات** تيل فوق آخر الكلمة، والخط اللي في نص حرف الـ**E** لونه تيل. وأيقونة التطبيق فيها **3 دواير** بيضا.

**L1 · اللوجو الكامل** → `design/brand/logo-full.png`

```text
From the design system board above, extract ONLY the OXYGEN logo and recreate it as a standalone logo file. Copy it exactly — do not redesign anything:
- The "OXYGEN" wordmark in Deep Ink #0B2E2B, keeping the teal #0E8C7F middle bar of the "E".
- The four Oxygen Teal #0E8C7F bubbles above the end of the word — same sizes, same positions.
- "CLINICS" underneath, same color and same wide letter spacing.
- Do NOT include the tagline "Better Health. More Life.", no other elements, no shadow, no texture.
- Transparent background, centered, even padding. Landscape 3:2, high resolution, flat solid colors, perfectly sharp edges.
```

**L2 · اللوجو أبيض** (للخلفيات التيل والغامقة) → `design/brand/logo-white.png`

```text
The exact same logo, identical shapes and layout, but every part (wordmark, bubbles, "CLINICS") in solid white #FFFFFF on a transparent background — for teal and dark backgrounds. Nothing else in the image. Landscape 3:2, high resolution, sharp edges.
```

**L3 · الرمز بس** (الـFavicon والأماكن الصغيرة) → `design/brand/logo-symbol.png`

```text
Only the logo symbol: the four Oxygen Teal #0E8C7F bubbles exactly as they appear in the logo — same sizes, same positions — with no text. Centered on a transparent background with even padding. Square 1:1, flat, high resolution, sharp edges. Nothing else in the image.
```

**L4 · أيقونة التطبيق** → `design/brand/app-icon.png`

```text
From the board above, extract ONLY the App Icon and recreate it exactly as a standalone file: an Oxygen Teal #0E8C7F rounded square with three white circles — a large one lower-left of center, a medium one at the upper right, and a small one on the right between them. Square 1:1, high resolution, the rounded square filling the canvas, transparent outside the rounded corners. No shadow, no label, no text, nothing else.
```

**L5 · الصورة الافتراضية للطبيب** (لأي دكتور لسه ملوش صورة حقيقية) → `design/brand/doctor-avatar.png`

```text
Create a DEFAULT DOCTOR AVATAR for doctors who don't have a photo yet: a minimal, friendly, non-realistic illustration — a simple head-and-shoulders silhouette in a white coat with a small stethoscope, no facial features, on a soft mint (#E6F4F1) circle, with Oxygen Teal (#0E8C7F) and Deep Ink (#0B2E2B) accents. Flat style, square 1:1, centered, transparent background outside the circle, no text. It must clearly read as a placeholder avatar, not a real person.
```

**L6 · الشخصية: صورة الدكتورة اللي في كارت الطبيب** (للتطوير والـMocks بس) → `design/mocks/doctor-sample.png`

> على الموقع الحقيقي كل دكتور بصورته الحقيقية، والصورة دي مش بتتحط فيه ([DEC-21](19-decisions.md#dec-21)).

```text
From the doctor card on the board above, extract ONLY the doctor's photo and recreate it as a standalone portrait photo: the same woman doctor — same face, hair, smile and pose — wearing a white coat with a stethoscope. Head and shoulders, centered, on a plain soft light background #F7FAF9. Photorealistic, natural skin, soft daylight. Square 1:1, high resolution. No card, no frame, no text, no icons, nothing else.
```

### A1 · الصفحة الرئيسية — النص الأول · `W-01`

```text
Same design system. Design the WEBSITE HOME PAGE — TOP HALF (desktop, landscape 3:2, no browser frame).
1. Sticky top navigation: "OXYGEN" logo; links "Specialties", "Programs", "Digital", "Doctors", "Branches", "Learn"; language switch "عربي"; buttons "Patient Login" (outline) and "Book Now" (coral).
2. Hero: headline "Your health journey, connected."; subheadline "Nutrition, Physiotherapy, Dermatology and Internal Medicine — in clinic and online, in one place."; buttons "Book an Appointment" (coral) and "Explore Programs" (outline). Visual side: a warm natural photo of a clinician talking with a patient, soft mint bubbles, and two small floating cards: "Next appointment · Tue 5:00 PM" and a tiny weight-progress line chart.
3. Trust bar: "4 Specialties · 3 Branches · 20+ Specialists · 10,000+ Patients".
4. Specialties: 4 cards in a row (Nutrition, Physiotherapy, Dermatology, Internal Medicine), each with a line icon tinted with its specialty color, a one-line description and "Learn more →".
Airy layout, lots of white space, a soft mint band behind the specialties.
```

### A2 · الصفحة الرئيسية — النص التاني · `W-01`

```text
Same design system, same page. Design the HOME PAGE — BOTTOM HALF (desktop, landscape 3:2).
1. Signature program "Secret Seven": a horizontal 7-step journey — Assessment → Plan → Treatment → Follow-up → Progress → Stabilization → Maintenance — with small numbered circles and the button "Start your journey".
2. Online programs: 4 cards — "Online Nutrition", "Physio Home", "Derm Follow-up", "Chronic Care" — each with 3 short features and "From EGP 499 / month".
3. Our doctors: 4 doctor cards (portrait photo, name, specialty chip, "Book").
4. Branches: a map on one side and 3 branch cards ("New Cairo", "Sheikh Zayed", "Maadi") with opening hours and "Directions".
5. App promo band: a phone mockup with "Your Health Passport in your pocket" and App Store / Google Play badges marked "Coming soon".
6. Footer: logo, a short about line, link columns (Clinic, Programs, Help), legal links and a WhatsApp button.
```

### A3 · الرئيسية على الموبايل · `W-01`

```text
Same design system. Design the HOME PAGE as MOBILE WEB: 3 phone screens side by side on a light mint landscape canvas (3:2), modern iPhone proportions, flat front view.
Screen 1: compact top bar (logo, coral "Book" button, menu icon), the hero with headline, subheadline and two stacked buttons, then the trust numbers in a 2×2 grid.
Screen 2: the specialties as a 2×2 grid of cards, then the Secret Seven journey as a vertical stepper.
Screen 3: the open menu drawer (links, language switch "عربي", "Patient Login", "Book Now") and a floating round WhatsApp button in the bottom corner.
```

### A4 · صفحة تخصص (العلاج الطبيعي) · `W-03`

```text
Same design system. Design a SPECIALTY PAGE for "Physiotherapy" (desktop, landscape 3:2).
- Breadcrumb "Home / Specialties / Physiotherapy".
- Hero with a soft blue (#3B82F6) tint: title "Physiotherapy", promise "Move better, recover faster — with a plan made for you.", buttons "Book an assessment" (coral) and "Talk on WhatsApp" (outline), and a calm photo of a physiotherapist guiding a knee exercise.
- "What we treat": 6 small cards with icons (Back & neck pain, Sports injuries, Post-surgery rehab, Knee & joint pain, Posture, Neurological rehab).
- "Services": a clean list of 3 services with duration and starting price (e.g. "Initial Assessment · 60 min · from EGP 600").
- "Our physiotherapists": 3 doctor cards.
- A related program card "Physio Home — online exercise program".
- An FAQ accordion (4 questions) and a final booking banner.
```

### A5 · الأطباء + بروفايل الطبيب · `W-05`

```text
Same design system. Two panels side by side (desktop, landscape 3:2):
Left — DOCTORS LIST: title "Our doctors & specialists", filter chips (All, Nutrition, Physiotherapy, Dermatology, Internal Medicine) and a branch dropdown, then a grid of 6 doctor cards (photo, name, title, specialty chip, branches, "Book").
Right — DOCTOR PROFILE: large photo, name "Dr. Omar Hassan", title "Consultant Physiotherapist", specialty chip, short bio, "Available at" (branch + days), services list, and a sticky booking card "Book with Dr. Omar" showing the next available slots.
```

### A6 · الحجز · `W-07`

```text
Same design system. Design the BOOKING PAGE (desktop, landscape 3:2).
Top: a 5-step progress bar "1 Service · 2 Branch · 3 Doctor & Time · 4 Your Details · 5 Confirm & Pay" with step 3 active.
Main: a toggle "Any available doctor / Choose a doctor"; 3 doctor cards with photo and name; a week date strip with the selected day highlighted; time slots grouped Morning / Afternoon / Evening, some disabled, one selected "5:30 PM" in teal.
Side: a sticky summary card — "Physiotherapy · Initial Assessment (60 min)", "Oxygen New Cairo", "EGP 600", note "Free cancellation up to 24 hours before".
Bottom: buttons "Back" and "Continue" (coral) and a small lock line "Secure booking · Your data is protected".
```

### A7 · بوابة المريض · `PP-01`

```text
Same design system. Design the PATIENT PORTAL home (desktop, landscape 3:2) — the patient's private area on the website.
Left sidebar: "OXYGEN" logo; items Overview (active), Appointments, Health Passport, Documents, Plans, Packages, Invoices, Profile; at the bottom "Need help? WhatsApp".
Main: greeting "Good evening, Sara"; next appointment card (Physiotherapy session · Tue 5:00 PM · Oxygen New Cairo · Dr. Omar Hassan · buttons "Reschedule" and "Directions"); program card "Secret Seven — Stage 3 of 7: Treatment" with a step progress bar; package card "Physio Package — 7 of 12 sessions left · expires 30 Nov"; a 12-week weight chart (92 → 84 kg, goal line at 80 kg); recent documents (CBC lab report, Knee X-ray, Nutrition plan PDF).
Calm, private and easy for all ages: large readable text.
```

### A8 · نسخة عربي (RTL) من أي شاشة

```text
Recreate the previous screen in ARABIC with a full right-to-left (RTL) layout: mirror the whole layout (navigation order, sidebar on the right, directional icons, progress from right to left). Use the IBM Plex Sans Arabic font, keep the same colors and components, and keep numbers in Western digits (1, 2, 3). Use these exact Arabic texts: [PASTE ARABIC TEXTS HERE]. Make sure Arabic letters are connected and correctly shaped.
```

نصوص الصفحة الرئيسية (الصقها مكان `[PASTE ARABIC TEXTS HERE]`):

```text
"التخصصات" · "البرامج" · "ديجيتال" · "الأطباء" · "الفروع" · "تعلّم" · "English" · "دخول المريض" · "احجز الآن" · "رحلتك الصحية، متوصّلة ببعضها" · "تغذية، علاج طبيعي، جلدية، وباطنة — في العيادة وأونلاين، في مكان واحد." · "احجز موعد" · "اكتشف البرامج" · "4 تخصصات · 3 فروع · +20 أخصائي · +10,000 مريض" · "التغذية" · "العلاج الطبيعي" · "الجلدية" · "الباطنة" · "اعرف أكتر"
```

> موديلات الصور ممكن تغلط في الحروف العربي. خد من الصورة الـLayout، والنصوص الصح هتتكتب في الكود.

---

## B — الداشبورد (محادثة جديدة)

### B0 · الستايل + شاشة الدخول · `D-01`

```text
You are a senior product designer. We are designing the STAFF DASHBOARD of "Oxygen Smart Clinic OS" for Oxygen Clinics (a multi-branch clinic group in Egypt: Nutrition, Physiotherapy, Dermatology, Internal Medicine). Reception, doctors, the CRM team, branch managers and the CEO use it all day.

Originality: an original design — do not copy any existing product, template or Dribbble shot.

It is built with Ant Design (antd) components and layout patterns, themed with the Oxygen tokens:
- Primary teal #0E8C7F · text #0B2E2B · secondary text #5E7A76 · layout background #F7FAF9 · cards #FFFFFF · borders #DCE8E5 · soft mint #E6F4F1
- Status: success #16A34A · warning #F59E0B · danger #E5484D · info #3B82F6
- Specialty colors: Nutrition #65A30D · Physiotherapy #3B82F6 · Dermatology #E66A8D · Internal Medicine #7C5CFC
- Corner radius 12px, Inter font, outlined icons
Feeling: calm, fast and clear for long working hours — data-rich but never cluttered.

Common layout for every screen after login: left sidebar (Home, Calendar, Front Desk, Patients, Clinical, Programs, CRM, Billing, Dashboards, Reports, Settings); top bar with a branch selector "Oxygen New Cairo", a global search "Search patient by name, phone or file no.", a notifications bell and the user avatar with role.

For every image: desktop web app, landscape 3:2, flat high-fidelity UI, no device frame, crisp legible correctly spelled English text, realistic data.

Now create image 1 — LOGIN: a split screen. Left: a calm teal brand panel with the "OXYGEN" wordmark, soft bubbles and the line "Staff portal". Right: the sign-in card (email, password, "Sign in" button) and next to it the second step "Two-factor verification" with a 6-digit code input.
```

### B1 · الريسبشن (الكالندر وشاشة اليوم) · `D-02` `D-03`

```text
Same dashboard style and layout. Design the RECEPTION screen.
Header strip: "Today: 48 appointments · 31 checked-in · 2 no-shows · EGP 18,400 collected".
Main: a calendar day view with one column per practitioner (Dr. Omar — Physio, Dr. Mona — Nutrition, Dr. Laila — Dermatology, Dr. Karim — Internal Medicine), rows from 9:00 AM to 9:00 PM, appointment blocks tinted by specialty with status tags (Confirmed, Checked-in, In progress, Completed, No-show) and a red current-time line.
Right panel "Arriving now": 3 patient cards with "Check-in" buttons, one showing "Balance due EGP 300 — Collect"; quick actions "New patient", "New booking", "Collect payment".
```

### B2 · ملف المريض (Patient 360) · `D-09`

```text
Same dashboard style and layout. Design the PATIENT 360 screen.
Header card: photo placeholder, "Sara Ahmed · 34 y · File OXY-000123 · +20 10 •••• 4821 · Oxygen New Cairo", tag "Secret Seven — Stage 3", alert chips "Allergy: Penicillin" (red), "7 sessions left" (teal), "Balance EGP 0"; actions "Start encounter", "Book", "Collect payment".
Tabs: Overview · Timeline · Encounters · Measurements · Plans · Documents & Photos · Programs · Billing · CRM · Consents · Access log — Overview selected.
Overview grid: a 12-week weight trend chart, latest vitals (BP 118/76, HR 72, BMI 29.1), active plans (Nutrition plan, Physio treatment plan + home exercises), upcoming appointments, recent documents, and a journey milestones row (Lead → Booked → Visited → Assessment → Program → Paid → Treatment) with dates and check marks.
```

### B3 · شاشة الكشف (Physio) · `D-11` `D-13`

```text
Same dashboard style and layout. Design the CLINICAL ENCOUNTER screen for a physiotherapist.
Left column — patient summary: name, age, diagnosis "Post-op ACL reconstruction — right knee", referral, number of previous sessions.
Center — form "Physiotherapy — Initial Assessment": pain (0–10 slider at 6 and a body map with the right knee marked), range of motion table (Knee flexion 95°, Extension −5°, normal values in grey), strength (manual muscle testing grades), functional assessment (checkboxes and scores), clinical notes.
Right panel — "Plan": treatment goals, sessions-per-week stepper, and a "Home Exercise Program" builder with 3 exercises (thumbnails, sets/reps fields) and "Add from library".
Footer bar: toggle "Share with patient" ON, buttons "Save draft" and "Sign & Close" (teal).
```

### B4 · الـCRM · `D-20` `D-21`

```text
Same dashboard style and layout. Design the CRM PIPELINE screen.
Top: title "Leads pipeline", filters (Branch, Source, Campaign, Agent, Date), button "+ New lead", KPI chips "126 new this week · 62% contacted within SLA · 18% booked".
Kanban board with horizontally scrolling columns: Lead (24), Contacted (18), Qualified (11), Booked (9), Visited (7), Assessment (5), Program (4), Paid (4).
Lead cards: name, masked phone, source icon (Facebook, Instagram, TikTok, Website, WhatsApp, Walk-in), campaign tag "Summer Weight Loss", interest "Nutrition", assigned agent avatar, SLA timer chip ("12 min" green, "2 h" red).
A right drawer is open for one lead: activity timeline (Call — no answer, WhatsApp template sent, Call — interested) and buttons "Log call", "Send WhatsApp", "Book appointment", "Mark lost".
```

### B5 · داشبورد الـCEO · `D-28`

```text
Same dashboard style and layout. Design the CEO EXECUTIVE DASHBOARD — data-rich but calm and readable.
Top: title "Executive Dashboard", date range "Today", branch filter "All branches", toggle "Compare branches".
Row 1 — 7 KPI cards with small trend arrows: Patients 142, New patients 23, New leads 61, Appointments 168, No-shows 9 (5.4%), Revenue EGP 186,500, Packages sold 17.
Row 2 — revenue trend (line chart, last 30 days, cash vs earned) and branch comparison (horizontal bars for New Cairo, Sheikh Zayed, Maadi: revenue, patients, conversion).
Row 3 — CRM funnel (Leads → Booked → Visited → Paid with percentages) and leads by source (donut: Facebook, Instagram, TikTok, Website, WhatsApp, Referral, Walk-in).
Use the specialty colors only as accents and keep plenty of white space.
```

### B6 · نسخة عربي (RTL)

استخدم برومبت **A8** نفسه، وحط النصوص دي مكان `[PASTE ARABIC TEXTS HERE]` (شاشة الريسبشن):

```text
"الرئيسية" · "الكالندر" · "الاستقبال" · "المرضى" · "العيادة" · "البرامج" · "CRM" · "الحسابات" · "الداشبوردات" · "التقارير" · "الإعدادات" · "فرع القاهرة الجديدة" · "ابحث عن مريض بالاسم أو الموبايل أو رقم الملف" · "النهارده: 48 موعد · 31 وصلوا · 2 مجوش · 18,400 ج.م اتحصّلت" · "مؤكد" · "وصل" · "مع الطبيب" · "خلص" · "مجاش" · "واصلين دلوقتي" · "تسجيل وصول" · "تحصيل" · "مريض جديد" · "حجز جديد"
```

---

## برومبتات التعديل

| عايز إيه | الصق ده |
|---|---|
| الكلام غلط أو صغير | `Keep everything identical but fix the spelling and make the text larger.` |
| زحمة | `Same screen with more white space, fewer borders and softer shadows.` |
| الستايل اتغيّر | `Keep the exact same style as image 1 of this chat.` |
| الإيدين أو الوشوش مش طبيعية | `Keep everything identical, but make hands and faces look natural.` |
| شكل أفخم | `Make it feel more premium: more white space, fewer borders, softer shadows.` |
| حالة فاضية | `Same screen, but show the empty state (no data yet) with a friendly illustration and a clear next action.` |
| حالة خطأ | `Show the error state (e.g. payment failed) with a clear retry action.` |
| نسخة موبايل | `Same screen as a mobile web version, single column.` |

---

## حفظ الصور

```text
design/
├── brand/       logo-full.png · logo-white.png · logo-symbol.png · app-icon.png · doctor-avatar.png
├── mocks/       doctor-sample.png (للتطوير بس، مش بتتحط في الموقع الحقيقي)
├── website/     A0-design-system-v2.png · W-01-home-top.png · W-01-home-bottom.png · W-01-home-mobile.png
│                W-03-specialty.png · W-05-doctors.png · W-07-booking.png · PP-01-portal.png · W-01-home-ar.png
└── dashboard/   D-01-login.png · D-02-reception.png · D-09-patient-360.png · D-11-encounter.png
                 D-20-crm.png · D-28-executive.png · D-02-reception-ar.png
```

<a id="review"></a>

## سجل المراجعة (كل صورة اتقبلت)

| الصورة | الملف | الحالة | ملاحظات بتتطبق في الكود |
|---|---|---|---|
| A0 v2 · فكرة «النَّفَس» | `design/website/A0-design-system-v2.png` | ⏳ مستنية الصورة | — |
| A0 v1 · Design System | `design/website/A0-design-system.png` | ❌ اتستبدلت بـv2 | <ul><li>**ليه اتستبدلت:** شكلها UI Kit جاهز: لستة Components ثابتة، وألوان Tailwind الجاهزة (`#3B82F6` · `#16A34A` · `#F59E0B` · `#65A30D`)، وInter مع كروت بيضا وزوايا 12px، والفقاعات أول فكرة بتيجي في كلمة "أكسجين"</li><li>**غلطتين UX:** الكلام الأبيض على الكورال contrast بتاعه 2.6، وعلى التيل 4.1 (المطلوب 4.5)</li></ul>الملاحظات اللي تحت دي لسه شغالة، واتحطت جوه برومبت v2: <ul><li>الألوان مطابقة لـ`tokens.ts` حرف بحرف</li><li>**كارت الطبيب:** من غير نجوم وتقييمات (التقييم في Phase 2 ولازم يبقى حقيقي)، ومن غير زرار القلب</li><li>**الـStat Card على الموقع:** الرقم والكلام بس، من غير "↑24% compared to last year"</li><li>الكتابة بخط اليد مش مستخدمة (خطين بس)</li><li>جملة "Better Health. More Life." نص في الموقع، مش جزء من اللوجو</li></ul> |

<a id="assets"></a>

## سجل الصور (Assets): كل صورة جوه التصميم هتيجي منين

**المصادر:**
- **ChatGPT** = برومبت لوحده في الملف ده.
- **SVG (كود)** = Claude بيرسمها بالكود بنفس الشكل.
- **Lucide** = مكتبة الأيقونات المتسطبة.
- **حقيقية** = صورة حقيقية من Oxygen.

**الحالة:** ✅ وصلت واتظبطت · ⏳ مستنية

> ⏸ صفوف A0 هنا على v1. هتتعدل بعد ما A0 v2 تتقبل (مثلًا: الفقاعات هتبقى "خط النَّفَس" SVG بالكود).

| من صورة | العنصر | المصدر | الملف | الحالة |
|---|---|---|---|---|
| A0 | اللوجو الكامل | ChatGPT · L1 | `design/brand/logo-full.png` ← SVG للموقع | ⏳ |
| A0 | اللوجو الأبيض | ChatGPT · L2 | `design/brand/logo-white.png` ← SVG | ⏳ |
| A0 | رمز اللوجو (الفقاعات) | ChatGPT · L3 | `design/brand/logo-symbol.png` ← Favicon | ⏳ |
| A0 | أيقونة التطبيق | ChatGPT · L4 | `design/brand/app-icon.png` | ⏳ |
| A0 | صور الأطباء (الموقع الحقيقي) | **حقيقية** (ممنوع AI) | من Oxygen ([دليل التصوير](16-website-plan.md)) | ⏳ |
| A0 | الصورة الافتراضية للطبيب | ChatGPT · L5 | `design/brand/doctor-avatar.png` | ⏳ |
| A0 | الشخصية: صورة الدكتورة اللي في الكارت (للتطوير بس) | ChatGPT · L6 | `design/mocks/doctor-sample.png` | ⏳ |
| A0 | فقاعات الخلفيات (الـStat Card والكروت) | SVG (كود) | `components/shared/` | ⏳ |
| A0 | أيقونات التخصصات والـNavigation والـInputs | Lucide | — | ✅ متسطبة |

- الأسامي فيها أرقام الشاشات اللي في [05](05-apps-structure.md) (`W-xx` · `PP-xx` · `D-xx`).
- لو عملت أكتر من نسخة لنفس الشاشة: `W-01-home-top-v2.png`، وقول لـClaude أنهي واحدة اخترت.

---

## إضافي (بعدين)

### صفحة البرامج الرقمية والأسعار · `W-10` (Phase 2)

```text
Same design system. Design the DIGITAL PROGRAMS & PRICING page (desktop, landscape 3:2).
Top: headline "Care that continues at home", subheadline "Online programs with your Oxygen specialists".
Billing toggle: "Monthly · Quarterly (save 10%) · Annual (save 20%)" with Quarterly selected.
4 pricing cards in a row:
- "Oxygen Online Nutrition": online assessment, personalized nutrition plan, food diary and macros, weekly follow-up, chat with your dietitian.
- "Oxygen Physio Home" (badge "Most popular"): personalized home exercise program, exercise videos, sets/reps/time, pain and progress tracking, physiotherapist review.
- "Oxygen Derm Follow-up": online follow-up, photo progress tracking, treatment timeline, reminders.
- "Chronic Care": weight, blood pressure and glucose tracking, lab reviews, medication list, alerts.
Each card: price, features with check icons, button "Subscribe".
Below: a wide "Oxygen Membership" banner with benefit icons (discounts on clinic services, free monthly check-in, all digital content) and button "Become a member".
Then an FAQ accordion with 4 questions.
```

### Patient Journey Funnel · `D-30`

```text
Same dashboard style and layout. Design the PATIENT JOURNEY DASHBOARD.
Main visual: a wide horizontal funnel with 9 stages — Lead 1,000 → Booking 420 → Assessment 330 → Program 210 → Treatment 190 → Follow-up 150 → Result 95 → Renewal 70 → Referral 35 — each stage showing count and % of the previous stage, with a red drop-off label between stages (e.g. "−58% lost here").
Below: a table "Where we lose patients" with reasons (No answer, Price, Booked but no-show, Didn't continue after assessment); filters for branch, specialty, program and source; and a cohort chart "Retention by month of first visit".
```

### Digital Business Dashboard · `D-31` (Phase 2)

```text
Same dashboard style and layout. Design the DIGITAL BUSINESS DASHBOARD.
KPI cards: Active subscribers 312, New this month 46, Churn 4.1%, Renewal rate 87%, MRR EGP 152,000, ARR EGP 1.82M.
Charts: MRR growth as a stacked area by product (Online Nutrition, Physio Home, Derm Follow-up, Chronic Care, Membership); revenue by acquisition source (bar); subscribers by billing interval (donut: monthly, quarterly, annual).
Table "Subscriptions at risk": past-due and grace-period patients with "Send reminder" buttons.
```

### Dark Mode للداشبورد

```text
Show the same dashboard screen in DARK MODE: background #0B1716, surfaces #10211F, primary text #E6F4F1, secondary text #8FB3AD, primary color a slightly brighter Oxygen Teal #19A394 for contrast. Keep the exact same layout and components.
```

---

## D — تطبيق الموبايل (في الآخر، بعد الويب)

> ابدأ محادثة جديدة بـ**A0**، وبعدين البرومبتات دي.

### Welcome + OTP + Home · `A-01` `A-02` `A-04`

```text
Same Oxygen design system. Design 3 MOBILE APP SCREENS side by side on a light mint landscape canvas (modern iPhone proportions, flat front view, no hands):
Screen 1 — Welcome: OXYGEN logo, soft bubble illustration, headline "Your health journey, connected", buttons "Get Started" and "I already have an account", language toggle "English | عربي".
Screen 2 — Login with OTP: title "Enter the code", text "We sent a 6-digit code to +20 10 •••• 4821", 6 OTP boxes with 4 filled, "Resend in 0:24", button "Verify".
Screen 3 — Home: greeting "Good morning, Sara"; next appointment card (Physiotherapy session, Tue 5:00 PM, Oxygen New Cairo, Dr. Omar Hassan, buttons "Directions" and "Reschedule"); program card "Secret Seven — Stage 3 of 7: Treatment" with a step progress bar; "Today" checklist (3 home exercises with 1 done, "Log your weight"); package card "Physio Package — 7 of 12 sessions left · expires 30 Nov"; bottom tab bar: Home, Appointments, My Health, My Care, Account.
```

### Booking Flow · `A-06`

```text
Same Oxygen design system. 3 MOBILE SCREENS side by side (booking flow):
Screen 1 — Choose a service: search bar, specialty chips (Nutrition, Physiotherapy, Dermatology, Internal Medicine), list of services with duration and price (e.g. "Nutrition Follow-up · 30 min · EGP 400").
Screen 2 — Pick a time: branch selector "Oxygen New Cairo", row of doctor avatars with an "Any doctor" option, horizontal date strip, time-slot chips with one selected, sticky button "Continue".
Screen 3 — Confirm: summary card (service, doctor, branch, date and time), toggle "Use package session (7 left)" switched ON, price line "EGP 0 — covered by your package", cancellation policy note, button "Confirm Booking", and a success toast "Booked! Reminder set for 24h before".
```

### Health Passport · `A-09` `A-10` `A-12`

```text
Same Oxygen design system. 3 MOBILE SCREENS side by side — "My Health / Health Passport":
Screen 1 — Timeline: vertical timeline grouped by month with colored specialty dots: "Nutrition plan updated", "Physio session 5 completed", "Lab report uploaded — CBC", "Dermatology follow-up", "Package purchased". Filter chips at top: All, Visits, Plans, Labs, Payments.
Screen 2 — Progress: weight line chart over 12 weeks (from 92 kg to 84 kg) with a goal line at 80 kg; body composition cards (Body fat 28% down, Muscle mass 34 kg up, Waist 94 cm down); segmented control "Weight | Body comp | BP | Glucose".
Screen 3 — Documents: list of files with icons and dates — "CBC — Lab report", "Knee X-ray", "Nutrition plan — PDF", "Instructions from Dr. Omar"; button "Add document"; privacy note with a lock icon "Only you and your care team can see these".
```

### Physio Home: برنامج التمارين · `A-14`

```text
Same Oxygen design system. 3 MOBILE SCREENS side by side — "Physio Home" home exercise program:
Screen 1 — Today's program: title "Knee Rehab — Week 3", progress ring "2 of 5 done", list of exercises with thumbnail, name and "3 sets × 12 reps" or "Hold 30 sec", checkmarks on completed ones.
Screen 2 — Exercise player: large video area with a play button (a person doing a straight-leg raise on a mat), exercise name "Straight Leg Raise", counter "Set 2 of 3 · 12 reps", rest timer "Rest 0:45", big button "Mark set done", short note from the physiotherapist.
Screen 3 — After-session check-in: "How did it feel?" pain slider 0–10 (3 selected, green-to-red gradient), difficulty options (Easy / OK / Hard), optional note, button "Send to my physiotherapist", small badge "5-day streak".
```

### Online Nutrition · `A-15` `A-18` (Phase 2)

```text
Same Oxygen design system. 3 MOBILE SCREENS side by side — "Oxygen Online Nutrition":
Screen 1 — Today's plan: meals (Breakfast, Snack, Lunch, Snack, Dinner) with portions and a "Swap" option, water tracker "6 of 8 glasses".
Screen 2 — Food diary: date header, calorie ring "1,240 / 1,600 kcal", macro bars (Protein 82/110 g, Carbs 130/160 g, Fat 38/55 g), logged meals with small food photos, floating button "+ Log food".
Screen 3 — Chat with dietitian: thread with "Dr. Mona — Dietitian", a patient message with a meal photo, the dietitian's reply with a tip, and a card "Weekly check-in: weight 84.2 kg (−0.8)".
```

### الباقات والمدفوعات والإشعارات · `A-20` `A-21` `A-25`

```text
Same Oxygen design system. 3 MOBILE SCREENS side by side:
Screen 1 — My packages & subscriptions: "Physio Package — 7 of 12 sessions left" with progress bar and expiry date; "Oxygen Physio Home — Active, renews 12 Dec, EGP 499/month" with a "Manage" button; "Secret Seven Program — Stage 3/7".
Screen 2 — Payments & invoices: list with invoice numbers, dates, amounts and status chips (Paid, Refunded), a "Pay now" banner for one pending invoice, PDF download icons.
Screen 3 — Notifications grouped Today / Earlier: "Appointment tomorrow at 5:00 PM", "New nutrition plan from Dr. Mona", "Your package is ending — 2 sessions left", "Time for your evening exercises", with icons and unread dots.
```

### أيقونة التطبيق (لو مفيش هوية جاهزة)

```text
Design an APP ICON for the "Oxygen" patient app: a minimal symbol combining a soft bubble with a subtle "O" shape and a gentle upward pulse/leaf curve, Oxygen Teal #0E8C7F and white, rounded-square app icon, flat, no text. Show it in 3 sizes and on a phone home screen.
```
