import { z } from 'zod';

// طرق الدفع الأونلاين (W-16). الشركة اللي هتتعامل مع الدفع بيحددها مبرمج الباك
export const paymentMethodSchema = z.enum(['card', 'wallet']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

// POST /coupons/validate: الكود صح؟ والخصم كام (بالقروش) على الحجز ده
export const couponSchema = z.object({ code: z.string(), discount_minor: z.number().int() });
export type Coupon = z.infer<typeof couponSchema>;

/**
 * POST /payments: بيبدأ الدفع وبيرجّع لينك صفحة الدفع بتاعة الشركة.
 * الشركة بترجّع الزائر لـ/checkout/success أو /checkout/failed، والباك بيعلّم الحجز "مدفوع" من الـWebhook.
 * redirect_url = null في الـMocks بس: بتظهر "صفحة دفع تجريبية" بدلها.
 */
export const startPaymentSchema = z.object({
  payment_id: z.string(),
  redirect_url: z.string().nullable(),
});
export type StartPaymentResponse = z.infer<typeof startPaymentSchema>;

export type StartPaymentBody = {
  booking_id: string;
  method: PaymentMethod;
  coupon_code: string | null;
};
export type ValidateCouponBody = { code: string; booking_id: string };
