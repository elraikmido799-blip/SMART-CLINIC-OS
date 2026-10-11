import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { addDays, cairoIso, todayInCairo, weekdayOf } from '@/lib/dates';
import type { Booking, CreateBookingBody, Slot, SlotsQuery } from '@/types/booking';
import { readDb, writeDb } from './db';
import { onlineConsultationMock } from './public/content';
import { doctorDetailMock } from './public/doctor-details';
import { doctorsMock } from './public/doctors';
import { branchesMock } from './public/branches';
import { servicesMock } from './public/services';

/**
 * الحجز في الـMocks: المواعيد بتتولد من مواعيد الفرع وأيام كل دكتور، وبعضها "محجوز" بشكل ثابت
 * (نفس الدكتور ونفس اليوم = نفس النتيجة كل مرة)، والحجوزات بتتحفظ في الـMock DB.
 */

const SLOT_STEP_MINUTES = 30;
// الأونلاين من 10 الصبح لـ9 بالليل
const ONLINE_HOURS = { opens_at: '10:00', closes_at: '21:00' };
// مفيش حجز قبل الميعاد بأقل من ساعتين
const MIN_LEAD_MINUTES = 120;
// كل كام ميعاد واحد "محجوز" (عشان شكل الميعاد المقفول يبان)
const TAKEN_EVERY = 4;
const NEXT_AVAILABLE_DAYS = 14;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// رقم ثابت من أي كلام (عشان "المحجوز" يبقى هو هو كل مرة)
function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

// الدكاترة اللي ينفع يكشفوا: نفس التخصص، وفي الفرع ده، وبيشتغلوا في اليوم ده
function doctorsFor(query: SlotsQuery) {
  const weekday = weekdayOf(query.date);
  return doctorsMock.data.filter((doctor) => {
    if (doctor.specialty !== query.specialty) return false;
    if (query.doctor && doctor.slug !== query.doctor) return false;
    // الجمعة إجازة للكل
    if (weekday === 5) return false;
    if (query.mode === 'online') return true;
    const branch = branchesMock.data.find((item) => item.slug === query.branch);
    if (!branch || !doctor.branch_ids.includes(branch.id)) return false;
    const schedule = doctorDetailMock(doctor.slug)?.schedule.find(
      (item) => item.branch_id === branch.id,
    );
    return schedule ? schedule.days.includes(weekday) : true;
  });
}

function durationFor(query: SlotsQuery): number {
  if (query.mode === 'online') {
    return (
      onlineConsultationMock.specialties.find((item) => item.specialty === query.specialty)
        ?.duration_minutes ?? 30
    );
  }
  return servicesMock.data.find((item) => item.slug === query.service)?.duration_minutes ?? 30;
}

function slotsFor(query: SlotsQuery): Slot[] {
  const doctors = doctorsFor(query);
  if (doctors.length === 0) return [];
  const hours =
    query.mode === 'online'
      ? ONLINE_HOURS
      : (branchesMock.data.find((item) => item.slug === query.branch) ?? ONLINE_HOURS);
  const duration = durationFor(query);
  const booked = new Set(
    readDb()
      .bookings.filter(
        (booking) => booking.status !== 'cancelled' && booking.id !== query.exclude_booking,
      )
      .map((booking) => `${booking.doctor.slug}|${new Date(booking.starts_at).getTime()}`),
  );
  const earliest = Date.now() + MIN_LEAD_MINUTES * 60_000;
  const slots: Slot[] = [];

  for (
    let minutes = toMinutes(hours.opens_at);
    minutes + duration <= toMinutes(hours.closes_at);
    minutes += SLOT_STEP_MINUTES
  ) {
    const startsAt = cairoIso(query.date, toHhmm(minutes));
    const time = new Date(startsAt).getTime();
    if (time < earliest) continue;
    const free = doctors.find(
      (doctor) =>
        hash(`${doctor.slug}|${startsAt}`) % TAKEN_EVERY !== 0 &&
        !booked.has(`${doctor.slug}|${time}`),
    );
    slots.push({
      starts_at: startsAt,
      doctor_slug: (free ?? doctors[0]).slug,
      available: Boolean(free),
    });
  }
  return slots;
}

// أقرب يوم بعد اليوم المطلوب فيه ميعاد فاضي (خلال أسبوعين)
function nextAvailable(query: SlotsQuery): string | null {
  for (let i = 1; i <= NEXT_AVAILABLE_DAYS; i += 1) {
    const date = addDays(query.date, i);
    if (slotsFor({ ...query, date }).some((slot) => slot.available)) return date;
  }
  return null;
}

/** الميعاد لسه فاضي؟ (حد تاني ممكن يكون حجزه وإنت بتملا البيانات). excludeBookingId: في التأجيل */
export function isSlotFree(data: CreateBookingBody, excludeBookingId?: string): boolean {
  const slot = slotsFor({
    mode: data.mode,
    specialty: data.specialty,
    service: data.service_slug ?? undefined,
    branch: branchesMock.data.find((item) => item.id === data.branch_id)?.slug,
    doctor: data.doctor_slug,
    date: data.starts_at.slice(0, 10),
    exclude_booking: excludeBookingId,
  }).find((item) => new Date(item.starts_at).getTime() === new Date(data.starts_at).getTime());
  return Boolean(slot?.available);
}

const params = (args: FetchArgs) => (args.params ?? {}) as Record<string, string | undefined>;

function toSlotsQuery(args: FetchArgs): SlotsQuery {
  const p = params(args);
  return {
    mode: p.mode === 'online' ? 'online' : 'clinic',
    specialty: p.specialty ?? '',
    service: p.service,
    branch: p.branch,
    doctor: p.doctor,
    date: p.date ?? todayInCairo(),
    exclude_booking: p.exclude_booking,
  };
}

function requireSession() {
  const { session } = readDb();
  if (!session) throw new MockHttpError(401, 'UNAUTHENTICATED');
  return session;
}

// الحجز كامل بالأسامي (زي رد الـAPI)، عشان الدفع والبوابة يعرضوه من غير طلبات زيادة
export function buildBooking(
  body: CreateBookingBody,
  patientId: string,
): Booking & { patient_id: string } {
  const doctor = doctorsMock.data.find((item) => item.slug === body.doctor_slug);
  if (!doctor) throw new MockHttpError(422, 'VALIDATION_ERROR');
  const online = body.mode === 'online';
  const onlinePrice = onlineConsultationMock.specialties.find(
    (item) => item.specialty === body.specialty,
  );
  const service = servicesMock.data.find((item) => item.slug === body.service_slug);
  if (!online && !service) throw new MockHttpError(422, 'VALIDATION_ERROR');
  const branch = branchesMock.data.find((item) => item.id === body.branch_id) ?? null;
  const id = crypto.randomUUID();

  return {
    id,
    patient_id: patientId,
    reference: `OXY-${1000 + (hash(id) % 9000)}`,
    status: body.payment_method === 'online' ? 'pending_payment' : 'confirmed',
    mode: body.mode,
    specialty: doctor.specialty,
    service: online
      ? {
          slug: `online-${doctor.specialty}`,
          name_en: 'Online consultation',
          name_ar: 'استشارة أونلاين',
          duration_minutes: onlinePrice?.duration_minutes ?? 30,
        }
      : {
          slug: service!.slug,
          name_en: service!.name_en,
          name_ar: service!.name_ar,
          duration_minutes: service!.duration_minutes,
        },
    branch:
      online || !branch
        ? null
        : {
            id: branch.id,
            slug: branch.slug,
            name_en: branch.name_en,
            name_ar: branch.name_ar,
            maps_url: branch.maps_url,
          },
    doctor: {
      slug: doctor.slug,
      name_en: doctor.name_en,
      name_ar: doctor.name_ar,
      photo_url: doctor.photo_url,
    },
    starts_at: body.starts_at,
    price_minor: online ? (onlinePrice?.price_minor ?? 0) : service!.price_from_minor,
    discount_minor: 0,
    currency: 'EGP',
    payment_method: body.payment_method,
    paid: false,
    video_url: online ? `https://meet.oxygen.example/${id.slice(0, 8)}` : null,
    program_slug: body.program_slug,
    notes: body.notes,
    created_at: new Date().toISOString(),
  };
}

export const bookingHandlers: MockHandlers = {
  getSlots: (args) => {
    const query = toSlotsQuery(args);
    const data = slotsFor(query);
    return {
      data,
      next_available_date: data.some((slot) => slot.available) ? query.date : nextAvailable(query),
    };
  },

  createBooking: ({ body }) => {
    const session = requireSession();
    const data = body as CreateBookingBody;
    if (!isSlotFree(data)) throw new MockHttpError(409, 'SLOT_TAKEN');
    const booking = buildBooking(data, session.id);
    writeDb((db) => {
      db.bookings.push(booking);
    });
    return booking;
  },

  getBooking: (args) => {
    const session = requireSession();
    const id = args.url.split('/').pop();
    const booking = readDb().bookings.find(
      (item) => item.id === id && item.patient_id === session.id,
    );
    if (!booking) throw new MockHttpError(404, 'NOT_FOUND');
    return booking;
  },
};
