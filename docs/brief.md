# Oxygen Digital Platform — البريف الأصلي

> نسخة Markdown من `Oxygen_Digital_Platform_Brief.pdf` (15 صفحة) **بنفس الكلام والترتيب، من غير أي إضافة أو تعديل**.
> النسخة المقسّمة والمرقّمة (كل سطر له ID ومرحلة): [00-requirements-catalog.md](00-requirements-catalog.md).

---

**أنا عايز نبني OXYGEN DIGITAL PLATFORM / OXYGEN SMART CLINIC OS.**

الفكرة إن Oxygen Clinics تبقى عندها منظومة رقمية كاملة تربط:

> المريض + العيادة + الأطباء + الـNutrition + الـPhysiotherapy + الـDermatology + الـInternal Medicine + الـCRM + الحجز + الدفع + الـFollow-up + الـDigital Services + الـWebsite + الـApp + الـManagement Dashboard

وكل ده يكون مربوط بقاعدة بيانات ونظام واحد.

وفي نفس الوقت نبني Digital Health Business حقيقي له خدمات مدفوعة أونلاين.

---

## 1. شكل المنظومة

أنا متخيلها كالتالي:

### A. Oxygen Website

مش مجرد Website تعريفي.

يكون فيه:

- تعريف Oxygen.
- الخدمات والتخصصات.
- الأطباء والفريق.
- الفروع.
- Booking.
- Online consultation.
- Digital programs.
- Digital subscriptions.
- Memberships.
- Payment.
- Login للمريض.
- دخول إلى Patient Portal.
- Download App.
- Content / education.
- Contact / WhatsApp integration.
- Offers / campaigns.
- Forms.
- إمكانية ربط أي خدمة جديدة مستقبلاً.

والـWebsite يكون متصل مباشرة بالـBackend والـCRM والـAppointment System والـPatient Database.

## 2. Oxygen Patient App

تطبيق واحد للمريض، وليس App منفصل لكل تخصص.

المريض يدخل بحسابه ويقدر يشوف كل علاقته مع Oxygen.

Basic functions:

- Registration/Login.
- Patient profile.
- Family profiles مستقبلاً.
- Appointments.
- Booking.
- Rescheduling/cancellation.
- Payments.
- Invoices/receipts.
- Subscriptions.
- Packages.
- Remaining sessions.
- Notifications.
- Reminders.
- Medical documents.
- Lab reports.
- X-rays / scans.
- Prescriptions/instructions حسب ما يسمح به النظام.
- Treatment plans.
- Progress.
- Measurements.
- Before/after photos حسب الخدمة والموافقة.
- Communication.
- Follow-up.

## 3. Patient Health Passport

عايز كل مريض يكون عنده:

> **OXYGEN HEALTH PASSPORT**

يبقى عنده Timeline كامل لتعامله مع Oxygen.

مثلاً:

- Visits.
- Diagnoses.
- Assessments.
- Measurements.
- Weight history.
- Body composition.
- Nutrition plans.
- Physiotherapy plans.
- Progress.
- Uploaded labs/reports.
- Treatment history.
- Follow-up history.
- Appointments.
- Packages.
- Subscriptions.

ويكون المريض شايف الجزء المسموح له يشوفه، والـmedical team يشوف البيانات حسب الـpermissions.

## 4. Clinic Management System

ده الجزء الداخلي اللي يستخدمه:

- Reception.
- Doctors.
- Nutrition specialists.
- Physiotherapists.
- Assistants.
- Managers.
- Branch managers.
- Admin.
- Management.

ويكون فيه Role-Based Access.

يعني كل شخص يشوف ويعدل فقط الحاجات المسموح له بها.

## 5. Branch Management

لازم النظام من البداية يكون Multi-Branch.

الفروع الحالية/المخططة لـOxygen لازم تدخل كـBranches مستقلة، مع إمكانية إضافة أي فرع جديد مستقبلاً.

كل Branch يكون له:

- Staff.
- Doctors.
- Rooms.
- Services.
- Schedule.
- Appointments.
- Revenue.
- Expenses.
- Patients.
- Packages.
- Performance.
- KPIs.

وأنا عايز أقدر من الـCEO Dashboard أشوف كل الفروع منفصلة أو كلها مع بعض.

## 6. Appointment System

نظام مواعيد كامل.

المريض يحجز من:

- Website.
- App.
- Reception.
- CRM.
- WhatsApp/integration مستقبلاً.

ويظهر للـReception والطبيب مباشرة.

لازم يكون فيه:

- Calendar.
- Doctor availability.
- Branch availability.
- Room availability.
- Service duration.
- Booking status.
- Confirmed.
- Cancelled.
- Rescheduled.
- Completed.
- No-show.
- Waiting list مستقبلاً.

والنظام يعمل Reminders تلقائية.

## 7. CRM

ده من أهم أجزاء المشروع.

أي Lead يدخل من:

- Facebook.
- Instagram.
- TikTok.
- Website.
- WhatsApp.
- Phone.
- Referral.
- Walk-in.
- Campaign.

يتسجل كـLead.

ثم:

**Lead → Contacted → Qualified → Booked → Visited → Assessment → Program → Paid → Treatment → Follow-up → Renewal → Referral**

عايز أعرف في كل مرحلة المريض واقف فين.

وأعرف:

- مصدر الـLead.
- الحملة.
- الموظف المسؤول.
- هل اتواصلنا معه؟
- هل حجز؟
- هل حضر؟
- هل اشترى؟
- اشترى إيه؟
- دفع كام؟
- هل رجع؟
- هل جدد؟
- هل عمل Referral؟

## 8. Clinical Modules

البرنامج لازم يكون Modular بحيث نقدر نضيف تخصصات بدون ما نعيد بناء النظام.

### Nutrition

يشمل:

- Assessment.
- Medical history.
- Anthropometrics.
- Weight.
- Height.
- BMI.
- Body composition.
- Measurements.
- Nutrition plan.
- Follow-up.
- Progress charts.
- Food diary.
- Calorie/macronutrient tracking حسب البرنامج.
- Goals.
- Adherence.
- Reports.

### Physiotherapy

يشمل:

- Initial assessment.
- Diagnosis/referral.
- Pain assessment.
- Functional assessment.
- ROM.
- Strength.
- Treatment plan.
- Sessions.
- Exercises.
- Home exercise program.
- Exercise videos.
- Progress.
- Reassessment.
- Discharge.
- Maintenance/follow-up.

والـPhysio يقدر يرسل للمريض برنامج Home Exercise من خلال التطبيق.

### Dermatology

يشمل:

- Consultation.
- Medical history.
- Skin assessment.
- Diagnosis.
- Treatment plan.
- Follow-up.
- Progress photos.
- Treatment timeline.
- Reminders.
- Online follow-up إذا كان مناسبًا طبيًا.
- Patient education.

### Internal Medicine / Metabolic Health

يشمل:

- Medical history.
- Vitals.
- Lab results.
- Diagnoses.
- Medications.
- Follow-up.
- Chronic disease tracking.
- BP/glucose/weight tracking حسب الحالة.
- Reports.
- Follow-up reminders.

والنظام لازم يكون قابل لإضافة تخصصات أخرى مستقبلاً.

## 9. Programs

مش عايز الخدمات كلها تكون مجرد قائمة.

عايز النظام يسمح ببناء:

> **Programs / Journeys**

مثلاً:

### Secret Seven

**Assessment → Plan → Treatment → Follow-up → Progress → Stabilization → Maintenance**

والنظام يعرف المريض في أي مرحلة.

وكذلك أي برنامج جديد نعمله مستقبلاً.

## 10. Packages

كل خدمة ممكن تكون:

- Single session.
- Package.
- Subscription.
- Membership.
- Program.

والنظام يعرف:

- Price.
- Paid.
- Used.
- Remaining.
- Expiry.
- Renewal.
- Discounts.

## 11. Digital Services — ودي نقطة أساسية جدًا

إحنا مش بنعمل App مجاني فقط.

إحنا عايزين Digital Products المريض يدفع مقابلها.

أمثلة:

### Oxygen Online Nutrition

- Online assessment.
- Nutrition plan.
- Follow-up.
- Progress tracking.
- Food diary.
- Notifications.
- Communication.
- Renewals.

### Oxygen Physio Home

- Personalized home exercise.
- Exercise videos.
- Sets/reps/time.
- Reminders.
- Completion tracking.
- Pain/function tracking.
- Physiotherapist review.

### Oxygen Dermatology Follow-up

- Online follow-up.
- Photo tracking.
- Treatment timeline.
- Reminders.
- Progress.

### Chronic Care / Metabolic Follow-up

حسب التخصص والحالة:

- Weight.
- BP.
- Glucose.
- Labs.
- Medication list.
- Follow-up.
- Alerts/reminders.

### Oxygen Membership

Digital benefits + selected Oxygen benefits حسب الباقة.

### Family Account

إمكانية إدارة أفراد الأسرة مستقبلاً.

### Corporate Wellness

مستقبلاً نقدر نعمل Corporate accounts للشركات وموظفيها.

## 12. Payment System

لازم يكون فيه:

- Online payment.
- Subscription payment.
- Package payment.
- Invoice.
- Payment history.
- Refunds حسب الصلاحيات.
- Discount codes.
- Membership.
- Renewal.

ونقدر نربط Payment Gateway مناسب.

## 13. Subscription Engine

مهم جدًا.

لازم النظام يدعم:

- Monthly.
- Quarterly.
- Annual.
- Auto-renewal إذا كان مناسبًا.
- Expiry.
- Grace period.
- Upgrade.
- Downgrade.
- Cancellation.
- Renewal reminders.

لأن الـDigital Business هيكون قائم على recurring revenue.

## 14. Notifications

Push notifications + Email/SMS/WhatsApp integration حسب المتاح.

مثلاً:

- Appointment reminder.
- Payment reminder.
- Follow-up due.
- Package ending.
- Subscription ending.
- Exercise reminder.
- Nutrition reminder.
- New plan.
- Doctor message.
- Important clinic notification.

## 15. Management Dashboard

أنا كـOwner عايز Dashboard واحدة.

أفتحها أشوف:

### Today

- Patients.
- New patients.
- New leads.
- Appointments.
- No-shows.
- Revenue.
- Packages sold.
- Digital subscriptions.
- Renewals.

### Branch Performance

كل فرع:

- Revenue.
- Patients.
- New patients.
- Conversion.
- Average revenue per patient.
- Services.
- Staff performance.
- No-show.
- Retention.

### Digital Business

- Active subscribers.
- New subscribers.
- Churn.
- Renewal rate.
- MRR/ARR.
- Digital revenue.
- Revenue by product.
- Revenue by acquisition source.

### CRM

- Leads.
- Conversion.
- Lead source.
- Campaign performance.
- Booking conversion.
- Sales conversion.

## 16. Patient Journey Dashboard

عايز أعرف Oxygen بتخدم المريض إزاي من أول ما يسمع عنا لحد ما يخرج من الـjourney.

مثلاً:

**Lead → Booking → Assessment → Program → Treatment → Follow-up → Result → Renewal → Referral.**

ونقدر نعرف أين نفقد المرضى.

## 17. Reports & Analytics

عايز Reports قابلة للتصفية:

- By branch.
- By doctor.
- By service.
- By specialty.
- By program.
- By date.
- By source.
- By staff.

والنظام يطلع KPIs.

## 18. Staff Management

كل موظف له account وصلاحيات.

مثلاً:

| | |
|---|---|
| **Reception:** | → appointments + patient basic info + payments. |
| **Nutrition:** | → nutrition patients + clinical module. |
| **Physio:** | → physio patients + treatment. |
| **Doctor:** | → medical records الخاصة به. |
| **Manager:** | → branch dashboard. |
| **CEO:** | → everything. |
| **Admin:** | → system management. |

## 19. Inventory

مستقبلاً نحتاج:

- Products.
- Consumables.
- Stock.
- Purchases.
- Usage.
- Low stock alerts.
- Branch stock.

خصوصًا لو عندنا خدمات تحتاج مواد/مستلزمات.

## 20. Finance

مش لازم يكون Accounting system كامل من أول يوم، لكن لازم يكون فيه Business Finance layer:

- Revenue.
- Payments.
- Packages.
- Subscriptions.
- Discounts.
- Refunds.
- Branch revenue.
- Service revenue.
- Digital revenue.
- Staff commissions إذا احتجنا.
- Expenses مستقبلاً.

## 21. Referral System

عايز Referral Engine.

المريض يقدر يعمل referral.

ونعرف:

- مين جاب مين.
- Referral source.
- Rewards/discounts لو عملنا نظام Referral.

## 22. Reviews

بعد الخدمة، النظام يقدر يطلب من المريض تقييم تجربته.

ويفرق بين:

- Internal feedback.
- Public review request.

ونقدر نتابع patient satisfaction.

## 23. Content / Education

ممكن يكون فيه داخل التطبيق:

- Videos.
- Articles.
- Exercise videos.
- Nutrition education.
- Medical education.
- Program-specific content.

ويكون المحتوى مربوط بالـProgram أو التخصص.

## 24. AI — لكن كمرحلة داخل النظام وليس كبديل للطبيب

مستقبلاً نريد إمكانية إضافة AI features مثل:

- Smart food logging.
- Patient education assistant.
- Summarization.
- Administrative assistant.
- Smart reminders.
- Data analysis.
- Patient engagement.

لكن أي AI طبي لازم يكون له صلاحيات وحدود واضحة، ولا يستبدل القرار الطبي.

## 25. Security & Privacy

ده جزء أساسي جدًا.

لازم يكون فيه:

- Role-based access.
- Audit log.
- Backup.
- Encryption حيث يلزم.
- Secure authentication.
- Password policies.
- Session management.
- Data recovery.
- Activity logs.
- Data export.
- Data deletion/retention policies حسب المتطلبات القانونية.

وخصوصًا إننا بنتعامل مع بيانات طبية.

## 26. Ownership & Access

الـSoftware بالكامل ملك Oxygen Clinics.

يشمل:

- Source code.
- Backend.
- Frontend.
- Mobile Apps.
- Database.
- UI/UX.
- Documentation.
- Custom integrations.
- Domain.
- Cloud accounts.
- App Store accounts.
- Google Play accounts.
- Analytics.
- APIs.
- Data.

لازم Oxygen يكون عندها ownership/access حقيقي، وليس مجرد استخدام للبرنامج.

وأنا عايز يكون فيه Documentation بحيث لو احتجنا مستقبلاً إضافة Developer أو Team آخر نقدر نعمل ده.

## 27. أهم حاجة: Architecture تكون قابلة للتوسع

مش عايزين Software معمول فقط لفرع واحد.

لازم من البداية يكون:

> **Multi-branch**

وقابل مستقبلاً لـ:

> **Multi-specialty**

وقابل لـ:

> **Digital Services**

وقابل لـ:

> **Subscriptions**

وقابل لـ:

> **Corporate**

وقابل مستقبلاً لو قررنا نحول جزء من النظام إلى SaaS أو نستخدمه مع مراكز أخرى.

لكن لا نحتاج نبيع النظام للغير من أول يوم.

## 28. الشكل النهائي اللي أنا متخيله

عندنا 4 مستويات:

```text
PATIENT
Website + App
        ↓
CLINIC
Doctors + Reception + Clinical + Scheduling
        ↓
MANAGEMENT
CRM + Finance + KPIs + Branch Dashboard
        ↓
DIGITAL BUSINESS
Subscriptions + Online Programs + Memberships + Corporate + Future Products
```

وكلهم مربوطين بـ:

> **OXYGEN CORE**

## 29. أهم حاجة في المشروع

أنا مش عايز نبدأ بالبرمجة مباشرة.

عايز الأول نعمل:

| | |
|---|---|
| **Phase 1** | Product Requirements. |
| **Phase 2** | User Journey. |
| **Phase 3** | Workflow لكل Role. |
| **Phase 4** | Database/Data Structure. |
| **Phase 5** | System Architecture. |
| **Phase 6** | UI/UX Prototype. |
| **Phase 7** | Development. |
| **Phase 8** | Testing. |
| **Phase 9** | Pilot على Oxygen. |
| **Phase 10** | Launch. |

## 30. وأريد منك أنت كـDeveloper

بعد ما تشوف الـBrief ده، عايز منك ترجعلي بـ:

1. Proposed System Architecture.
2. Modules List.
3. Database structure المقترحة.
4. Web/App/Dashboard structure.
5. User roles & permissions.
6. What should be MVP.
7. What should be Phase 2.
8. What should be Phase 3.
9. Development timeline.
10. Infrastructure requirements.
11. Server/cloud requirements.
12. Maintenance requirements.
13. Security architecture.
14. Backup/recovery plan.
15. App Store/Google Play requirements.
16. APIs/integrations المطلوبة.
17. Third-party services التي سنحتاجها.
18. Estimated running costs.
19. Technical risks.
20. طريقة تسليم الـSource Code والـDocumentation والـAccounts لـOxygen.

وأهم حاجة:

أنا لا أريد أن نقيدك بتكنولوجيا معينة.

اختار الـtechnology stack الذي تراه الأفضل، بشرط أن يكون:

- Scalable.
- Secure.
- Maintainable.
- Fast.
- قابل للتطوير.
- وأقدر أغير Developer أو أضيف Developers مستقبلاً بدون ما Oxygen تصبح رهينة لشخص واحد.

---

## الهدف النهائي

Oxygen Clinics لا تكون مجرد عيادة لديها Software.

الهدف أن يكون عندنا:

> **OXYGEN DIGITAL HEALTH ECOSYSTEM**

يربط المريض بالعيادة وبالأطباء وبالخدمات الرقمية وبالمتابعة وبالإدارة، ويكون قابلاً للتوسع مع نمو Oxygen.

وده يعتبر Initial Product Brief، وبعد ما تراجعه عايز نقعد نحوله إلى Detailed Software Requirements Document ونحدد كل Screen وكل Workflow وكل Feature قبل بداية التطوير.
