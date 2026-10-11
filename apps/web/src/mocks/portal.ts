import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import { addDays, cairoIso, todayInCairo } from '@/lib/dates';
import type { Booking } from '@/types/booking';
import type {
  Invoice,
  Measurement,
  PatientDocument,
  RescheduleBody,
  TimelineEntry,
  UpdateProfileBody,
  UploadDocumentBody,
} from '@/types/portal';
import { buildBooking, isSlotFree } from './booking';
import { readDb, writeDb, type MockDb, type PortalData } from './db';

/**
 * البوابة في الـMocks. أول ما مريض جديد يدخل، بنملا له "تاريخ تجريبي" عشان البوابة تتشاف كاملة:
 * Secret Seven (المرحلة 3) · باقة علاج طبيعي (7 من 12) · وزن 12 أسبوع (92 ← 84) · ملفات · خطط · زيارات فاتت + زيارة جاية.
 * الرقم 01000000001 = مريض جديد من غير تاريخ (عشان الحالات الفاضية تتجرب).
 */
export const EMPTY_PATIENT_PHONE = '+201000000001';

const emptyPortal = (): PortalData => ({
  program: null,
  packages: [],
  passport: { goal_weight_kg: null, measurements: [], timeline: [] },
  documents: [],
  plans: [],
  extraInvoices: [],
  profile: {
    email: null,
    birth_date: null,
    gender: null,
    consents: {
      reminders_whatsapp: true,
      offers_whatsapp: false,
      offers_sms: false,
      progress_photos: false,
    },
  },
});

// 12 أسبوع: من 92 لـ84 كيلو (بشوية تذبذب طبيعي)
function weights(today: string): Measurement[] {
  const values = [92, 91.4, 90.6, 90.2, 89.1, 88.4, 87.9, 87.1, 86.4, 85.7, 84.9, 84];
  return values.map((weight_kg, index) => ({
    date: addDays(today, -7 * (values.length - 1 - index) - 2),
    weight_kg,
    body_fat_pct: Math.round((34 - index * 0.55) * 10) / 10,
    waist_cm: Math.round(104 - index * 0.9),
  }));
}

function demoPortal(today: string): PortalData {
  const measurements = weights(today);
  const timeline: TimelineEntry[] = [
    {
      id: 't-assessment',
      date: measurements[0].date,
      specialty: 'nutrition',
      kind: 'visit',
      title_en: 'First assessment',
      title_ar: 'أول تقييم',
      body_en: 'InBody scan and goals with your dietitian. Goal: 80 kg.',
      body_ar: 'قياس InBody وتحديد الأهداف مع أخصائي التغذية. الهدف: 80 كيلو.',
    },
    {
      id: 't-plan',
      date: addDays(measurements[0].date, 2),
      specialty: 'nutrition',
      kind: 'plan',
      title_en: 'Meal plan ready',
      title_ar: 'خطة الأكل جاهزة',
      body_en: '1,800 kcal a day with three meals and two snacks.',
      body_ar: '1,800 سعر حراري في اليوم: 3 وجبات وسناكين.',
    },
    {
      id: 't-xray',
      date: addDays(today, -30),
      specialty: 'physio',
      kind: 'document',
      title_en: 'Knee X-ray added',
      title_ar: 'أشعة الركبة اتضافت',
      body_en: 'No fracture. Mild narrowing of the inner joint space.',
      body_ar: 'مفيش كسر. ضيق بسيط في المفصل من جوه.',
    },
    {
      id: 't-physio',
      date: addDays(today, -26),
      specialty: 'physio',
      kind: 'visit',
      title_en: 'Physiotherapy assessment',
      title_ar: 'تقييم العلاج الطبيعي',
      body_en: 'Knee strength and range checked. 12-session plan started.',
      body_ar: 'اتقاست قوة الركبة وحركتها، وبدأت خطة 12 جلسة.',
    },
    {
      id: 't-week6',
      date: measurements[5].date,
      specialty: 'nutrition',
      kind: 'measurement',
      title_en: 'Halfway check-in',
      title_ar: 'متابعة نص المدة',
      body_en: '3.6 kg down. Waist −5 cm.',
      body_ar: 'نزلت 3.6 كيلو، والوسط قل 5 سم.',
    },
    {
      id: 't-lab',
      date: addDays(today, -12),
      specialty: 'internal',
      kind: 'document',
      title_en: 'Blood test results',
      title_ar: 'نتيجة تحليل الدم',
      body_en: 'CBC and fasting sugar within normal range.',
      body_ar: 'صورة الدم والسكر الصايم في المعدل الطبيعي.',
    },
    {
      id: 't-latest',
      date: measurements.at(-1)!.date,
      specialty: 'nutrition',
      kind: 'measurement',
      title_en: 'Weekly weigh-in',
      title_ar: 'وزن الأسبوع',
      body_en: '84 kg — 4 kg to your goal.',
      body_ar: '84 كيلو — فاضل 4 كيلو على هدفك.',
    },
  ];

  const documents: PatientDocument[] = [
    {
      id: 'doc-cbc',
      kind: 'lab',
      specialty: 'internal',
      title_en: 'CBC lab report',
      title_ar: 'تحليل صورة دم كاملة',
      date: addDays(today, -12),
      size_kb: 184,
      uploaded_by_patient: false,
      preview: [
        { label_en: 'Hemoglobin', label_ar: 'الهيموجلوبين', value: '13.2 g/dL' },
        { label_en: 'White blood cells', label_ar: 'كرات الدم البيضاء', value: '6.8 ×10³/µL' },
        { label_en: 'Platelets', label_ar: 'الصفائح', value: '250 ×10³/µL' },
        { label_en: 'Fasting glucose', label_ar: 'السكر الصايم', value: '92 mg/dL' },
      ],
    },
    {
      id: 'doc-xray',
      kind: 'imaging',
      specialty: 'physio',
      title_en: 'Knee X-ray report',
      title_ar: 'تقرير أشعة الركبة',
      date: addDays(today, -30),
      size_kb: 1240,
      uploaded_by_patient: false,
      preview: [
        { label_en: 'Side', label_ar: 'الناحية', value: 'Right / يمين' },
        { label_en: 'Fracture', label_ar: 'كسر', value: 'None / لا يوجد' },
        { label_en: 'Joint space', label_ar: 'مسافة المفصل', value: 'Mild medial narrowing' },
      ],
    },
    {
      id: 'doc-meal-plan',
      kind: 'plan',
      specialty: 'nutrition',
      title_en: 'Nutrition plan',
      title_ar: 'خطة التغذية',
      date: addDays(measurements[0].date, 2),
      size_kb: 96,
      uploaded_by_patient: false,
      preview: [
        { label_en: 'Daily calories', label_ar: 'السعرات في اليوم', value: '1,800 kcal' },
        { label_en: 'Protein', label_ar: 'البروتين', value: '120 g' },
        { label_en: 'Water', label_ar: 'المية', value: '2.5 L' },
      ],
    },
  ];

  return {
    ...emptyPortal(),
    program: {
      slug: 'secret-seven',
      title_en: 'Secret Seven',
      title_ar: 'Secret Seven',
      stage: 3,
      total_stages: 7,
      stage_title_en: 'Treatment',
      stage_title_ar: 'العلاج',
    },
    packages: [
      {
        id: 'pkg-physio-12',
        specialty: 'physio',
        title_en: 'Physio package — 12 sessions',
        title_ar: 'باقة علاج طبيعي — 12 جلسة',
        total_sessions: 12,
        used_sessions: 5,
        expires_at: addDays(today, 50),
        status: 'active',
      },
    ],
    passport: { goal_weight_kg: 80, measurements, timeline },
    documents,
    plans: [
      {
        id: 'plan-meals',
        specialty: 'nutrition',
        kind: 'meals',
        title_en: 'Your meal plan',
        title_ar: 'خطة أكلك',
        doctor_name_en: 'Dr. Sara Mahmoud',
        doctor_name_ar: 'د. سارة محمود',
        updated_at: addDays(today, -9),
        items: [
          {
            id: 'm-breakfast',
            title_en: 'Breakfast',
            title_ar: 'الفطار',
            detail_en: 'Ful with olive oil, 2 boiled eggs, ½ baladi bread, cucumber and tomato.',
            detail_ar: 'فول بزيت زيتون، بيضتين مسلوقين، نص رغيف بلدي، خيار وطماطم.',
            video_url: null,
          },
          {
            id: 'm-snack',
            title_en: 'Snack',
            title_ar: 'سناك',
            detail_en: 'A cup of yogurt with a handful of nuts.',
            detail_ar: 'كوباية زبادي وحفنة مكسرات.',
            video_url: null,
          },
          {
            id: 'm-lunch',
            title_en: 'Lunch',
            title_ar: 'الغدا',
            detail_en: 'Grilled chicken (150 g), 4 tbsp brown rice, a big salad.',
            detail_ar: 'فراخ مشوية (150 جرام)، 4 معالق رز بني، طبق سلطة كبير.',
            video_url: null,
          },
          {
            id: 'm-dinner',
            title_en: 'Dinner',
            title_ar: 'العشا',
            detail_en: 'Cottage cheese with vegetables, or tuna salad.',
            detail_ar: 'جبنة قريش بالخضار، أو سلطة تونة.',
            video_url: null,
          },
        ],
      },
      {
        id: 'plan-knee',
        specialty: 'physio',
        kind: 'exercises',
        title_en: 'Knee home exercises',
        title_ar: 'تمارين الركبة في البيت',
        doctor_name_en: 'Dr. Omar Hassan',
        doctor_name_ar: 'د. عمر حسن',
        updated_at: addDays(today, -4),
        items: [
          {
            id: 'e-quad',
            title_en: 'Quad sets',
            title_ar: 'شد عضلة الفخد',
            detail_en: '3 sets × 10 · hold 5 seconds',
            detail_ar: '3 مجموعات × 10 · اثبت 5 ثواني',
            video_url: null,
          },
          {
            id: 'e-slr',
            title_en: 'Straight leg raise',
            title_ar: 'رفع الرجل مفرودة',
            detail_en: '3 sets × 12 · each leg',
            detail_ar: '3 مجموعات × 12 · لكل رجل',
            video_url: null,
          },
          {
            id: 'e-heel',
            title_en: 'Heel slides',
            title_ar: 'سحب الكعب',
            detail_en: '2 sets × 15 · slow and controlled',
            detail_ar: '2 مجموعة × 15 · ببطء',
            video_url: null,
          },
          {
            id: 'e-squat',
            title_en: 'Mini squats',
            title_ar: 'سكوات صغير',
            detail_en: '3 sets × 10 · hold a chair',
            detail_ar: '3 مجموعات × 10 · امسك في كرسي',
            video_url: null,
          },
        ],
      },
    ],
    extraInvoices: [
      {
        id: 'inv-pkg',
        number: 'INV-2026-0142',
        date: addDays(today, -26),
        title_en: 'Physio package — 12 sessions',
        title_ar: 'باقة علاج طبيعي — 12 جلسة',
        amount_minor: 420000,
        currency: 'EGP',
        status: 'paid',
        booking_id: null,
      },
    ],
  };
}

// زيارات تجريبية: اتنين فاتوا (completed) وواحدة جاية (بعد يومين 5 المغرب)
function demoBookings(patientId: string, today: string): MockDb['bookings'] {
  const make = (
    service: string,
    branch: string,
    doctor: string,
    date: string,
    time: string,
    status: Booking['status'],
  ) => {
    const booking = buildBooking(
      {
        mode: 'clinic',
        specialty: '',
        service_slug: service,
        branch_id: branch,
        doctor_slug: doctor,
        starts_at: cairoIso(date, time),
        payment_method: 'clinic',
        program_slug: null,
        notes: null,
      },
      patientId,
    );
    return {
      ...booking,
      status,
      paid: status === 'completed',
      created_at: `${addDays(date, -3)}T10:00:00+03:00`,
    };
  };
  return [
    make(
      'nutrition-assessment',
      'branch-sheikh-zayed',
      'sara-mahmoud',
      addDays(today, -82),
      '11:00',
      'completed',
    ),
    make(
      'physio-assessment',
      'branch-new-cairo',
      'omar-hassan',
      addDays(today, -26),
      '17:00',
      'completed',
    ),
    make(
      'manual-therapy',
      'branch-new-cairo',
      'omar-hassan',
      addDays(today, 2),
      '17:00',
      'confirmed',
    ),
  ];
}

/** بيتنادي من verifyOtp أول ما مريض جديد يدخل */
export function seedPatient(db: MockDb, patientId: string, phone: string) {
  const today = todayInCairo();
  if (phone === EMPTY_PATIENT_PHONE) {
    db.portal[patientId] = emptyPortal();
    return;
  }
  db.portal[patientId] = demoPortal(today);
  db.bookings.push(...demoBookings(patientId, today));
}

function session() {
  const db = readDb();
  if (!db.session) throw new MockHttpError(401, 'UNAUTHENTICATED');
  const portal = db.portal[db.session.id] ?? emptyPortal();
  return { db, me: db.session, portal };
}

// الحجز اللي ميعاده فات ولسه "مؤكد" = "خلص"
const withStatus = (booking: Booking): Booking =>
  booking.status === 'confirmed' && new Date(booking.starts_at).getTime() < Date.now()
    ? { ...booking, status: 'completed' }
    : booking;

function ownBooking(db: MockDb, patientId: string, id: string) {
  const booking = db.bookings.find((item) => item.id === id && item.patient_id === patientId);
  if (!booking) throw new MockHttpError(404, 'NOT_FOUND');
  return booking;
}

function invoicesFor(db: MockDb, patientId: string, portal: PortalData): Invoice[] {
  const fromBookings: Invoice[] = db.bookings
    .filter((booking) => booking.patient_id === patientId)
    .map(withStatus)
    .filter(
      (booking) =>
        booking.paid || booking.status === 'pending_payment' || booking.status === 'completed',
    )
    .map((booking) => ({
      id: `inv-${booking.id}`,
      number: `INV-${booking.reference.replace('OXY-', '2026-')}`,
      date: booking.created_at.slice(0, 10),
      title_en: booking.service.name_en,
      title_ar: booking.service.name_ar,
      amount_minor: booking.price_minor - booking.discount_minor,
      currency: booking.currency,
      status: booking.status === 'pending_payment' ? 'unpaid' : 'paid',
      booking_id: booking.id,
    }));
  const cancelledPaid: Invoice[] = db.bookings
    .filter(
      (booking) =>
        booking.patient_id === patientId && booking.status === 'cancelled' && booking.paid,
    )
    .map((booking) => ({
      id: `inv-${booking.id}`,
      number: `INV-${booking.reference.replace('OXY-', '2026-')}`,
      date: booking.created_at.slice(0, 10),
      title_en: booking.service.name_en,
      title_ar: booking.service.name_ar,
      amount_minor: booking.price_minor - booking.discount_minor,
      currency: booking.currency,
      status: 'refunded',
      booking_id: booking.id,
    }));
  return [...fromBookings, ...cancelledPaid, ...portal.extraInvoices].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export const portalHandlers: MockHandlers = {
  getMyBookings: () => {
    const { db, me } = session();
    return {
      data: db.bookings
        .filter((booking) => booking.patient_id === me.id)
        .map(withStatus)
        .sort((a, b) => b.starts_at.localeCompare(a.starts_at)),
    };
  },

  cancelBooking: (args) => {
    const { me } = session();
    const id = args.url.split('/').at(-2) ?? '';
    let result: Booking | undefined;
    writeDb((db) => {
      const booking = ownBooking(db, me.id, id);
      if (booking.status === 'cancelled' || new Date(booking.starts_at).getTime() < Date.now()) {
        throw new MockHttpError(409, 'NOT_CANCELLABLE');
      }
      booking.status = 'cancelled';
      result = booking;
    });
    return result;
  },

  rescheduleBooking: (args) => {
    const { me } = session();
    const { starts_at, doctor_slug } = args.body as Omit<RescheduleBody, 'id'>;
    const id = args.url.split('/').at(-2) ?? '';
    let result: Booking | undefined;
    writeDb((db) => {
      const booking = ownBooking(db, me.id, id);
      const free = isSlotFree(
        {
          mode: booking.mode,
          specialty: booking.specialty,
          service_slug: booking.mode === 'clinic' ? booking.service.slug : null,
          branch_id: booking.branch?.id ?? null,
          doctor_slug,
          starts_at,
          payment_method: booking.payment_method,
          program_slug: booking.program_slug,
          notes: booking.notes,
        },
        booking.id,
      );
      if (!free) throw new MockHttpError(409, 'SLOT_TAKEN');
      const rebuilt = buildBooking(
        {
          mode: booking.mode,
          specialty: booking.specialty,
          service_slug: booking.mode === 'clinic' ? booking.service.slug : null,
          branch_id: booking.branch?.id ?? null,
          doctor_slug,
          starts_at,
          payment_method: booking.payment_method,
          program_slug: booking.program_slug,
          notes: booking.notes,
        },
        me.id,
      );
      booking.starts_at = starts_at;
      booking.doctor = rebuilt.doctor;
      result = booking;
    });
    return result;
  },

  getMyProgram: () => ({ data: session().portal.program }),
  getMyPackages: () => ({ data: session().portal.packages }),
  getPassport: () => session().portal.passport,
  getMyDocuments: () => ({
    data: [...session().portal.documents].sort((a, b) => b.date.localeCompare(a.date)),
  }),

  uploadDocument: ({ body }) => {
    const { me } = session();
    const { title, size_kb } = body as UploadDocumentBody;
    const document: PatientDocument = {
      id: crypto.randomUUID(),
      kind: 'upload',
      specialty: null,
      title_en: title,
      title_ar: title,
      date: todayInCairo(),
      size_kb,
      uploaded_by_patient: true,
      preview: [],
    };
    writeDb((db) => {
      db.portal[me.id] ??= emptyPortal();
      db.portal[me.id].documents.push(document);
    });
    return document;
  },

  deleteDocument: (args) => {
    const { me } = session();
    const id = args.url.split('/').pop();
    writeDb((db) => {
      const portal = db.portal[me.id];
      const document = portal?.documents.find((item) => item.id === id);
      // ملفات العيادة مش بتتمسح من البوابة — اللي المريض رفعه بس
      if (!document || !document.uploaded_by_patient) throw new MockHttpError(403, 'FORBIDDEN');
      portal.documents = portal.documents.filter((item) => item.id !== id);
    });
    return null;
  },

  getMyPlans: () => ({ data: session().portal.plans }),

  getMyInvoices: () => {
    const { db, me, portal } = session();
    return { data: invoicesFor(db, me.id, portal) };
  },

  getProfile: () => {
    const { me, portal } = session();
    return { full_name: me.full_name, phone: me.phone, ...portal.profile };
  },

  updateProfile: ({ body }) => {
    const { me } = session();
    const patch = body as UpdateProfileBody;
    const db = writeDb((draft) => {
      draft.portal[me.id] ??= emptyPortal();
      const profile = draft.portal[me.id].profile;
      if (patch.email !== undefined) profile.email = patch.email;
      if (patch.birth_date !== undefined) profile.birth_date = patch.birth_date;
      if (patch.gender !== undefined) profile.gender = patch.gender;
      if (patch.consents) profile.consents = { ...profile.consents, ...patch.consents };
      if (patch.full_name !== undefined) {
        const user = draft.users.find((item) => item.id === me.id);
        if (user) user.full_name = patch.full_name;
        if (draft.session) draft.session.full_name = patch.full_name;
      }
    });
    return { full_name: db.session!.full_name, phone: me.phone, ...db.portal[me.id].profile };
  },

  requestDataExport: () => {
    session();
    return { requested_at: new Date().toISOString() };
  },

  deleteMyAccount: () => {
    const { me } = session();
    writeDb((db) => {
      db.users = db.users.filter((item) => item.id !== me.id);
      db.bookings = db.bookings.filter((item) => item.patient_id !== me.id);
      delete db.portal[me.id];
      db.session = null;
    });
    return null;
  },
};
