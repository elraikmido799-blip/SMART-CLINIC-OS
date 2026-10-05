# 00 — كتالوج المتطلبات: البريف حرف بحرف

الملف ده تحويل كامل لـ `Oxygen_Digital_Platform_Brief.pdf` (15 صفحة — 30 بند) لمتطلبات مرقّمة.
كل سطر في البريف بقى له **ID ثابت** عشان نرجع له في الـSRS والـBacklog والاختبارات، ومفيش بند يتنسي.
النص الأصلي زي ما هو (من غير تقسيم أو إضافات): [brief.md](brief.md).

> **إزاي تقرأ الجداول**
> - **النص في البريف** = الكلام زي ما هو مكتوب في الـPDF.
> - **المرحلة** = اقتراحنا: `MVP` (الإطلاق الأول) · `P2` (Digital Business) · `P3` (Scale & Intelligence) · `أساس` = مبدأ بيتطبق من أول يوم.
> - 🔮 = البريف نفسه كاتب عليه **"مستقبلاً"**.
> - ليه كل حاجة في المرحلة دي؟ → [08-roadmap.md](08-roadmap.md)

---

## الرؤية (مقدمة البريف)

> أنا عايز نبني **OXYGEN DIGITAL PLATFORM / OXYGEN SMART CLINIC OS**.
> الفكرة إن Oxygen Clinics تبقى عندها منظومة رقمية كاملة تربط:
> المريض + العيادة + الأطباء + الـNutrition + الـPhysiotherapy + الـDermatology + الـInternal Medicine + الـCRM + الحجز + الدفع + الـFollow-up + الـDigital Services + الـWebsite + الـApp + الـManagement Dashboard
> وكل ده يكون مربوط بقاعدة بيانات ونظام واحد.
> وفي نفس الوقت نبني Digital Health Business حقيقي له خدمات مدفوعة أونلاين.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| VIS-01 | منظومة رقمية كاملة تربط الـ15 عنصر المذكورين | أساس | ده تعريف الـScope كله |
| VIS-02 | كل ده مربوط بقاعدة بيانات ونظام واحد | أساس | Single source of truth — PostgreSQL واحدة + API واحد |
| VIS-03 | Digital Health Business حقيقي له خدمات مدفوعة أونلاين | P2 | الأساس (Catalog + Payments) بيتبني في الـMVP |

---

## §1-A — Oxygen Website

> مش مجرد Website تعريفي. … والـWebsite يكون متصل مباشرة بالـBackend والـCRM والـAppointment System والـPatient Database.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| WEB-01 | تعريف Oxygen | MVP | |
| WEB-02 | الخدمات والتخصصات | MVP | الصفحات بتتولد من الـCatalog نفسه، مش محتوى ثابت |
| WEB-03 | الأطباء والفريق | MVP | من بيانات الـStaff |
| WEB-04 | الفروع | MVP | خريطة + مواعيد + خدمات كل فرع |
| WEB-05 | Booking | MVP | نفس محرك المواعيد بتاع الريسبشن |
| WEB-06 | Online consultation | MVP / P2 | MVP: حجز + دفع + لينك فيديو. P2: فيديو جوه المنصة |
| WEB-07 | Digital programs | P2 | في الـMVP: صفحة تعريف + فورم اهتمام بيعمل Lead |
| WEB-08 | Digital subscriptions | P2 | |
| WEB-09 | Memberships | P2 | |
| WEB-10 | Payment | MVP | |
| WEB-11 | Login للمريض | MVP | OTP على الموبايل |
| WEB-12 | دخول إلى Patient Portal | MVP | |
| WEB-13 | Download App | MVP | |
| WEB-14 | Content / education | MVP / P2 | MVP: مقالات. P2: مربوط بالبرامج والتخصصات |
| WEB-15 | Contact / WhatsApp integration | MVP / P2 | MVP: Click-to-chat مع تتبع المصدر. P2: WhatsApp API في الاتجاهين |
| WEB-16 | Offers / campaigns | MVP | Landing pages + UTM |
| WEB-17 | Forms | MVP | كل فورم بيدخل الـCRM كـLead |
| WEB-18 | إمكانية ربط أي خدمة جديدة مستقبلاً | أساس | أي خدمة/منتج جديد في الـCatalog بيظهر لوحده |
| WEB-19 | متصل مباشرة بالـBackend والـCRM والـAppointment System والـPatient Database | MVP | |

---

## §2 — Oxygen Patient App

> تطبيق واحد للمريض، وليس App منفصل لكل تخصص. المريض يدخل بحسابه ويقدر يشوف كل علاقته مع Oxygen.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| APP-00 | تطبيق واحد للمريض، وليس App منفصل لكل تخصص | أساس | التخصصات بتظهر جوه التطبيق حسب حالة المريض |
| APP-01 | Registration/Login | MVP | |
| APP-02 | Patient profile | MVP | |
| APP-03 | Family profiles 🔮 | P3 | قاعدة البيانات بتفصل "الحساب" عن "المريض" من الـMVP عشان ده يبقى سهل |
| APP-04 | Appointments | MVP | |
| APP-05 | Booking | MVP | |
| APP-06 | Rescheduling/cancellation | MVP | حسب سياسة الإلغاء |
| APP-07 | Payments | MVP | |
| APP-08 | Invoices/receipts | MVP | PDF |
| APP-09 | Subscriptions | P2 | |
| APP-10 | Packages | MVP | |
| APP-11 | Remaining sessions | MVP | |
| APP-12 | Notifications | MVP | |
| APP-13 | Reminders | MVP | |
| APP-14 | Medical documents | MVP | |
| APP-15 | Lab reports | MVP | |
| APP-16 | X-rays / scans | MVP | |
| APP-17 | Prescriptions/instructions حسب ما يسمح به النظام | MVP | كـ"تعليمات/مستند" بيصدره الطبيب. الروشتة الإلكترونية = سؤال قانوني مفتوح |
| APP-18 | Treatment plans | MVP | |
| APP-19 | Progress | MVP | |
| APP-20 | Measurements | MVP | |
| APP-21 | Before/after photos حسب الخدمة والموافقة | P2 | بموافقة (Consent) مسجلة. الصور اللي بيصورها الفريق في العيادة متاحة من MVP |
| APP-22 | Communication | MVP / P2 | MVP: واتساب/اتصال. P2: Secure messaging جوه التطبيق |
| APP-23 | Follow-up | MVP | |

> **قرار التنفيذ: الويب الأول.** في الـMVP المريض بيستخدم الخصائص دي من **الـPatient Portal على الويب**، وتطبيق الموبايل بييجي بعد ما الويب يخلص.
> المرحلة المكتوبة في الجدول = إمتى الخاصية تبقى متاحة للمريض. التفاصيل في [08-roadmap.md](08-roadmap.md).

---

## §3 — Patient Health Passport

> عايز كل مريض يكون عنده: **OXYGEN HEALTH PASSPORT** — يبقى عنده Timeline كامل لتعامله مع Oxygen.
> ويكون المريض شايف الجزء المسموح له يشوفه، والـmedical team يشوف البيانات حسب الـpermissions.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| HP-00 | Timeline كامل لتعامل المريض مع Oxygen | MVP | |
| HP-01 | Visits | MVP | |
| HP-02 | Diagnoses | MVP | اللي الطبيب يختار يظهرها للمريض |
| HP-03 | Assessments | MVP | ملخص للمريض، والتفاصيل للفريق |
| HP-04 | Measurements | MVP | |
| HP-05 | Weight history | MVP | |
| HP-06 | Body composition | MVP | |
| HP-07 | Nutrition plans | MVP | |
| HP-08 | Physiotherapy plans | MVP | |
| HP-09 | Progress | MVP | |
| HP-10 | Uploaded labs/reports | MVP | |
| HP-11 | Treatment history | MVP | |
| HP-12 | Follow-up history | MVP | |
| HP-13 | Appointments | MVP | |
| HP-14 | Packages | MVP | |
| HP-15 | Subscriptions | P2 | |
| HP-16 | المريض شايف الجزء المسموح له يشوفه | MVP | كل عنصر طبي عليه Flag: `patient_visible` |
| HP-17 | الـmedical team يشوف البيانات حسب الـpermissions | MVP | تفاصيل في [06-roles-permissions.md](06-roles-permissions.md) |

---

## §4 — Clinic Management System

> ده الجزء الداخلي … ويكون فيه Role-Based Access. يعني كل شخص يشوف ويعدل فقط الحاجات المسموح له بها.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| IS-01 | Reception | MVP | |
| IS-02 | Doctors | MVP | |
| IS-03 | Nutrition specialists | MVP | |
| IS-04 | Physiotherapists | MVP | |
| IS-05 | Assistants | MVP | |
| IS-06 | Managers | MVP | محتاج تعريف: مدير عمليات على أكتر من فرع؟ |
| IS-07 | Branch managers | MVP | |
| IS-08 | Admin | MVP | |
| IS-09 | Management | MVP | الـCEO / الملاك |
| IS-10 | Role-Based Access — كل شخص يشوف ويعدل فقط المسموح له | MVP | |

---

## §5 — Branch Management

> لازم النظام من البداية يكون Multi-Branch. … وأنا عايز أقدر من الـCEO Dashboard أشوف كل الفروع منفصلة أو كلها مع بعض.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| BR-00 | النظام من البداية Multi-Branch | أساس | `branch_id` في كل جدول بيخص فرع |
| BR-01 | الفروع الحالية/المخططة تدخل كـBranches مستقلة | MVP | |
| BR-02 | إمكانية إضافة أي فرع جديد مستقبلاً | MVP | من الـAdmin بدون كود |
| BR-03 | Staff | MVP | الموظف ممكن يشتغل في أكتر من فرع |
| BR-04 | Doctors | MVP | |
| BR-05 | Rooms | MVP | |
| BR-06 | Services | MVP | سعر ومدة ممكن يختلفوا من فرع لفرع |
| BR-07 | Schedule | MVP | |
| BR-08 | Appointments | MVP | |
| BR-09 | Revenue | MVP | |
| BR-10 | Expenses | P2 | ⚠️ هنا مكتوبة عادي، لكن في §20 مكتوب "Expenses مستقبلاً" — محتاج تأكيد |
| BR-11 | Patients | MVP | المريض بيتبع المنظومة كلها، ومعاه "فرع أساسي" |
| BR-12 | Packages | MVP | |
| BR-13 | Performance | MVP | |
| BR-14 | KPIs | MVP | |
| BR-15 | من الـCEO Dashboard أشوف كل الفروع منفصلة أو كلها مع بعض | MVP | فلتر فرع / كل الفروع / مقارنة |

---

## §6 — Appointment System

> نظام مواعيد كامل. … ويظهر للـReception والطبيب مباشرة. … والنظام يعمل Reminders تلقائية.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| APT-00 | نظام مواعيد كامل | MVP | |
| APT-01 | المريض يحجز من Website | MVP | |
| APT-02 | المريض يحجز من App | MVP | |
| APT-03 | المريض يحجز من Reception | MVP | |
| APT-04 | المريض يحجز من CRM | MVP | الـAgent يحجز من شاشة الـLead |
| APT-05 | WhatsApp/integration 🔮 | P3 | حجز كامل من واتساب (Bot). التذكيرات على واتساب موجودة من MVP |
| APT-06 | يظهر للـReception والطبيب مباشرة | MVP | Real-time بدون Refresh |
| APT-07 | Calendar | MVP | بالطبيب / بالغرفة / بالفرع |
| APT-08 | Doctor availability | MVP | |
| APT-09 | Branch availability | MVP | |
| APT-10 | Room availability | MVP | |
| APT-11 | Service duration | MVP | + وقت تجهيز (Buffer) |
| APT-12 | Booking status | MVP | |
| APT-13 | Confirmed | MVP | |
| APT-14 | Cancelled | MVP | |
| APT-15 | Rescheduled | MVP | |
| APT-16 | Completed | MVP | |
| APT-17 | No-show | MVP | |
| APT-18 | Waiting list 🔮 | P2 | |
| APT-19 | Reminders تلقائية | MVP | مثلاً قبلها بـ24 ساعة وساعتين |

> ملاحظة: البريف مذكرش حالة **Checked-in** (المريض وصل). محتاجينها بين Confirmed وCompleted — بيها نعرف "هل حضر؟" ونحسب وقت الانتظار.

---

## §7 — CRM

> **ده من أهم أجزاء المشروع.** … عايز أعرف في كل مرحلة المريض واقف فين.

### مصادر الـLead

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| CRM-01 | Facebook | MVP | Meta Lead Ads Webhook |
| CRM-02 | Instagram | MVP | نفس ربط Meta |
| CRM-03 | TikTok | MVP / P2 | MVP: إدخال يدوي أو Import من CSV. P2: ربط API |
| CRM-04 | Website | MVP | الفورمز + UTM |
| CRM-05 | WhatsApp | MVP / P2 | MVP: تسجيل يدوي + تتبع Click-to-chat. P2: أي رسالة جديدة تبقى Lead لوحدها |
| CRM-06 | Phone | MVP | إدخال يدوي من الـAgent |
| CRM-07 | Referral | MVP / P2 | MVP: حقل "جاي من طرف مين". P2: Referral Engine |
| CRM-08 | Walk-in | MVP | من الريسبشن |
| CRM-09 | Campaign | MVP | الحملة صفة بتتسجل مع أي مصدر (UTM / Campaign ID) |
| CRM-10 | يتسجل كـLead | MVP | مع منع التكرار برقم الموبايل |

### مراحل الـPipeline

`Lead → Contacted → Qualified → Booked → Visited → Assessment → Program → Paid → Treatment → Follow-up → Renewal → Referral`

| ID | المرحلة | المرحلة (تنفيذ) | بتتحدث إزاي |
|---|---|---|---|
| CRM-11 | Lead | MVP | تلقائي |
| CRM-12 | Contacted | MVP | يدوي (الـAgent يسجل مكالمة/رسالة) |
| CRM-13 | Qualified | MVP | يدوي |
| CRM-14 | Booked | MVP | تلقائي من الحجز |
| CRM-15 | Visited | MVP | تلقائي من الـCheck-in |
| CRM-16 | Assessment | MVP | تلقائي لما الـAssessment يتقفل |
| CRM-17 | Program | MVP | تلقائي لما المريض يتسجل في برنامج/خطة |
| CRM-18 | Paid | MVP | تلقائي من الدفع |
| CRM-19 | Treatment | MVP | تلقائي من أول جلسة علاج |
| CRM-20 | Follow-up | MVP | تلقائي |
| CRM-21 | Renewal | MVP / P2 | MVP: تجديد باقة. P2: تجديد اشتراك |
| CRM-22 | Referral | MVP / P2 | MVP: يدوي. P2: تلقائي من الـReferral Engine |

### الأسئلة اللي لازم الـCRM يجاوبها

| ID | النص في البريف | المرحلة |
|---|---|---|
| CRM-23 | عايز أعرف في كل مرحلة المريض واقف فين | MVP |
| CRM-24 | مصدر الـLead | MVP |
| CRM-25 | الحملة | MVP |
| CRM-26 | الموظف المسؤول | MVP |
| CRM-27 | هل اتواصلنا معه؟ | MVP |
| CRM-28 | هل حجز؟ | MVP |
| CRM-29 | هل حضر؟ | MVP |
| CRM-30 | هل اشترى؟ | MVP |
| CRM-31 | اشترى إيه؟ | MVP |
| CRM-32 | دفع كام؟ | MVP |
| CRM-33 | هل رجع؟ | MVP |
| CRM-34 | هل جدد؟ | MVP |
| CRM-35 | هل عمل Referral؟ | MVP / P2 |

> الحل: كل مرحلة بتتسجل كـ**Milestone بتاريخها** (مش مجرد خانة بتتغير)، فكل سؤال من دول بيبقى إجابته "أيوه/لأ + إمتى + بكام". التفاصيل في [07-lifecycles.md](07-lifecycles.md).

---

## §8 — Clinical Modules

> البرنامج لازم يكون Modular بحيث نقدر نضيف تخصصات بدون ما نعيد بناء النظام.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| CLM-00 | Modular — إضافة تخصصات بدون إعادة بناء النظام | أساس | Form Engine + Specialty Plugins — شوف [03-modules.md](03-modules.md) |
| CLM-99 | قابل لإضافة تخصصات أخرى مستقبلاً 🔮 | أساس | |

### Nutrition

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| NUT-01 | Assessment | MVP | |
| NUT-02 | Medical history | MVP | |
| NUT-03 | Anthropometrics | MVP | |
| NUT-04 | Weight | MVP | |
| NUT-05 | Height | MVP | |
| NUT-06 | BMI | MVP | بيتحسب تلقائي |
| NUT-07 | Body composition | MVP | إدخال يدوي. الربط بأجهزة زي InBody = P3 |
| NUT-08 | Measurements | MVP | محيط الوسط/الأرداف… |
| NUT-09 | Nutrition plan | MVP | بيظهر في التطبيق |
| NUT-10 | Follow-up | MVP | |
| NUT-11 | Progress charts | MVP | |
| NUT-12 | Food diary | P2 | جزء من Oxygen Online Nutrition |
| NUT-13 | Calorie/macronutrient tracking حسب البرنامج | P2 | |
| NUT-14 | Goals | MVP | |
| NUT-15 | Adherence | P2 | محتاج Food diary الأول |
| NUT-16 | Reports | MVP | |

### Physiotherapy

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| PHY-01 | Initial assessment | MVP | |
| PHY-02 | Diagnosis/referral | MVP | |
| PHY-03 | Pain assessment | MVP | مقياس 0–10 + مكان الألم |
| PHY-04 | Functional assessment | MVP | |
| PHY-05 | ROM | MVP | |
| PHY-06 | Strength | MVP | |
| PHY-07 | Treatment plan | MVP | |
| PHY-08 | Sessions | MVP | مربوطة بالباقة (بتخصم جلسة) |
| PHY-09 | Exercises | MVP | مكتبة تمارين |
| PHY-10 | Home exercise program | MVP / P2 | MVP: إرسال البرنامج للتطبيق. P2: تتبع التنفيذ والألم |
| PHY-11 | Exercise videos | MVP | فيديو لكل تمرين في المكتبة |
| PHY-12 | Progress | MVP | |
| PHY-13 | Reassessment | MVP | |
| PHY-14 | Discharge | MVP | |
| PHY-15 | Maintenance/follow-up | MVP | |
| PHY-16 | الـPhysio يقدر يرسل للمريض برنامج Home Exercise من خلال التطبيق | MVP | |

### Dermatology

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| DER-01 | Consultation | MVP | |
| DER-02 | Medical history | MVP | |
| DER-03 | Skin assessment | MVP | |
| DER-04 | Diagnosis | MVP | |
| DER-05 | Treatment plan | MVP | |
| DER-06 | Follow-up | MVP | |
| DER-07 | Progress photos | MVP / P2 | MVP: تصوير في العيادة بموافقة. P2: المريض يرفع صور من التطبيق |
| DER-08 | Treatment timeline | MVP | |
| DER-09 | Reminders | MVP | |
| DER-10 | Online follow-up إذا كان مناسبًا طبيًا | P2 | الطبيب هو اللي يفعّلها لكل مريض |
| DER-11 | Patient education | P2 | |

### Internal Medicine / Metabolic Health

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| IM-01 | Medical history | MVP | |
| IM-02 | Vitals | MVP | |
| IM-03 | Lab results | MVP | رفع + إدخال القيم المهمة كأرقام عشان تترسم |
| IM-04 | Diagnoses | MVP | ICD-10 اختياري |
| IM-05 | Medications | MVP | |
| IM-06 | Follow-up | MVP | |
| IM-07 | Chronic disease tracking | P2 | |
| IM-08 | BP/glucose/weight tracking حسب الحالة | P2 | المريض يسجل من التطبيق + تنبيهات |
| IM-09 | Reports | MVP | |
| IM-10 | Follow-up reminders | MVP | |

---

## §9 — Programs

> مش عايز الخدمات كلها تكون مجرد قائمة. عايز النظام يسمح ببناء **Programs / Journeys** … والنظام يعرف المريض في أي مرحلة.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| PRG-01 | النظام يسمح ببناء Programs / Journeys | MVP | Program Builder (v1) |
| PRG-02 | Secret Seven: Assessment → Plan → Treatment → Follow-up → Progress → Stabilization → Maintenance | MVP | أول برنامج هيتبني على النظام |
| PRG-03 | النظام يعرف المريض في أي مرحلة | MVP | |
| PRG-04 | وكذلك أي برنامج جديد نعمله مستقبلاً | أساس | البرامج بتتعمل من الشاشات، مش بالكود |

---

## §10 — Packages

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| PKG-01 | Single session | MVP | |
| PKG-02 | Package | MVP | |
| PKG-03 | Subscription | P2 | |
| PKG-04 | Membership | P2 | |
| PKG-05 | Program | MVP | |
| PKG-06 | Price | MVP | ممكن يختلف حسب الفرع |
| PKG-07 | Paid | MVP | يدعم الدفع على دفعات |
| PKG-08 | Used | MVP | |
| PKG-09 | Remaining | MVP | |
| PKG-10 | Expiry | MVP | |
| PKG-11 | Renewal | MVP / P2 | MVP: إعادة شراء. P2: تجديد تلقائي |
| PKG-12 | Discounts | MVP | |

---

## §11 — Digital Services

> **ودي نقطة أساسية جدًا.** إحنا مش بنعمل App مجاني فقط. إحنا عايزين Digital Products المريض يدفع مقابلها.

| ID | النص في البريف | المرحلة |
|---|---|---|
| DS-00 | Digital Products مدفوعة | P2 |
| **Oxygen Online Nutrition** | | |
| DS-01 | Online assessment | P2 |
| DS-02 | Nutrition plan | P2 |
| DS-03 | Follow-up | P2 |
| DS-04 | Progress tracking | P2 |
| DS-05 | Food diary | P2 |
| DS-06 | Notifications | P2 |
| DS-07 | Communication | P2 |
| DS-08 | Renewals | P2 |
| **Oxygen Physio Home** | | |
| DS-09 | Personalized home exercise | P2 |
| DS-10 | Exercise videos | P2 |
| DS-11 | Sets/reps/time | P2 |
| DS-12 | Reminders | P2 |
| DS-13 | Completion tracking | P2 |
| DS-14 | Pain/function tracking | P2 |
| DS-15 | Physiotherapist review | P2 |
| **Oxygen Dermatology Follow-up** | | |
| DS-16 | Online follow-up | P2 |
| DS-17 | Photo tracking | P2 |
| DS-18 | Treatment timeline | P2 |
| DS-19 | Reminders | P2 |
| DS-20 | Progress | P2 |
| **Chronic Care / Metabolic Follow-up** (حسب التخصص والحالة) | | |
| DS-21 | Weight | P2 |
| DS-22 | BP | P2 |
| DS-23 | Glucose | P2 |
| DS-24 | Labs | P2 |
| DS-25 | Medication list | P2 |
| DS-26 | Follow-up | P2 |
| DS-27 | Alerts/reminders | P2 |
| **عروض تانية** | | |
| DS-28 | Oxygen Membership — Digital benefits + selected Oxygen benefits حسب الباقة | P2 |
| DS-29 | Family Account — إمكانية إدارة أفراد الأسرة 🔮 | P3 |
| DS-30 | Corporate Wellness — Corporate accounts للشركات وموظفيها 🔮 | P3 |

> ⚠️ **تنبيه مهم:** بيع منتجات رقمية جوه تطبيق iOS/Android ممكن يفرض علينا نظام الدفع بتاع Apple/Google وعمولته (15–30%). التفاصيل والحل في [11-integrations-stores.md](11-integrations-stores.md) و[12-risks.md](12-risks.md).

---

## §12 — Payment System

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| PAY-01 | Online payment | MVP | |
| PAY-02 | Subscription payment | P2 | |
| PAY-03 | Package payment | MVP | |
| PAY-04 | Invoice | MVP | |
| PAY-05 | Payment history | MVP | |
| PAY-06 | Refunds حسب الصلاحيات | MVP | بموافقة حسب المبلغ |
| PAY-07 | Discount codes | MVP | |
| PAY-08 | Membership | P2 | |
| PAY-09 | Renewal | MVP / P2 | |
| PAY-10 | ونقدر نربط Payment Gateway مناسب | MVP | من خلال Adapter عشان نقدر نغيّر الـGateway بعدين |

---

## §13 — Subscription Engine

> **مهم جدًا.** … لأن الـDigital Business هيكون قائم على recurring revenue.

| ID | النص في البريف | المرحلة |
|---|---|---|
| SUB-01 | Monthly | P2 |
| SUB-02 | Quarterly | P2 |
| SUB-03 | Annual | P2 |
| SUB-04 | Auto-renewal إذا كان مناسبًا | P2 |
| SUB-05 | Expiry | P2 |
| SUB-06 | Grace period | P2 |
| SUB-07 | Upgrade | P2 |
| SUB-08 | Downgrade | P2 |
| SUB-09 | Cancellation | P2 |
| SUB-10 | Renewal reminders | P2 |

> الجداول الخاصة بالاشتراكات بتتصمم من الـMVP (حتى لو الشاشات في P2) عشان ميحصلش Migration كبير بعدين.

---

## §14 — Notifications

> Push notifications + Email/SMS/WhatsApp integration حسب المتاح.

| ID | النص في البريف | المرحلة |
|---|---|---|
| NTF-01 | Push notifications | MVP |
| NTF-02 | Email | MVP |
| NTF-03 | SMS | MVP |
| NTF-04 | WhatsApp integration | MVP (رسائل Templates) |
| NTF-05 | Appointment reminder | MVP |
| NTF-06 | Payment reminder | MVP |
| NTF-07 | Follow-up due | MVP |
| NTF-08 | Package ending | MVP |
| NTF-09 | Subscription ending | P2 |
| NTF-10 | Exercise reminder | P2 |
| NTF-11 | Nutrition reminder | P2 |
| NTF-12 | New plan | MVP |
| NTF-13 | Doctor message | P2 |
| NTF-14 | Important clinic notification | MVP |

---

## §15 — Management Dashboard

> أنا كـOwner عايز Dashboard واحدة.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| DSH-00 | Dashboard واحدة للـOwner | MVP | |
| **Today** | | | |
| DSH-01 | Patients | MVP | |
| DSH-02 | New patients | MVP | |
| DSH-03 | New leads | MVP | |
| DSH-04 | Appointments | MVP | |
| DSH-05 | No-shows | MVP | |
| DSH-06 | Revenue | MVP | |
| DSH-07 | Packages sold | MVP | |
| DSH-08 | Digital subscriptions | P2 | |
| DSH-09 | Renewals | MVP / P2 | |
| **Branch Performance** (لكل فرع) | | | |
| DSH-10 | Revenue | MVP | |
| DSH-11 | Patients | MVP | |
| DSH-12 | New patients | MVP | |
| DSH-13 | Conversion | MVP | |
| DSH-14 | Average revenue per patient | MVP | |
| DSH-15 | Services | MVP | |
| DSH-16 | Staff performance | MVP | |
| DSH-17 | No-show | MVP | |
| DSH-18 | Retention | MVP | بيبقى له معنى بعد ~3 شهور داتا |
| **Digital Business** | | | |
| DSH-19 | Active subscribers | P2 | |
| DSH-20 | New subscribers | P2 | |
| DSH-21 | Churn | P2 | |
| DSH-22 | Renewal rate | P2 | |
| DSH-23 | MRR/ARR | P2 | |
| DSH-24 | Digital revenue | P2 | |
| DSH-25 | Revenue by product | P2 | |
| DSH-26 | Revenue by acquisition source | P2 | |
| **CRM** | | | |
| DSH-27 | Leads | MVP | |
| DSH-28 | Conversion | MVP | |
| DSH-29 | Lead source | MVP | |
| DSH-30 | Campaign performance | MVP | |
| DSH-31 | Booking conversion | MVP | |
| DSH-32 | Sales conversion | MVP | |

> طريقة حساب كل KPI مكتوبة في [05-apps-structure.md](05-apps-structure.md#kpi-dictionary) — لازم نتفق عليها قبل التنفيذ.

---

## §16 — Patient Journey Dashboard

> عايز أعرف Oxygen بتخدم المريض إزاي من أول ما يسمع عنا لحد ما يخرج من الـjourney. … ونقدر نعرف أين نفقد المرضى.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| JRN-01 | نعرف Oxygen بتخدم المريض إزاي من أول ما يسمع عنا لحد ما يخرج | MVP | |
| JRN-02 | Lead → Booking → Assessment → Program → Treatment → Follow-up → Result → Renewal → Referral | MVP | |
| JRN-03 | نعرف أين نفقد المرضى | MVP / P2 | MVP: Funnel. P2: تحليل الأسباب والـCohorts |

> ⚠️ الـJourney هنا 9 مراحل وفيها **Result** (مش موجودة في الـCRM)، والـCRM فيه 12 مرحلة. هنوحّدهم في نموذج واحد (Milestones) — شوف [07-lifecycles.md](07-lifecycles.md).

---

## §17 — Reports & Analytics

| ID | النص في البريف | المرحلة |
|---|---|---|
| RPT-01 | By branch | MVP |
| RPT-02 | By doctor | MVP |
| RPT-03 | By service | MVP |
| RPT-04 | By specialty | MVP |
| RPT-05 | By program | MVP |
| RPT-06 | By date | MVP |
| RPT-07 | By source | MVP |
| RPT-08 | By staff | MVP |
| RPT-09 | والنظام يطلع KPIs | MVP |

---

## §18 — Staff Management

| ID | النص في البريف | المرحلة |
|---|---|---|
| STF-01 | كل موظف له account وصلاحيات | MVP |
| STF-02 | Reception → appointments + patient basic info + payments | MVP |
| STF-03 | Nutrition → nutrition patients + clinical module | MVP |
| STF-04 | Physio → physio patients + treatment | MVP |
| STF-05 | Doctor → medical records الخاصة به | MVP |
| STF-06 | Manager → branch dashboard | MVP |
| STF-07 | CEO → everything | MVP |
| STF-08 | Admin → system management | MVP |

---

## §19 — Inventory 🔮

> خصوصًا لو عندنا خدمات تحتاج مواد/مستلزمات.

| ID | النص في البريف | المرحلة |
|---|---|---|
| INV-01 | Products | P3 |
| INV-02 | Consumables | P3 |
| INV-03 | Stock | P3 |
| INV-04 | Purchases | P3 |
| INV-05 | Usage | P3 |
| INV-06 | Low stock alerts | P3 |
| INV-07 | Branch stock | P3 |
| INV-08 | ربط المستلزمات بالخدمات اللي بتستهلكها | P3 |

---

## §20 — Finance

> مش لازم يكون Accounting system كامل من أول يوم، لكن لازم يكون فيه Business Finance layer.

| ID | النص في البريف | المرحلة | ملاحظة |
|---|---|---|---|
| FIN-00 | مش Accounting system كامل — Business Finance layer | أساس | التصدير لبرنامج محاسبة = P3 |
| FIN-01 | Revenue | MVP | |
| FIN-02 | Payments | MVP | |
| FIN-03 | Packages | MVP | |
| FIN-04 | Subscriptions | P2 | |
| FIN-05 | Discounts | MVP | |
| FIN-06 | Refunds | MVP | |
| FIN-07 | Branch revenue | MVP | |
| FIN-08 | Service revenue | MVP | |
| FIN-09 | Digital revenue | P2 | |
| FIN-10 | Staff commissions إذا احتجنا | P3 | |
| FIN-11 | Expenses 🔮 | P2 / P3 | P2: مصروفات بسيطة لكل فرع. P3: كاملة |

---

## §21 — Referral System

| ID | النص في البريف | المرحلة |
|---|---|---|
| REF-01 | Referral Engine | P2 |
| REF-02 | المريض يقدر يعمل referral | P2 |
| REF-03 | مين جاب مين | MVP / P2 |
| REF-04 | Referral source | MVP |
| REF-05 | Rewards/discounts لو عملنا نظام Referral | P2 |

---

## §22 — Reviews

| ID | النص في البريف | المرحلة |
|---|---|---|
| REV-01 | بعد الخدمة، النظام يطلب من المريض تقييم تجربته | P2 |
| REV-02 | Internal feedback | P2 |
| REV-03 | Public review request | P2 |
| REV-04 | نتابع patient satisfaction | P2 |

---

## §23 — Content / Education

> ويكون المحتوى مربوط بالـProgram أو التخصص.

| ID | النص في البريف | المرحلة |
|---|---|---|
| CNT-01 | Videos | P2 |
| CNT-02 | Articles | MVP (على الويبسايت) |
| CNT-03 | Exercise videos | MVP (مكتبة الـPhysio) |
| CNT-04 | Nutrition education | P2 |
| CNT-05 | Medical education | P2 |
| CNT-06 | Program-specific content | P2 |
| CNT-07 | المحتوى مربوط بالـProgram أو التخصص | P2 |

---

## §24 — AI (كمرحلة داخل النظام وليس كبديل للطبيب)

| ID | النص في البريف | المرحلة |
|---|---|---|
| AI-01 | Smart food logging | P3 |
| AI-02 | Patient education assistant | P3 |
| AI-03 | Summarization | P3 |
| AI-04 | Administrative assistant | P3 |
| AI-05 | Smart reminders | P3 |
| AI-06 | Data analysis | P3 |
| AI-07 | Patient engagement | P3 |
| AI-08 | أي AI طبي لازم يكون له صلاحيات وحدود واضحة، ولا يستبدل القرار الطبي | أساس |

---

## §25 — Security & Privacy

> **ده جزء أساسي جدًا.** … وخصوصًا إننا بنتعامل مع بيانات طبية.

| ID | النص في البريف | المرحلة |
|---|---|---|
| SEC-01 | Role-based access | MVP |
| SEC-02 | Audit log | MVP |
| SEC-03 | Backup | MVP |
| SEC-04 | Encryption حيث يلزم | MVP |
| SEC-05 | Secure authentication | MVP |
| SEC-06 | Password policies | MVP |
| SEC-07 | Session management | MVP |
| SEC-08 | Data recovery | MVP |
| SEC-09 | Activity logs | MVP |
| SEC-10 | Data export | MVP |
| SEC-11 | Data deletion/retention policies حسب المتطلبات القانونية | MVP |

التفاصيل في [10-security.md](10-security.md).

---

## §26 — Ownership & Access

> الـSoftware بالكامل ملك Oxygen Clinics. … لازم Oxygen يكون عندها ownership/access حقيقي، وليس مجرد استخدام للبرنامج.

| ID | النص في البريف | المرحلة |
|---|---|---|
| OWN-01 | Source code | من أول يوم |
| OWN-02 | Backend | من أول يوم |
| OWN-03 | Frontend | من أول يوم |
| OWN-04 | Mobile Apps | من أول يوم |
| OWN-05 | Database | من أول يوم |
| OWN-06 | UI/UX | من أول يوم |
| OWN-07 | Documentation | من أول يوم |
| OWN-08 | Custom integrations | من أول يوم |
| OWN-09 | Domain | من أول يوم |
| OWN-10 | Cloud accounts | من أول يوم |
| OWN-11 | App Store accounts | من أول يوم |
| OWN-12 | Google Play accounts | من أول يوم |
| OWN-13 | Analytics | من أول يوم |
| OWN-14 | APIs | من أول يوم |
| OWN-15 | Data | من أول يوم |
| OWN-16 | ownership/access حقيقي وليس مجرد استخدام | من أول يوم |
| OWN-17 | Documentation بحيث نقدر نضيف Developer أو Team آخر | مستمر |

الخطة الكاملة في [13-ownership-handover.md](13-ownership-handover.md).

---

## §27 + §28 — Architecture والشكل النهائي

| ID | النص في البريف | المرحلة |
|---|---|---|
| ARC-01 | مش عايزين Software معمول فقط لفرع واحد | أساس |
| ARC-02 | Multi-branch من البداية | MVP |
| ARC-03 | قابل لـMulti-specialty | MVP (4 تخصصات + قابل للزيادة) |
| ARC-04 | قابل لـDigital Services | P2 |
| ARC-05 | قابل لـSubscriptions | P2 |
| ARC-06 | قابل لـCorporate | P3 |
| ARC-07 | قابل مستقبلاً لـSaaS أو مراكز أخرى 🔮 | التصميم جاهز من MVP، التنفيذ P3+ |
| ARC-08 | لا نحتاج نبيع النظام للغير من أول يوم | — |
| ARC-09 | 4 مستويات: PATIENT (Website + App) → CLINIC (Doctors + Reception + Clinical + Scheduling) → MANAGEMENT (CRM + Finance + KPIs + Branch Dashboard) → DIGITAL BUSINESS (Subscriptions + Online Programs + Memberships + Corporate + Future Products) | أساس |
| ARC-10 | وكلهم مربوطين بـ OXYGEN CORE | أساس |

الرسم في [02-architecture.md](02-architecture.md).

---

## §29 — أهم حاجة في المشروع: مش هنبدأ بالبرمجة مباشرة

| ID | المرحلة في البريف | الملف/المخرج |
|---|---|---|
| PRC-01 | Phase 1 — Product Requirements | الملف ده + SRS تفصيلي |
| PRC-02 | Phase 2 — User Journey | [07-lifecycles.md](07-lifecycles.md) |
| PRC-03 | Phase 3 — Workflow لكل Role | [06-roles-permissions.md](06-roles-permissions.md) + [07-lifecycles.md](07-lifecycles.md) |
| PRC-04 | Phase 4 — Database/Data Structure | [04-database.md](04-database.md) |
| PRC-05 | Phase 5 — System Architecture | [02-architecture.md](02-architecture.md) |
| PRC-06 | Phase 6 — UI/UX Prototype | [14-design-prompts.md](14-design-prompts.md) → Figma |
| PRC-07 | Phase 7 — Development | [08-roadmap.md](08-roadmap.md) |
| PRC-08 | Phase 8 — Testing | [08-roadmap.md](08-roadmap.md) |
| PRC-09 | Phase 9 — Pilot على Oxygen | [08-roadmap.md](08-roadmap.md) |
| PRC-10 | Phase 10 — Launch | [08-roadmap.md](08-roadmap.md) |

---

## §30 — المطلوب من الـDeveloper (20 بند)

| ID | البند | فين الإجابة |
|---|---|---|
| DEL-01 | Proposed System Architecture | [02-architecture.md](02-architecture.md) |
| DEL-02 | Modules List | [03-modules.md](03-modules.md) |
| DEL-03 | Database structure المقترحة | [04-database.md](04-database.md) |
| DEL-04 | Web/App/Dashboard structure | [05-apps-structure.md](05-apps-structure.md) |
| DEL-05 | User roles & permissions | [06-roles-permissions.md](06-roles-permissions.md) |
| DEL-06 | What should be MVP | [08-roadmap.md](08-roadmap.md) |
| DEL-07 | What should be Phase 2 | [08-roadmap.md](08-roadmap.md) |
| DEL-08 | What should be Phase 3 | [08-roadmap.md](08-roadmap.md) |
| DEL-09 | Development timeline | [08-roadmap.md](08-roadmap.md) |
| DEL-10 | Infrastructure requirements | [09-infrastructure-costs.md](09-infrastructure-costs.md) |
| DEL-11 | Server/cloud requirements | [09-infrastructure-costs.md](09-infrastructure-costs.md) |
| DEL-12 | Maintenance requirements | [09-infrastructure-costs.md](09-infrastructure-costs.md) |
| DEL-13 | Security architecture | [10-security.md](10-security.md) |
| DEL-14 | Backup/recovery plan | [09-infrastructure-costs.md](09-infrastructure-costs.md) |
| DEL-15 | App Store/Google Play requirements | [11-integrations-stores.md](11-integrations-stores.md) |
| DEL-16 | APIs/integrations المطلوبة | [11-integrations-stores.md](11-integrations-stores.md) |
| DEL-17 | Third-party services التي سنحتاجها | [11-integrations-stores.md](11-integrations-stores.md) |
| DEL-18 | Estimated running costs | [09-infrastructure-costs.md](09-infrastructure-costs.md) |
| DEL-19 | Technical risks | [12-risks.md](12-risks.md) |
| DEL-20 | طريقة تسليم الـSource Code والـDocumentation والـAccounts لـOxygen | [13-ownership-handover.md](13-ownership-handover.md) |

### شروط الـTechnology Stack

> أنا لا أريد أن نقيدك بتكنولوجيا معينة. اختار الـtechnology stack الذي تراه الأفضل، بشرط أن يكون:

| ID | الشرط | الإجابة في [01-tech-stack.md](01-tech-stack.md) |
|---|---|---|
| TEC-01 | Scalable | Modular monolith + PostgreSQL + Horizontal scaling |
| TEC-02 | Secure | RBAC + Audit + Encryption + 2FA |
| TEC-03 | Maintainable | لغة واحدة (TypeScript) + هيكل NestJS واضح |
| TEC-04 | Fast | Next.js SSR + Redis + Indexes |
| TEC-05 | قابل للتطوير | Modules + Plugins + Configuration |
| TEC-06 | أقدر أغير Developer أو أضيف Developers بدون ما Oxygen تصبح رهينة لشخص واحد | أشهر Stack في السوق + كل الحسابات باسم Oxygen + Documentation |

---

## الهدف النهائي

> Oxygen Clinics لا تكون مجرد عيادة لديها Software. الهدف أن يكون عندنا: **OXYGEN DIGITAL HEALTH ECOSYSTEM**
> يربط المريض بالعيادة وبالأطباء وبالخدمات الرقمية وبالمتابعة وبالإدارة، ويكون قابلاً للتوسع مع نمو Oxygen.
> وده يعتبر Initial Product Brief، وبعد ما تراجعه عايز نقعد نحوله إلى Detailed Software Requirements Document ونحدد كل Screen وكل Workflow وكل Feature قبل بداية التطوير.

---

## ملاحظات من القراءة الدقيقة (تعارضات وحاجات ناقصة)

| # | الملاحظة | ليه مهمة |
|---|---|---|
| 1 | **Expenses**: في §5 مكتوبة لكل فرع عادي، وفي §20 مكتوب "مستقبلاً" | لازم نعرف هل محتاجينها في الـMVP |
| 2 | **مراحل الـCRM (12)** مختلفة عن **مراحل الـJourney (9)** — والـJourney فيها "Result" | هنوحّدهم في Milestones |
| 3 | **Managers / Branch managers / Management** — مفيش تعريف للفرق | بيأثر على الصلاحيات |
| 4 | **CEO → everything**: يشمل الملاحظات الطبية التفصيلية؟ | خصوصية بيانات طبية |
| 5 | **Prescriptions "حسب ما يسمح به النظام"** | محتاج رأي قانوني/نقابي |
| 6 | **Online consultation** مذكورة في الويبسايت بس، من غير تفاصيل | فيديو؟ شات؟ مين الأطباء؟ |
| 7 | **Auto-renewal "إذا كان مناسبًا"** | بيعتمد على الـGateway وعلى سياسات Apple/Google |
| 8 | **مفيش ذكر لحالة Checked-in** في المواعيد | محتاجينها عشان "هل حضر؟" |
| 9 | **مفيش ذكر للتأمين الطبي / شركات التأمين** | لو موجود بيغير شكل الـBilling كله |
| 10 | **مفيش ذكر للداتا الحالية** (نظام قديم/Excel) | Migration |
| 11 | **مفيش ذكر للغات** | هنفترض عربي + إنجليزي مع RTL |
| 12 | **مفيش ذكر لبلد التشغيل** | بيحدد الـPayment gateway والـSMS والقوانين ومكان السيرفرات |
| 13 | **الموافقات (Consents)** مذكورة للصور بس | محتاجين موافقات للبيانات والتواصل التسويقي والـOnline consultation كمان |

<a id="open-questions"></a>

## أسئلة مفتوحة لازم Oxygen تجاوبها قبل الـSRS

1. بلد التشغيل والعملة؟ (بيحدد Payment gateway، مزود SMS، القوانين، مكان السيرفرات)
2. عدد الفروع الحالية والمخططة، وعناوينها ومواعيد شغلها؟
3. عدد الموظفين لكل Role تقريبًا؟ وعدد المرضى والمواعيد في الشهر؟
4. في نظام قديم أو Excel فيه بيانات مرضى لازم تتنقل؟
5. لغات النظام: عربي + إنجليزي؟ وإيه اللغة الافتراضية؟
6. في تأمين طبي / شركات / كروت خصم بتتعاملوا معاها؟
7. تفاصيل **Secret Seven**: المراحل، مدة كل مرحلة، الجلسات والخدمات اللي جواه، السعر، وإمتى المريض ينتقل من مرحلة للتانية؟
8. الروشتة: مسموح Prescription إلكترونية؟ ولا "تعليمات" بس؟
9. صور Before/After: مين يصور؟ مين يشوف؟ هل تُستخدم في التسويق (محتاجة موافقة منفصلة)؟
10. الطبيب يشوف ملفات مين؟ مرضاه بس ولا كل مرضى التخصص؟ وهل أخصائي التغذية يشوف تحاليل الباطنة؟
11. الـCEO يشوف الملاحظات الطبية بالتفصيل ولا الأرقام والملخصات بس؟
12. إيه الفرق بين Managers و Branch managers و Management؟
13. Expenses: من الـMVP ولا بعدين؟
14. سياسة الإلغاء والـNo-show (رسوم؟ مهلة؟) وسياسة الـRefund (مين يوافق وحدود المبالغ)؟
15. سياسة الخصومات: مين يقدر يعمل خصم، وبحد أقصى كام %؟
16. المنتجات الرقمية: الأسعار، المدة، مين من الفريق بيتابع، وفي قد إيه بيرد على المريض؟
17. Online consultation: فيديو ولا شات؟ مين الأطباء المتاحين؟
18. في أجهزة (زي InBody) عايزين نربطها؟
19. الحسابات الموجودة: Domain، الويبسايت الحالي، حسابات إعلانات Facebook/Instagram/TikTok، WhatsApp Business، Google Business Profile؟
20. في هوية بصرية جاهزة (Logo / Colors / Fonts)؟
21. عمولات الموظفين مطلوبة؟ وإيه قواعدها؟
22. مين هيعمل المحتوى (فيديوهات التمارين والمقالات)؟
23. الميزانية والموعد المتوقع للإطلاق؟
24. في متطلبات فاتورة/إيصال إلكتروني من مصلحة الضرائب لنشاطكم؟
