import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { StartPaymentBody, ValidateCouponBody } from '@/types/payment';
import { readDb, writeDb } from './db';

/**
 * الدفع في الـMocks: كود الخصم OXY10 (10%) · OLD10 (خلص) · أي كود تاني غلط.
 * startPayment بيرجّع redirect_url = null، فالصفحة بتفتح "صفحة دفع تجريبية" بتختار منها نجح ولا فشل.
 */
const COUPONS: Record<string, { percent: number; expired?: boolean }> = {
  OXY10: { percent: 10 },
  OLD10: { percent: 10, expired: true },
};

// الدفعات اللي بدأت: payment_id ← booking_id + الخصم
const payments = new Map<string, { bookingId: string; discount: number }>();

function ownBooking(bookingId: string) {
  const { session, bookings } = readDb();
  if (!session) throw new MockHttpError(401, 'UNAUTHENTICATED');
  const booking = bookings.find((item) => item.id === bookingId && item.patient_id === session.id);
  if (!booking) throw new MockHttpError(404, 'NOT_FOUND');
  return booking;
}

function couponDiscount(code: string, price: number) {
  const coupon = COUPONS[code.trim().toUpperCase()];
  if (!coupon) throw new MockHttpError(422, 'INVALID_COUPON');
  if (coupon.expired) throw new MockHttpError(422, 'COUPON_EXPIRED');
  return Math.round((price * coupon.percent) / 100);
}

export const paymentHandlers: MockHandlers = {
  validateCoupon: ({ body }) => {
    const { code, booking_id } = body as ValidateCouponBody;
    const booking = ownBooking(booking_id);
    return {
      code: code.trim().toUpperCase(),
      discount_minor: couponDiscount(code, booking.price_minor),
    };
  },

  startPayment: ({ body }) => {
    const { booking_id, coupon_code } = body as StartPaymentBody;
    const booking = ownBooking(booking_id);
    if (booking.paid) throw new MockHttpError(409, 'ALREADY_PAID');
    const discount = coupon_code ? couponDiscount(coupon_code, booking.price_minor) : 0;
    const paymentId = crypto.randomUUID();
    payments.set(paymentId, { bookingId: booking.id, discount });
    return { payment_id: paymentId, redirect_url: null };
  },

  completeDemoPayment: (args) => {
    const paymentId = args.url.split('/').at(-2) ?? '';
    const payment = payments.get(paymentId);
    if (!payment) throw new MockHttpError(404, 'NOT_FOUND');
    const { result } = args.body as { result: 'success' | 'failed' };
    if (result === 'success') {
      writeDb((db) => {
        const booking = db.bookings.find((item) => item.id === payment.bookingId);
        if (!booking) return;
        booking.paid = true;
        booking.status = 'confirmed';
        booking.payment_method = 'online';
        booking.discount_minor = payment.discount;
      });
    }
    return null;
  },
};
