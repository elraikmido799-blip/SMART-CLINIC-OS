import { baseApi } from '@/store/base-api';
import {
  loginResponseSchema,
  resendResponseSchema,
  staffMeSchema,
  type LoginBody,
  type LoginResponse,
  type StaffMe,
  type VerifyTwoFactorBody,
} from './types';

/**
 * دخول الموظفين (D-01): إيميل + باسورد ← كود التحقق بخطوتين (لو الجهاز مش موثوق).
 * الجلسة Cookie من الـAPI (credentials: 'include')، والـMock بيحفظها في mocks/db.ts.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 401 = مش داخل (الـGuard بيحوّل لصفحة الدخول)
    getMe: build.query<StaffMe, void>({
      query: () => '/staff/me',
      responseSchema: staffMeSchema,
      providesTags: ['Me'],
    }),
    login: build.mutation<LoginResponse, LoginBody>({
      query: (body) => ({ url: '/staff/auth/login', method: 'POST', body }),
      responseSchema: loginResponseSchema,
    }),
    verifyTwoFactor: build.mutation<StaffMe, VerifyTwoFactorBody>({
      query: (body) => ({ url: '/staff/auth/2fa/verify', method: 'POST', body }),
      responseSchema: staffMeSchema,
    }),
    resendTwoFactor: build.mutation<{ resend_after_seconds: number }, { challenge_id: string }>({
      query: (body) => ({ url: '/staff/auth/2fa/resend', method: 'POST', body }),
      responseSchema: resendResponseSchema,
    }),
    logout: build.mutation<null, void>({
      query: () => ({ url: '/staff/auth/logout', method: 'POST' }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useResendTwoFactorMutation,
  useLogoutMutation,
} = authApi;
