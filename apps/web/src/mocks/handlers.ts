import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { AccountDeletionRequestBody } from '@/types/account';
import type { CreateLeadBody } from '@/types/lead';

/**
 * الداتا الوهمية لحد ما الـAPI يجهز (NEXT_PUBLIC_API_MOCKING=enabled).
 * المفتاح = اسم الـEndpoint في RTK Query. أي Endpoint جديد بيتضاف له Mock هنا.
 * لما الـAPI يجهز: فولدر mocks كله بيتمسح.
 */

// أرقام تجربة لحالات الأخطاء في أي فورم (Lead · حذف الحساب): اكتب الرقم في الفورم وابعت: 01000000422 · 01000000429 · 01000000500
const TEST_PHONE_ERRORS: Record<string, [number, string]> = {
  '+201000000422': [422, 'VALIDATION_ERROR'],
  '+201000000429': [429, 'RATE_LIMITED'],
  '+201000000500': [500, 'SERVER_ERROR'],
};

function throwTestPhoneError(phone: string) {
  const testError = TEST_PHONE_ERRORS[phone];
  if (testError) throw new MockHttpError(...testError);
}

export const mockHandlers: MockHandlers = {
  createLead: ({ body }) => {
    throwTestPhoneError((body as CreateLeadBody).phone);
    return { id: crypto.randomUUID() };
  },
  requestAccountDeletion: ({ body }) => {
    throwTestPhoneError((body as AccountDeletionRequestBody).phone);
    return { id: crypto.randomUUID() };
  },
};
