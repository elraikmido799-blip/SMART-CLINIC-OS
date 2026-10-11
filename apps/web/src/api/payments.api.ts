import { baseApi } from '@/store/base-api';
import {
  couponSchema,
  startPaymentSchema,
  type Coupon,
  type StartPaymentBody,
  type StartPaymentResponse,
  type ValidateCouponBody,
} from '@/types/payment';

/** الدفع (W-16): كود الخصم + بداية الدفع. نتيجة الدفع بتيجي من الحجز نفسه (getBooking → paid). */
export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    validateCoupon: build.mutation<Coupon, ValidateCouponBody>({
      query: (body) => ({ url: '/coupons/validate', method: 'POST', body }),
      responseSchema: couponSchema,
    }),
    startPayment: build.mutation<StartPaymentResponse, StartPaymentBody>({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      responseSchema: startPaymentSchema,
    }),
    // ⚠️ في الـMocks بس: "صفحة الدفع التجريبية" بتقول نجح ولا فشل (في الحقيقة ده Webhook بين الشركة والباك)
    completeDemoPayment: build.mutation<null, { payment_id: string; result: 'success' | 'failed' }>(
      {
        query: ({ payment_id, result }) => ({
          url: `/payments/${payment_id}/demo`,
          method: 'POST',
          body: { result },
        }),
        invalidatesTags: ['Appointments'],
      },
    ),
  }),
});

export const {
  useValidateCouponMutation,
  useStartPaymentMutation,
  useCompleteDemoPaymentMutation,
} = paymentsApi;
