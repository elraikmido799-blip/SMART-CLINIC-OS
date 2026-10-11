import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { SendOtpBody, VerifyOtpBody } from '@/types/auth';
import { readDb, writeDb } from './db';
import { seedPatient } from './portal';
import { throwTestPhoneError } from './test-phones';

// الكود الوهمي في الـMocks (16 · 5.1 · 5.3). أي كود تاني = "الكود غلط"
export const MOCK_OTP_CODE = '123456';
const RESEND_AFTER_SECONDS = 60;

/** الدخول برقم الموبايل + OTP. الجلسة بتتحفظ في الـMock DB (في الحقيقة Cookie من الـAPI). */
export const authHandlers: MockHandlers = {
  sendOtp: ({ body }) => {
    const { phone } = body as SendOtpBody;
    throwTestPhoneError(phone);
    writeDb((db) => {
      db.otpPhone = phone;
    });
    return { resend_after_seconds: RESEND_AFTER_SECONDS };
  },

  verifyOtp: ({ body }) => {
    const { phone, code, full_name } = body as VerifyOtpBody;
    const db = readDb();
    if (db.otpPhone !== phone) throw new MockHttpError(422, 'OTP_NOT_REQUESTED');
    if (code !== MOCK_OTP_CODE) throw new MockHttpError(422, 'INVALID_CODE');
    const updated = writeDb((draft) => {
      let user = draft.users.find((item) => item.phone === phone);
      if (!user) {
        user = { id: crypto.randomUUID(), full_name: full_name?.trim() ?? '', phone };
        draft.users.push(user);
        // مريض جديد: تاريخ تجريبي في البوابة (إلا رقم "المريض الفاضي")
        seedPatient(draft, user.id, phone);
      } else if (full_name?.trim() && !user.full_name) {
        user.full_name = full_name.trim();
      }
      draft.session = user;
      draft.otpPhone = null;
    });
    return updated.session;
  },

  getMe: () => {
    const { session } = readDb();
    if (!session) throw new MockHttpError(401, 'UNAUTHENTICATED');
    return session;
  },

  logout: () => {
    writeDb((db) => {
      db.session = null;
    });
    return null;
  },
};
