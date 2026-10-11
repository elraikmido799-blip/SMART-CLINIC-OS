import { baseApi } from '@/store/base-api';
import {
  meSchema,
  sendOtpResponseSchema,
  type Me,
  type SendOtpBody,
  type VerifyOtpBody,
} from '@/types/auth';

/**
 * الدخول برقم الموبايل + OTP (W-17) — مشترك بين الحجز (خطوة "بياناتك") وصفحة الدخول والبوابة.
 * الجلسة Cookie من الـAPI (credentials: 'include')، والـMock بيحفظها في mocks/db.ts.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 401 = مش داخل (مش خطأ في الشاشة)
    getMe: build.query<Me, void>({
      query: () => '/me',
      responseSchema: meSchema,
      providesTags: ['Me'],
    }),
    sendOtp: build.mutation<{ resend_after_seconds: number }, SendOtpBody>({
      query: (body) => ({ url: '/auth/otp', method: 'POST', body }),
      responseSchema: sendOtpResponseSchema,
    }),
    verifyOtp: build.mutation<Me, VerifyOtpBody>({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
      responseSchema: meSchema,
      invalidatesTags: ['Me', 'Appointments'],
    }),
    logout: build.mutation<null, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Me', 'Appointments', 'Documents', 'Profile'],
    }),
  }),
});

export const { useGetMeQuery, useSendOtpMutation, useVerifyOtpMutation, useLogoutMutation } =
  authApi;
