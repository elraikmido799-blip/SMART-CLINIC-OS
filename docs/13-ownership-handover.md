# 13 — Ownership & Handover (الملكية وطريقة التسليم)

> بيرد على: **DEL-20 طريقة تسليم الـSource Code والـDocumentation والـAccounts** + §26 (OWN-01 → OWN-17)
> + الشرط: *"أقدر أغير Developer أو أضيف Developers بدون ما Oxygen تصبح رهينة لشخص واحد."*

---

## المبدأ: Oxygen بتملك من أول يوم، مش "تسليم في الآخر"

أكبر غلطة بتحصل: المطور يفتح الحسابات باسمه، وبعدين "يسلّم" في الآخر.
**الصح:** كل حساب بيتفتح باسم Oxygen من أول يوم، والمطورين بيبقوا **Members بصلاحيات محدودة**.
فلو أي حد مشي، Oxygen بتشيل صلاحياته وخلاص، ومفيش حاجة "تتسلم".

---

## 1. الحسابات (Checklist من أول يوم)

| # | الحساب | باسم مين | المالك | المطور بياخد إيه |
|---|---|---|---|---|
| 1 | Domain registrar | Oxygen | Oxygen | ولا حاجة (الـDNS عن طريق Cloudflare) |
| 2 | Cloudflare | Oxygen | Oxygen | Member (DNS / WAF) |
| 3 | Google Workspace (إيميلات الشركة) | Oxygen | Oxygen | إيميل على دومين الشركة للشغل |
| 4 | **GitHub Organization** | Oxygen | 2 Owners من Oxygen | Member / Maintainer |
| 5 | **Cloud** (DigitalOcean / AWS) | Oxygen (والفاتورة على كارت Oxygen) | Oxygen | مستخدم بصلاحيات محددة |
| 6 | **Apple Developer** (Organization) | Oxygen | Account Holder من Oxygen | Admin / Developer |
| 7 | **Google Play Console** | Oxygen | Owner من Oxygen | Admin على التطبيق |
| 8 | Expo (EAS) Organization | Oxygen | Oxygen | Developer |
| 9 | **Payment gateway** | Oxygen (على حسابها البنكي) | Oxygen | مفاتيح الـAPI عن طريق الـVault |
| 10 | Meta Business Manager + WhatsApp Business + Ad accounts | Oxygen | Oxygen | Partner / Developer access |
| 11 | TikTok for Business | Oxygen | Oxygen | Member |
| 12 | مزود الـSMS | Oxygen | Oxygen | مفاتيح عن طريق الـVault |
| 13 | خدمة الإيميل (SES / Resend) | Oxygen | Oxygen | مفاتيح عن طريق الـVault |
| 14 | Sentry + Monitoring | Oxygen | Oxygen | Member |
| 15 | Google Analytics / Tag Manager / PostHog | Oxygen | Oxygen | Editor |
| 16 | Figma Team | Oxygen | Oxygen | Editor |
| 17 | **Bitwarden Organization** (كلمات السر) | Oxygen | Oxygen | Collections محددة بس |
| 18 | إدارة المشروع (Linear / Jira / GitHub Projects) | Oxygen | Oxygen | Member |

**قواعد:**
- **2 Owners من Oxygen** على كل حساب مهم، وكلهم بـ2FA، والـRecovery codes محفوظة في Bitwarden.
- **الفواتير على كارت Oxygen**، مش على كارت المطور.
- الحسابات بتتفتح بإيميلات على دومين Oxygen (زي `tech@<domain>`)، مش Gmail شخصي.

---

## 2. الكود (Source Code)

- الـRepo في **GitHub Organization بتاعة Oxygen من أول Commit**.
- **Branch protection:** مفيش Push مباشر على `main`، وكل تغيير بـPull Request + Review + Tests.
- **Releases:** Tag + Changelog لكل إصدار.
- **Licenses:** كل المكتبات Open source بتراخيص بتسمح بالاستخدام التجاري (MIT / Apache …)، وبنطلع قايمة بيها (SBOM).
- **العقد** لازم يكون فيه:
  - **نقل الملكية الفكرية (IP assignment)** لـOxygen: الكود، التصميمات، التوثيق.
  - NDA.
  - DPA (لأن المطور ممكن يوصل لبيانات مرضى).

---

## 3. التوثيق: عشان أي Developer جديد يكمّل

| الوثيقة | فيها إيه | مكانها |
|---|---|---|
| **README** | تشغيل المشروع على جهاز جديد في أقل من 30 دقيقة | Root |
| **docs/** (الملفات دي) | المتطلبات، المعمار، الخطة | `docs/` |
| **ADRs** | كل قرار معماري وسببه | `docs/adr/` |
| **API Reference** | OpenAPI + Swagger | بيتولد من الكود |
| **Database docs** | ERD + شرح الجداول | من الـPrisma schema + `docs/` |
| **DEPLOYMENT** | النشر، البيئات، أسماء الـEnvironment variables (من غير القيم السرية) | `docs/` |
| **RUNBOOKS** | استرجاع Backup، Incident، تغيير Secrets، إضافة فرع، إضافة تخصص، رفع إصدار للمتاجر | `docs/runbooks/` |
| **CONTRIBUTING** | أسلوب الكود، الـBranches، الـPRs، الـCommits | Root |
| **SECURITY** | سياسة الأمان والإبلاغ عن الثغرات | Root |
| **أدلة المستخدمين** | دليل لكل Role (PDF + فيديوهات قصيرة) | Drive بتاع Oxygen |
| **Onboarding guide** | أول أسبوع لأي Developer جديد | `docs/` |

---

## 4. التسليم مع كل إصدار

- [ ] Tag + Release notes على GitHub
- [ ] الـMigrations موجودة ومتجربة
- [ ] التوثيق متحدث (API + docs + runbooks)
- [ ] تقرير الاختبارات (Automated + UAT sign-off)
- [ ] الـBuilds مرفوعة على حسابات Oxygen في المتاجر
- [ ] أي Secret جديد متحفظ في Bitwarden بتاع Oxygen
- [ ] Demo متسجل للـFeatures الجديدة

---

## 5. لو المطور أو الفريق اتغير

1. **نقل المعرفة:** جلسات متسجلة (شرح الـArchitecture، جولة في الكود، النشر، الـRunbooks).
2. **فترة تداخل** أسبوعين مع الفريق الجديد لو أمكن.
3. **قبل ما الفريق القديم يمشي**، نتأكد إن الجديد يقدر: يشغّل المشروع، ينشر على Staging، ويرجّع Backup.
4. **سحب صلاحيات** الفريق القديم من كل الحسابات (بالـChecklist اللي فوق) + تغيير أي Secret كانوا يعرفوه.

---

## 6. "اختبار الملكية": 5 أسئلة Oxygen تسألها لنفسها في أي وقت

1. لو المطور اختفى بكرة، نقدر ندخل على كل الحسابات؟
2. الكود كله، وآخر نسخة منه، موجود في GitHub بتاعنا؟
3. نقدر ناخد Backup ونرجّعه من غيره؟
4. أي مطور جديد يقدر يشغّل المشروع من الـREADME لوحده؟
5. فواتير الـCloud و Apple و Google والدومين بتتدفع من حسابنا؟

**لو أي إجابة "لأ"، يبقى فيه مشكلة لازم تتحل فورًا.**
