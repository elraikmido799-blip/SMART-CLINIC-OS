import { MockHttpError } from '@oxygen/shared';

/**
 * أرقام تجربة لحالات الأخطاء في أي فورم (Lead · حذف الحساب · الدخول): اكتب الرقم وابعت.
 * 01000000422 · 01000000429 · 01000000500. أي رقم تاني بينجح.
 */
const TEST_PHONE_ERRORS: Record<string, [number, string]> = {
  '+201000000422': [422, 'VALIDATION_ERROR'],
  '+201000000429': [429, 'RATE_LIMITED'],
  '+201000000500': [500, 'SERVER_ERROR'],
};

export function throwTestPhoneError(phone: string) {
  const testError = TEST_PHONE_ERRORS[phone];
  if (testError) throw new MockHttpError(...testError);
}
