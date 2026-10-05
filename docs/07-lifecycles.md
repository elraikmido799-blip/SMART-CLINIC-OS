# 07 — السايكلز والرسومات (Lifecycles & Flows)

> بيرد على: **Phase 2 في البريف: User Journey** + §7 (CRM) + §9 (Programs) + §13 (Subscriptions) + §16 (Patient Journey).
> لو الرسومات مش ظاهرة في VS Code: سطّب Extension **Markdown Preview Mermaid Support**، أو افتح الملف على GitHub.

| # | السايكل | ليه مهم |
|---|---|---|
| 1 | الدورة الكبيرة للمريض | الصورة اللي البيزنس كله ماشي عليها |
| 2 | حدث واحد بيحرّك النظام كله | يوضح ليه النظام "Smart" |
| 3 | الـCRM Pipeline والـMilestones | §7 + §16 |
| 4 | دخول الـLead | منين وإزاي |
| 5 | دورة حياة الموعد | §6 |
| 6 | الزيارة الطبية (Encounter) | §8 |
| 7 | البرنامج (Secret Seven) | §9 |
| 8 | دورة حياة الباقة | §10 |
| 9 | دورة حياة الاشتراك | §13 |
| 10 | Physio Home (HEP) | §8 + §11 |
| 11 | الدفع أونلاين | §12 |
| 12 | الإشعارات | §14 |
| 13 | دورة تطوير المشروع | §29 |

---

## 1. الدورة الكبيرة للمريض (The Oxygen Cycle)

```mermaid
flowchart LR
    A["1 · Awareness<br/>Ads · Social · Referral · Website"] --> B["2 · Lead<br/>CRM"]
    B --> C["3 · Booking<br/>Website · App · Reception · CRM"]
    C --> D["4 · Visit + Assessment<br/>Clinical modules"]
    D --> E["5 · Program / Plan<br/>Programs + Packages"]
    E --> F["6 · Payment<br/>Billing"]
    F --> G["7 · Treatment<br/>Sessions · HEP · Nutrition plan"]
    G --> H["8 · Follow-up<br/>In clinic + Digital"]
    H --> I["9 · Result<br/>Progress · Health Passport"]
    I --> J["10 · Renewal<br/>Package · Subscription · Membership"]
    J --> G
    I --> K["11 · Referral + Review"]
    K --> B
```

**الدايرة بتقفل مرتين:**
- **Renewal ← Treatment:** المريض بيجدد وبيكمل، ودي الـRecurring revenue.
- **Referral ← Lead:** المريض الراضي بيجيب مريض جديد، وده أرخص Lead ممكن.

كل خطوة في الدايرة دي ليها Module مسؤول عنها وبتسجّل Milestone، فالـCEO يقدر يشوف الدايرة دي كأرقام (الـFunnel).

---

## 2. حدث واحد بيحرّك النظام كله

مثال: مريض اشترى برنامج Secret Seven.

```mermaid
flowchart TD
    X["Patient buys the Secret Seven program"] --> I["Invoice + Payment"]
    I --> EN["Entitlements created<br/>e.g. 12 sessions · valid 90 days"]
    I --> CRM["CRM milestone: PAID"]
    I --> KPI["Dashboard: revenue + packages sold"]
    I --> TL["Health Passport timeline"]
    I --> NT["Receipt on WhatsApp / push"]
    EN --> PRG["Program enrollment<br/>stage: Assessment"]
    PRG --> APP["Patient App shows program + next step"]
    PRG --> TASK["Clinician task: book assessment"]
```

الموظف عمل حاجة واحدة بس (حصّل فلوس)، والنظام عمل 8 حاجات لوحده. ده معنى **Smart Clinic OS**.

---

## 3. الـCRM Pipeline والـMilestones

### المراحل الـ12 اللي في البريف (§7)

🟧 **برتقالي = يدوي** (الـAgent بيسجله) · 🟩 **أخضر = تلقائي** (النظام بيسجله من الأحداث)

```mermaid
flowchart LR
    L["Lead"] -->|agent logs call or WhatsApp| CT["Contacted"]
    CT -->|agent qualifies| Q["Qualified"]
    Q -->|appointment created| BK["Booked"]
    BK -->|check-in| V["Visited"]
    V -->|assessment signed| ASM["Assessment"]
    ASM -->|enrolled in program or plan| PR["Program"]
    PR -->|payment succeeded| PD["Paid"]
    PD -->|first treatment session done| TR["Treatment"]
    TR -->|follow-up done| FU["Follow-up"]
    FU -->|package or subscription renewed| RN["Renewal"]
    RN -->|referred a new lead| RF["Referral"]
    classDef manual fill:#FFF4E5,stroke:#F59E0B,color:#7A4B00
    classDef auto fill:#E6F4F1,stroke:#0E8C7F,color:#0B2E2B
    class L,CT,Q manual
    class BK,V,ASM,PR,PD,TR,FU,RN,RF auto
```

> **أهم نقطة:** 9 مراحل من 12 بتتحدث لوحدها. الـAgent مش هيقعد يسحب الكروت بإيده،
> النظام بيعرف إن المريض حجز وحضر ودفع وجدد من الأحداث نفسها. فالداتا دايمًا صح، ومحدش بيدخلها مرتين.

### توحيد الـCRM (12 مرحلة) مع الـJourney (9 مراحل) — نموذج الـMilestones

البريف فيه قايمتين مختلفتين (§7 و§16). الحل إن كل مرحلة تتسجل كـ**Milestone بتاريخها**، مش مجرد خانة بتتغير:

| Milestone | مرحلة الـCRM (§7) | مرحلة الـJourney (§16) | بيتسجل إزاي |
|---|---|---|---|
| `LEAD_CREATED` | Lead | Lead | تلقائي، من أي مصدر |
| `CONTACTED` | Contacted | — | يدوي: الـAgent يسجل تواصل |
| `QUALIFIED` | Qualified | — | يدوي |
| `BOOKED` | Booked | Booking | تلقائي: أول حجز |
| `VISITED` | Visited | — | تلقائي: أول Check-in |
| `ASSESSED` | Assessment | Assessment | تلقائي: الـAssessment اتقفل |
| `PROGRAM_STARTED` | Program | Program | تلقائي: التسجيل في برنامج أو خطة |
| `PAID` | Paid | — | تلقائي: أول دفعة |
| `TREATMENT_STARTED` | Treatment | Treatment | تلقائي: أول جلسة علاج |
| `FOLLOW_UP` | Follow-up | Follow-up | تلقائي: متابعة اتعملت (في العيادة أو أونلاين) |
| `RESULT_ACHIEVED` | — | Result | يدوي من الأخصائي، أو قاعدة (مثلاً وصل للوزن المستهدف) |
| `RENEWED` | Renewal | Renewal | تلقائي: تجديد باقة أو اشتراك |
| `REFERRED` | Referral | Referral | MVP يدوي، P2 تلقائي (حد جه بكوده) |
| `LOST` | Lost | Drop-off | يدوي، أو تلقائي لو مفيش أي نشاط X يوم |

- **"المريض واقف فين؟"** = آخر Milestone وصلها.
- **"هل حجز؟ هل حضر؟ هل اشترى؟ هل رجع؟ هل جدد؟"** = هل الـMilestone دي موجودة، وإمتى.
- **"دفع كام؟ اشترى إيه؟"** = من الفواتير المربوطة بنفس الشخص.
- **"أين نفقد المرضى؟"** = عدد اللي وصلوا لكل Milestone (Funnel) والنسبة بين كل مرحلتين.

---

## 4. دخول الـLead

```mermaid
flowchart LR
    subgraph SRC["Lead sources"]
        FB["Facebook Lead Ads"]
        IG["Instagram"]
        TT["TikTok"]
        WEB["Website forms"]
        WA["WhatsApp"]
        PH["Phone"]
        RF["Referral"]
        WI["Walk-in"]
    end
    FB -->|Meta webhook| INTAKE["Lead intake"]
    IG -->|Meta webhook| INTAKE
    TT -->|CSV import - API in P2| INTAKE
    WEB -->|form + UTM| INTAKE
    WA -->|agent entry - API in P2| INTAKE
    PH -->|agent entry| INTAKE
    RF -->|referral code| INTAKE
    WI -->|reception entry| INTAKE
    INTAKE --> DUP{"Phone already exists?"}
    DUP -->|yes| MERGE["Attach to existing lead or patient<br/>+ new touchpoint"]
    DUP -->|no| NEWL["New lead"]
    MERGE --> ASSIGN["Auto-assign agent<br/>by branch / specialty"]
    NEWL --> ASSIGN
    ASSIGN --> SLA["SLA timer<br/>first contact within X minutes"]
    SLA --> PIPE["CRM pipeline"]
```

- **Campaign** مش مصدر لوحده، دي صفة بتتسجل مع أي مصدر (UTM أو Campaign ID).
- **منع التكرار برقم الموبايل** (بصيغة موحّدة): لو الشخص موجود، بيتضاف له "Touchpoint" جديد بدل Lead مكرر.
- **الـSLA:** الـLead اللي بيتكلم في أول 5–15 دقيقة نسبة تحويله أعلى بكتير. الداشبورد بيبيّن مين اتأخر.

---

## 5. دورة حياة الموعد

```mermaid
stateDiagram-v2
    [*] --> Booked : created from Website, App, Reception or CRM
    Booked --> Confirmed : patient confirms or prepaid
    Booked --> CheckedIn : patient arrives
    Confirmed --> CheckedIn : patient arrives
    Booked --> Rescheduled : moved to another time
    Confirmed --> Rescheduled : moved to another time
    Booked --> Cancelled : cancelled by patient or staff
    Confirmed --> Cancelled : cancelled by patient or staff
    Booked --> NoShow : did not arrive after grace time
    Confirmed --> NoShow : did not arrive after grace time
    CheckedIn --> InProgress : clinician starts encounter
    InProgress --> Completed : encounter closed
    Rescheduled --> [*] : new appointment is created
    Completed --> [*]
    Cancelled --> [*]
    NoShow --> [*]
```

| القاعدة | الاقتراح (محتاج تأكيد Oxygen) |
|---|---|
| التذكيرات | تأكيد فوري + قبلها بـ24 ساعة + قبلها بساعتين |
| No-show | بعد 15 دقيقة من الميعاد من غير Check-in، الريسبشن يأكد |
| الإلغاء المجاني | لحد 24 ساعة قبل الميعاد |
| الجلسة من الباقة | بتتخصم عند **Completed**. وعند No-show حسب السياسة |
| Rescheduled | الموعد القديم بيتقفل كـRescheduled، وبيتعمل موعد جديد مربوط بيه (عشان نعرف كام مرة المريض أجّل) |

---

## 6. الزيارة الطبية (Encounter)

```mermaid
flowchart TD
    A["Patient checked in"] --> B["Clinician opens Patient 360"]
    B --> C["Start encounter<br/>linked to the appointment"]
    C --> D["Specialty form<br/>Nutrition · Physio · Derm · IM"]
    D --> E["Measurements + vitals<br/>weight · BMI · BP · ROM · pain"]
    E --> F["Diagnosis + clinical notes"]
    F --> G["Plan<br/>nutrition plan · treatment plan · HEP · medications"]
    G --> H{"Share with patient?"}
    H -->|Yes| I["Publish to Patient App<br/>Passport + New plan notification"]
    H -->|No| J["Internal only"]
    I --> K["Sign and lock encounter"]
    J --> K
    K --> L["Book next visit<br/>package session consumed"]
    K --> M["Program stage updated if needed"]
```

- بعد **التوقيع** الزيارة بتتقفل. أي تعديل بعد كده بيبقى **Amendment** متسجل بتاريخه واسم اللي عدّل (مفيش مسح للتاريخ الطبي).
- الـAssistant يقدر يدخل القياسات قبل ما الأخصائي يبدأ، فيوفّر وقته.

---

## 7. البرنامج: Secret Seven

```mermaid
flowchart LR
    S1["1 · Assessment"] --> S2["2 · Plan"]
    S2 --> S3["3 · Treatment"]
    S3 --> S4["4 · Follow-up"]
    S4 --> S5["5 · Progress"]
    S5 --> S6["6 · Stabilization"]
    S6 --> S7["7 · Maintenance"]
    S4 -.->|plan needs adjustment| S2
    S7 -.->|relapse or new goal| S1
```

كل مرحلة في الـProgram builder بتتعرّف بالشكل ده (القيم دي **مثال** لحد ما Oxygen تأكد تفاصيل البرنامج):

| المرحلة | الأخصائي بيعمل | المريض بيشوف في التطبيق | النظام بيعمل لوحده | تخلص إمتى |
|---|---|---|---|---|
| 1 · Assessment | تقييم كامل + قياسات البداية (Baseline) | ترحيب + هيحصل إيه + تعليمات التحضير | مهمة حجز التقييم + رسالة ترحيب | الـAssessment اتقفل |
| 2 · Plan | يبني الخطة | الخطة | إشعار "New plan" + محتوى تعليمي | الخطة اتنشرت |
| 3 · Treatment | الجلسات حسب الخطة | الجلسات والمتبقي + التمارين | تذكيرات المواعيد والتمارين | عدد جلسات أو تاريخ |
| 4 · Follow-up | متابعات دورية | الموعد الجاي + تسجيل القياسات (P2) | تذكير "Follow-up due" | المتابعات اتعملت |
| 5 · Progress | إعادة تقييم + مقارنة بالبداية | رسوم التقدم + تقرير | تقرير تقدم PDF | الهدف اتحقق أو المدة خلصت |
| 6 · Stabilization | زيارات أقل | نصايح الثبات | تذكير شهري | ثبات لمدة X أسابيع |
| 7 · Maintenance | خطة الاستمرار | خطة الصيانة | عرض Membership / اشتراك | مستمرة (أو رجوع لـ1) |

> نفس الـBuilder ده بيتعمل بيه أي برنامج جديد بعدين (PRG-04)، من غير كود.

---

## 8. دورة حياة الباقة (Package / Entitlement)

```mermaid
stateDiagram-v2
    [*] --> PendingPayment : package added to invoice
    PendingPayment --> Active : paid or allowed deposit
    Active --> Frozen : frozen by manager
    Frozen --> Active : unfrozen - expiry extended
    Active --> Exhausted : no sessions left
    Active --> Expired : expiry date passed
    Active --> Refunded : refund approved
    Exhausted --> [*]
    Expired --> [*]
    Refunded --> [*]
```

- إشعار **Package ending** لما يفضل جلستين، أو قبل الانتهاء بـ7 أيام.
- **التجديد في الـMVP** = باقة جديدة، وبيتسجل Milestone `RENEWED`.
- **التجميد (Freeze)** مش مذكور في البريف، لكنه شائع في العيادات (سفر / مرض). مقترح، والقرار لـOxygen.

---

## 9. دورة حياة الاشتراك (Subscription Engine — P2)

```mermaid
stateDiagram-v2
    [*] --> Trialing : free trial if offered
    [*] --> Active : first payment succeeded
    Trialing --> Active : payment succeeded
    Trialing --> Expired : trial ended without payment
    Active --> PastDue : renewal payment failed
    PastDue --> Active : retry succeeded
    PastDue --> Grace : retries exhausted
    Grace --> Active : patient pays within grace period
    Grace --> Expired : grace period ended
    Active --> PendingCancel : patient cancels - access until period end
    PendingCancel --> Active : patient resumes
    PendingCancel --> Cancelled : period ended
    Expired --> Active : patient subscribes again
    Cancelled --> Active : patient subscribes again
    note right of Active : renews every period, upgrade or downgrade allowed
```

| القاعدة | الاقتراح |
|---|---|
| **Monthly / Quarterly / Annual** | نفس المنتج بـ3 أسعار، والسنوي بخصم |
| **Auto-renewal** | بكارت محفوظ (Token) لو الـGateway بيدعم. لو مش بيدعم: تذكير + لينك دفع |
| **Upgrade** | فوري، ويدفع الفرق بالنسبة للأيام الباقية (Proration) |
| **Downgrade** | بيبدأ مع التجديد الجاي |
| **Cancellation** | الخدمة مستمرة لآخر الفترة المدفوعة |
| **محاولات الدفع** | لو التجديد فشل: إعادة محاولة بعد يوم و3 أيام و5 أيام، وبعدين Grace period |
| **Renewal reminders** | قبل التجديد بـ7 أيام ويوم |

---

## 10. Physio Home: برنامج التمارين في البيت

```mermaid
flowchart LR
    A["Physio builds HEP<br/>exercises + sets / reps / time"] --> B["Patient receives it in the app<br/>videos + reminders"]
    B --> C["Patient exercises<br/>marks done + pain 0-10"]
    C --> D["Physio reviews<br/>adherence + pain trend"]
    D -->|adjust program| A
    D -->|pain increasing| E["Alert: call patient or book visit"]
```

- **MVP:** الخطوتين الأولانيين (البناء والإرسال للتطبيق بالفيديو).
- **P2 (Oxygen Physio Home):** التتبع والألم والمراجعة والتنبيهات، والمنتج ده بيتباع كاشتراك.

---

## 11. الدفع أونلاين

```mermaid
sequenceDiagram
    autonumber
    actor P as Patient
    participant C as App / Website
    participant API as Oxygen API
    participant PG as Payment Gateway
    participant W as Workers
    P->>C: Pay for package or booking
    C->>API: POST /checkout with items and discount code
    API->>API: Create invoice - status issued
    API->>PG: Create payment session
    PG-->>API: Payment URL or token
    API-->>C: Redirect to secure checkout
    P->>PG: Card or wallet details
    PG-->>API: Signed webhook - payment succeeded
    API->>API: Verify signature + idempotency check
    API->>API: Invoice paid + entitlements created
    API->>W: Emit PaymentSucceeded
    W->>P: Receipt via WhatsApp / push / email
    W->>API: CRM milestone PAID + KPIs + Passport
    PG-->>C: Redirect back to success page
```

- **بيانات الكارت عمرها ما بتعدي على سيرفراتنا.** المريض بيدفع في صفحة الـGateway نفسها، وده بيقلل مسؤوليتنا الأمنية (PCI) جدًا.
- الاعتماد على الـ**Webhook الموقّع** مش على رجوع المريض للصفحة. لو المريض قفل المتصفح بعد الدفع، الفاتورة برضه هتتقفل صح.

---

## 12. الإشعارات

```mermaid
flowchart LR
    EV["Domain event<br/>AppointmentBooked · PaymentSucceeded"] --> OB[("Outbox")]
    OB --> QU[["Queue - BullMQ"]]
    QU --> RU{"Rules<br/>template + preferences + quiet hours"}
    RU --> PU["Push<br/>Expo to FCM / APNs"]
    RU --> WA["WhatsApp<br/>Cloud API templates"]
    RU --> SM["SMS<br/>OTP + fallback"]
    RU --> EM["Email"]
    PU --> LOG["Delivery log + status"]
    WA --> LOG
    SM --> LOG
    EM --> LOG
```

**ترتيب القنوات (عشان التكلفة):** Push الأول (ببلاش) → WhatsApp للمهم (التذكيرات والإيصالات) → SMS للـOTP أو لو الواتساب فشل → Email للفواتير والتقارير.
**أوقات الهدوء:** مفيش رسائل من 10 بالليل لـ9 الصبح، ما عدا الـOTP.

| الإشعار (§14) | إمتى بيتبعت | المرحلة |
|---|---|---|
| Appointment reminder | عند الحجز + قبلها بـ24 ساعة + قبلها بساعتين | MVP |
| Payment reminder | بعد استحقاق الفاتورة بيوم و3 أيام | MVP |
| Follow-up due | قبل ميعاد المتابعة المفروض بـX أيام لو مفيش حجز | MVP |
| Package ending | لما يفضل جلستين، أو قبل الانتهاء بـ7 أيام | MVP |
| New plan | فورًا لما الأخصائي ينشر الخطة | MVP |
| Important clinic notification | رسالة عامة من الإدارة (إجازة، فرع جديد…) | MVP |
| Subscription ending | قبل التجديد بـ7 أيام ويوم | P2 |
| Exercise reminder | يوميًا في الميعاد اللي المريض يختاره | P2 |
| Nutrition reminder | تذكير تسجيل الوجبات | P2 |
| Doctor message | فورًا | P2 |

---

## 13. دورة تطوير المشروع

### الـ10 مراحل اللي في البريف (§29)

```mermaid
flowchart LR
    P1["Phase 1<br/>Product Requirements"] --> P2["Phase 2<br/>User Journeys"]
    P2 --> P3["Phase 3<br/>Workflows per Role"]
    P3 --> P4["Phase 4<br/>Database Design"]
    P4 --> P5["Phase 5<br/>System Architecture"]
    P5 --> P6["Phase 6<br/>UI/UX Prototype"]
    P6 --> P7["Phase 7<br/>Development"]
    P7 --> P8["Phase 8<br/>Testing"]
    P8 --> P9["Phase 9<br/>Pilot at Oxygen"]
    P9 --> P10["Phase 10<br/>Launch"]
    P10 -.->|feedback feeds the next release| P1
```

### جوه Phase 7: دورة الـSprint (كل أسبوعين)

```mermaid
flowchart LR
    A["Backlog<br/>from the SRS"] --> B["Sprint planning<br/>2 weeks"]
    B --> C["Design + build"]
    C --> D["Code review + automated tests"]
    D --> E["Demo on staging<br/>Oxygen feedback"]
    E --> F["Release"]
    F --> G["Monitor + learn"]
    G --> A
```

> كل أسبوعين Oxygen بتشوف حاجة شغالة على Staging وتدّي رأيها. كده مفيش مفاجآت في الآخر.
> التواريخ والمدد في [08-roadmap.md](08-roadmap.md).
