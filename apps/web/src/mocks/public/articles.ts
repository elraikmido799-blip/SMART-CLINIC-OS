import {
  publicArticleSchema,
  type ListResponse,
  type PublicArticle,
  type PublicArticleDetail,
} from '@/types/public';

/**
 * نفس رد GET /public/articles و GET /public/articles/{slug}.
 * كلام عام وآمن للتجربة بس — المقالات الحقيقية بيكتبها ويراجعها أطباء Oxygen من الداشبورد.
 * الأغلفة null لحد ما الصور توصل (16 · 2.9).
 */
type ArticleSeed = PublicArticleDetail;

const ARTICLES: ArticleSeed[] = [
  {
    id: 'art-desk-back',
    slug: 'desk-back-pain',
    specialty: 'physio',
    title_en: '5 habits that protect your back at a desk job',
    title_ar: '5 عادات بتحمي ضهرك لو شغلك على مكتب',
    excerpt_en: 'Small changes to how you sit and move during the day can make a real difference.',
    excerpt_ar: 'تغييرات صغيرة في طريقة قعدتك وحركتك طول اليوم ممكن تفرق معاك.',
    cover_url: null,
    reading_minutes: 4,
    published_at: '2026-09-20',
    reviewed_by: 'omar-hassan',
    body_en: `Sitting for long hours puts steady pressure on your lower back and neck. You don't need a new office to feel better — start with these habits.

## 1. Move every 30–45 minutes
Stand up, walk to get water, or stretch for one minute. Movement is the simplest way to reduce stiffness.

## 2. Screen at eye level
If you look down at your laptop all day, your neck carries extra load. Raise the screen with a stand or a few books.

## 3. Feet flat, hips back
Sit all the way back in your chair, with your feet flat on the floor.

## 4. Strengthen, don't only stretch
Simple core and back exercises help your body support itself. A physiotherapist can show you the right ones for you.

## 5. Don't ignore pain that lasts
If pain lasts more than two weeks, spreads to your leg, or comes with numbness, **book an assessment**.`,
    body_ar: `القعدة لساعات طويلة بتحط ضغط مستمر على أسفل الضهر والرقبة. مش محتاج مكتب جديد عشان تحس بفرق — ابدأ بالعادات دي.

## 1. اتحرك كل 30–45 دقيقة
قوم، اتمشى تجيب مية، أو اعمل إطالة دقيقة. الحركة أبسط طريقة تقلل التيبّس.

## 2. الشاشة في مستوى عينك
لو بتبص لتحت على اللابتوب طول اليوم، رقبتك بتشيل حمل زيادة. ارفع الشاشة بستاند أو كام كتاب.

## 3. رجليك على الأرض، وضهرك لورا
اقعد لآخر الكرسي، ورجليك مفرودة على الأرض.

## 4. قوّي، مش بس إطالة
تمارين بسيطة لعضلات البطن والضهر بتساعد جسمك يسند نفسه. أخصائي العلاج الطبيعي يقدر يوريك المناسب ليك.

## 5. متتجاهلش الألم اللي بيطوّل
لو الألم طوّل أكتر من أسبوعين، أو نزل لرجلك، أو معاه تنميل، **احجز تقييم**.`,
  },
  {
    id: 'art-knee-stairs',
    slug: 'knee-pain-stairs',
    specialty: 'physio',
    title_en: 'Knee pain on the stairs: what it can mean',
    title_ar: 'ألم الركبة على السلم: ممكن يعني إيه',
    excerpt_en: 'Why stairs are harder on your knees, and when it is time to get checked.',
    excerpt_ar: 'ليه السلم أصعب على ركبتك، وإمتى لازم تتكشف.',
    cover_url: null,
    reading_minutes: 3,
    published_at: '2026-09-05',
    reviewed_by: 'ahmed-hassan',
    body_en: `Going up and down stairs asks your knee to carry several times your body weight. That's why pain often shows up there first.

## Common reasons
- Weak thigh and hip muscles
- Overuse after a sudden increase in activity
- Wear in the joint with age

## What helps
Strengthening the muscles around the knee usually helps more than resting alone. Your physiotherapist will build a plan for your level.

Get checked soon if your knee is **swollen, locks, or gives way**.`,
    body_ar: `الطلوع والنزول على السلم بيخلي ركبتك تشيل أضعاف وزن جسمك. عشان كده الألم غالبًا بيبان هناك الأول.

## أسباب شائعة
- ضعف عضلات الفخذ والحوض
- مجهود زيادة بعد ما النشاط زاد فجأة
- خشونة في المفصل مع السن

## إيه اللي بيساعد
تقوية العضلات اللي حوالين الركبة غالبًا بتفيد أكتر من الراحة لوحدها. أخصائي العلاج الطبيعي هيعملك خطة على قد مستواك.

اتكشف بسرعة لو ركبتك **وارمة، أو بتقفل، أو بتخونك**.`,
  },
  {
    id: 'art-balanced-plate',
    slug: 'balanced-plate',
    specialty: 'nutrition',
    title_en: 'The balanced plate: an easy way to eat better',
    title_ar: 'الطبق المتوازن: طريقة سهلة تاكل أحسن',
    excerpt_en: 'No counting, no strict rules — just a simple way to build your meals.',
    excerpt_ar: 'من غير عد سعرات ولا قواعد صعبة — طريقة بسيطة تبني بيها وجبتك.',
    cover_url: null,
    reading_minutes: 3,
    published_at: '2026-09-28',
    reviewed_by: 'sara-mahmoud',
    body_en: `A balanced plate is a simple guide you can use at home or when eating out.

## Fill your plate like this
- **Half:** vegetables and salad
- **A quarter:** protein — chicken, fish, eggs, beans or lentils
- **A quarter:** whole grains — brown bread, rice or potatoes

Add water instead of sugary drinks. Your nutritionist can adjust the plate for your goals and health.`,
    body_ar: `الطبق المتوازن دليل بسيط تقدر تستخدمه في البيت أو بره.

## املا طبقك كده
- **النص:** خضار وسلطة
- **الربع:** بروتين — فراخ، سمك، بيض، فول أو عدس
- **الربع:** نشويات كاملة — عيش بلدي، رز أو بطاطس

واشرب مية بدل المشروبات اللي فيها سكر. أخصائي التغذية يقدر يظبط الطبق على هدفك وحالتك.`,
  },
  {
    id: 'art-ramadan',
    slug: 'healthy-iftar',
    specialty: 'nutrition',
    title_en: 'A lighter iftar without feeling hungry',
    title_ar: 'فطار أخف من غير ما تجوع',
    excerpt_en: 'How to break your fast gently and stay full until suhoor.',
    excerpt_ar: 'إزاي تفطر بالراحة وتفضل شبعان لحد السحور.',
    cover_url: null,
    reading_minutes: 4,
    published_at: '2026-08-15',
    reviewed_by: null,
    body_en: `Start with water and dates, wait a little, then have your meal. Eating slowly gives your body time to feel full.

## Tips
- Soup and salad first
- Grilled or baked instead of fried
- Keep sweets small, and not every day`,
    body_ar: `ابدأ بمية وتمر، استنى شوية، وبعدين كُل وجبتك. الأكل بالراحة بيدي جسمك وقت يحس بالشبع.

## نصايح
- الشوربة والسلطة الأول
- مشوي أو في الفرن بدل المقلي
- الحلويات بكمية صغيرة، ومش كل يوم`,
  },
  {
    id: 'art-sunscreen',
    slug: 'sunscreen-basics',
    specialty: 'derm',
    title_en: 'Sunscreen basics for Egyptian summers',
    title_ar: 'أساسيات واقي الشمس في صيف مصر',
    excerpt_en: 'Which SPF, how much, and how often — explained simply.',
    excerpt_ar: 'أنهي SPF، وقد إيه، وكل قد إيه — بشكل بسيط.',
    cover_url: null,
    reading_minutes: 3,
    published_at: '2026-07-10',
    reviewed_by: 'mona-el-sayed',
    body_en: `Daily sunscreen helps protect your skin from sun damage and dark spots.

## The basics
- Use **SPF 30 or higher**
- Apply enough to cover your face and neck
- Reapply every 2–3 hours when you're outside

If you have acne-prone or sensitive skin, ask your dermatologist which type suits you.`,
    body_ar: `واقي الشمس كل يوم بيساعد يحمي بشرتك من ضرر الشمس والبقع الغامقة.

## الأساسيات
- استخدم **SPF 30 أو أعلى**
- حط كمية تغطي الوش والرقبة
- جدده كل 2–3 ساعات لما تكون بره

لو بشرتك حساسة أو بيطلع فيها حبوب، اسأل دكتور الجلدية أنهي نوع يناسبك.`,
  },
  {
    id: 'art-blood-pressure',
    slug: 'blood-pressure-at-home',
    specialty: 'internal',
    title_en: 'Measuring your blood pressure at home, the right way',
    title_ar: 'إزاي تقيس ضغطك في البيت صح',
    excerpt_en: 'A few simple steps make your home readings much more reliable.',
    excerpt_ar: 'خطوات بسيطة بتخلي قياسات البيت أدق بكتير.',
    cover_url: null,
    reading_minutes: 3,
    published_at: '2026-08-30',
    reviewed_by: null,
    body_en: `Home readings help your doctor see the full picture.

## Before measuring
1. Rest for 5 minutes, seated
2. No coffee or smoking for 30 minutes
3. Arm supported at heart level

Write down your readings with the date and time, and bring them to your next visit.`,
    body_ar: `قياسات البيت بتساعد دكتورك يشوف الصورة كاملة.

## قبل ما تقيس
1. ارتاح 5 دقايق وإنت قاعد
2. من غير قهوة أو سجاير لمدة 30 دقيقة
3. دراعك مسنود في مستوى القلب

اكتب القياسات بالتاريخ والساعة، وهاتها معاك في الزيارة الجاية.`,
  },
];

// الـList من غير الكلام والمراجع (الـSchema بتشيل أي حقل زيادة)، والأحدث الأول
export const articlesMock: ListResponse<PublicArticle> = {
  data: [...ARTICLES]
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .map((article) => publicArticleSchema.parse(article)),
};

export const articleDetailMock = (slug: string): PublicArticleDetail | undefined =>
  ARTICLES.find((article) => article.slug === slug);
