# 09 — Infrastructure, Cloud, Maintenance, Backup & Costs

> بيرد على: **DEL-10 Infrastructure** · **DEL-11 Server/cloud** · **DEL-12 Maintenance** · **DEL-14 Backup/recovery** · **DEL-18 Running costs**.

---

## 1. البيئات (Environments)

| البيئة | الغرض | الداتا |
|---|---|---|
| **Local** | جهاز المطور: Docker Compose (Postgres، Redis، MinIO، Mailpit، Gotenberg) | داتا وهمية (Seed) |
| **Staging** | نسخة طبق الأصل من Production، للـDemos والـUAT | داتا وهمية أو Anonymized — **ممنوع داتا مرضى حقيقية** |
| **Production** | التشغيل الحقيقي | الداتا الحقيقية |

---

## 2. Infrastructure Requirements

| المتطلب | التفاصيل |
|---|---|
| **Containers** | كل خدمة Docker image، فنقدر نشغلها على أي Cloud |
| **Compute** | API (2 أو أكتر، Stateless) · Workers (1 أو أكتر) · Website Next.js (1–2) · Gotenberg (1) · الداشبورد ملفات Static على CDN |
| **Database** | Managed PostgreSQL + Standby (HA) + Backups أوتوماتيك + Point-in-Time Recovery |
| **Cache / Queues** | Managed Redis |
| **Storage** | S3-compatible Object Storage + Versioning |
| **Edge** | Cloudflare: DNS + WAF + CDN + SSL |
| **Secrets** | Secrets manager، ومفيش أي Password في الكود |
| **CI/CD** | GitHub Actions + Container registry + Expo EAS للموبايل |
| **Monitoring** | Errors + Uptime + Logs + Alerts |
| **Email** | دومين متوثق (SPF / DKIM / DMARC) عشان الإيميلات متروحش Spam |

---

## 3. Server / Cloud Requirements

### الاختيار

| | **DigitalOcean** (مقترح للـMVP) | **AWS** (للتوسع أو لو القانون طلب Region معيّن) |
|---|---|---|
| API + Workers + Website | App Platform (Docker) | ECS Fargate |
| Dashboard | Static + CDN | S3 + CloudFront |
| Database | Managed PostgreSQL + Standby | RDS PostgreSQL Multi-AZ |
| Redis | Managed Valkey / Redis | ElastiCache |
| Storage | Spaces | S3 |
| Secrets | App Platform encrypted env | Secrets Manager |
| السهولة | سهل جدًا، مناسب لفريق صغير | أقوى، بس محتاج خبرة DevOps أكتر |
| التكلفة | أقل | أعلى |

**التوصية:**
- **الـMVP والـPilot على DigitalOcean:** أبسط وأرخص وكله Managed، ومش هيتعبك.
- **ننقل لـAWS** لو الحجم كبر جدًا، أو لو Oxygen بتشتغل في بلد قانونها بيطلب استضافة البيانات الصحية جوه البلد (زي بعض دول الخليج).
- عشان كل حاجة Docker + PostgreSQL + S3-compatible + Terraform، النقل بياخد **أيام مش شهور**.

**الـRegion:** الأقرب للمرضى في حدود القانون. لمصر غالبًا Frankfurt (DO `FRA1` / AWS `eu-central-1`).
⚠️ **لازم مراجعة قانونية لنقل البيانات الصحية بره البلد** قبل ما نختار.

### المواصفات المبدئية

| المكون | MVP / Pilot | Growth |
|---|---|---|
| API | 2 × (1 vCPU / 2 GB) | Autoscaling 2–6 |
| Workers | 1 × (1 vCPU / 2 GB) | 2–3 |
| Website (Next.js) | 1–2 × (1 vCPU / 1–2 GB) | 2–4 |
| Dashboard | Static على CDN | Static على CDN |
| PostgreSQL | 2 vCPU / 4 GB / 60–100 GB + Standby | 4–8 vCPU / 16 GB + Read replica |
| Redis | 1 GB | 2–4 GB |
| Object Storage | ~250 GB كبداية | TBs (صور وأشعة وفيديو) |

### أهداف الأداء والتشغيل (SLOs)

| المؤشر | الهدف |
|---|---|
| Availability | 99.5% في الـMVP ← 99.9% بعدها |
| سرعة الـAPI | p95 أقل من 300ms |
| فتح الداشبورد | أقل من ثانيتين |
| RPO (أقصى داتا ممكن تضيع) | 15 دقيقة |
| RTO (أقصى وقت للرجوع) | 4 ساعات في الـMVP ← أقل من ساعة بعدها |

---

## 4. Maintenance Requirements

| التكرار | الشغل |
|---|---|
| **يومي (أوتوماتيك)** | Backups · مراقبة الأخطاء والـUptime والـQueues · تنبيهات الدفع أو الإشعارات اللي فشلت |
| **أسبوعي** | مراجعة الأخطاء الجديدة (Sentry) · الأداء · الـWebhooks والـLeads اللي فشلت |
| **شهري** | تحديثات أمان المكتبات (Renovate) · مراجعة التكلفة · مراجعة الـAlerts |
| **كل 3 شهور** | **اختبار استرجاع Backup** · مراجعة الصلاحيات · تحديث صور Node والـOS |
| **سنوي** | ترقية Expo SDK (Google بتطلب Target API جديد كل سنة) · ترقية PostgreSQL · Penetration test · تجديد حساب Apple · مراجعة سياسة الخصوصية · Disaster recovery drill كامل |

### الدعم بعد الإطلاق (SLA مقترح)

| الأولوية | مثال | أول رد | الحل |
|---|---|---|---|
| **P1 حرج** | النظام واقع / الدفع واقف / تسريب بيانات | ساعة | 4–8 ساعات |
| **P2 عالي** | ميزة أساسية واقفة في فرع | 4 ساعات | 1–2 يوم |
| **P3 متوسط** | Bug وليه حل بديل | يوم عمل | في الـSprint الجاي |
| **P4** | تحسينات | — | حسب الأولوية |

**الفريق بعد الإطلاق:** على الأقل مطور واحد متفرغ (صيانة + تطويرات صغيرة) + On-call. ومع Phase 2 الفريق بيكمّل.

---

## 5. Backup & Recovery Plan

### طبقات الحماية

1. **Backups الـPostgreSQL الـManaged:** يومي + **Point-in-Time Recovery** (نرجع لأي دقيقة في آخر 7 أيام على الأقل).
2. **Standby node:** لو السيرفر الأساسي وقع، التاني بيشتغل في دقايق.
3. **Backup مستقل بره الـProvider:** كل ليلة `pg_dump` مشفّر بيتحفظ عند Provider تاني (أو حساب منفصل) بـ**Object Lock (Immutable)**، عشان يحمينا من الـRansomware أو اختراق الحساب الأساسي أو قفله.
4. **Object Storage:** Versioning (الملف اللي اتمسح بيرجع) + نسخة يومية لمكان تاني.
5. **Infrastructure as Code + Docker images:** نقدر نقوّم البيئة كلها من الصفر.

### مدة الاحتفاظ (GFS)

| النوع | المدة |
|---|---|
| يومي | 30 يوم |
| أسبوعي | 12 أسبوع |
| شهري | 12 شهر، وبعدها سنوي حسب مدة حفظ السجلات الطبية اللي القانون بيطلبها |

### السيناريوهات

| السيناريو | الحل | الوقت المتوقع |
|---|---|---|
| حد مسح داتا بالغلط | Point-in-Time لدقيقة قبل المسح في بيئة منفصلة، ونرجّع الداتا المطلوبة بس | ساعات |
| سيرفر الداتابيز الأساسي وقع | Failover للـStandby | دقايق |
| Region كاملة وقعت | Restore في Region تانية من الـBackup المستقل + Terraform | 4–8 ساعات |
| Ransomware أو اختراق الحساب | Restore من الـBackup الـImmutable في الحساب المنفصل + تغيير كل الـSecrets | ساعات ليوم |
| ملف طبي اتمسح من الـStorage | Versioning | دقايق |
| خلاف مع الـProvider أو قفل الحساب | الـBackup المستقل + IaC ← Provider تاني | أيام |

### الاختبار

- **كل 3 شهور** بنرجّع Backup في بيئة منفصلة ونتأكد إنه شغال، ونسجّل الوقت اللي أخده.
- Runbook مكتوب خطوة بخطوة: `docs/runbooks/restore.md`.
- **الـBackup اللي متجربش استرجاعه، اعتبره مش موجود.**

---

## 6. Estimated Running Costs

> ⚠️ أرقام **تقديرية بالدولار** حسب أسعار مقدمي الخدمة المعروفة وقت كتابة الملف. لازم تتراجع قبل التعاقد، وبتتغير حسب الاستخدام.
> مرتبات فريق التطوير مش محسوبة هنا.

### ثابت شهري: MVP / Pilot (1–3 فروع)

| البند | التقدير الشهري |
|---|---|
| Compute (API × 2 + Worker + Website + Gotenberg) | $60–120 |
| Managed PostgreSQL + Standby | $60–120 |
| Managed Redis | $15–30 |
| Object Storage + CDN | $5–20 |
| Backup مستقل (Storage تاني) | $5–15 |
| Cloudflare | $0–25 |
| Sentry | $0–30 |
| Uptime + Logs | $0–30 |
| Email (SES / Resend) | $0–20 |
| Expo EAS | $0–20 لما نبدأ التطبيق (الـFree tier ممكن يكفي في الأول) |
| **الإجمالي** | **~$150–450 في الشهر** |

### ثابت شهري: Growth (5–15 فرع + مشتركين Digital)

**~$600–1,500 في الشهر** (Autoscaling، Read replica، داتابيز أكبر، CDN للفيديوهات).

### متغيّر (حسب الاستخدام)

| البند | بيتحسب إزاي |
|---|---|
| WhatsApp Business (Meta) | لكل رسالة Template، حسب الدولة ونوع الرسالة (Utility / Marketing / Authentication) |
| SMS | لكل رسالة حسب المزود، وهنستخدمه للـOTP وكبديل بس |
| Payment gateway | نسبة من كل عملية + رسوم ثابتة صغيرة (حسب العقد) |
| Apple / Google (لو اضطرينا للـIn-App Purchase) | 15–30% من الاشتراكات الرقمية اللي بتتباع جوه التطبيق |
| Video calls (P2) | بالدقيقة لكل مشارك |
| Video streaming للتمارين (P2) | بالدقائق المتخزنة والمتشافة، لو استخدمنا خدمة Streaming |
| AI (P3) | بالاستخدام |

### مرة واحدة / سنوي

| البند | التكلفة |
|---|---|
| Apple Developer Program (Organization) | $99 في السنة |
| Google Play Console | $25 مرة واحدة |
| D-U-N-S Number | مجاني |
| Domain | ~$10–50 في السنة |
| Penetration test | حسب الجهة (قبل الإطلاق + سنويًا) |
| GitHub / Figma / Bitwarden | اشتراكات بسيطة بعدد المستخدمين |

---

## 7. المراقبة والتنبيهات

| بنراقب إيه | التنبيه |
|---|---|
| Uptime (الويبسايت، الـAPI، الداشبورد) | خلال 1–2 دقيقة |
| ارتفاع الأخطاء (Sentry) | فوري |
| بطء الـAPI (p95) | لو عدّى الحد 10 دقايق |
| الـQueues متأخرة (تذكيرات متبعتتش) | فوري |
| دفع أو Webhooks فشلت | فوري |
| نسبة فشل الإشعارات | يومي |
| الداتابيز (CPU، المساحة، الاتصالات) | عند 80% |
| نجاح / فشل الـBackup | يومي |
| انتهاء الـSSL أو الدومين | قبلها بـ30 يوم |
| أمان: محاولات دخول فاشلة كتير، أو Break-the-glass | فوري |
