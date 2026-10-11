import { type MockHandlers } from '@oxygen/shared';
import type { AccountDeletionRequestBody } from '@/types/account';
import type { CreateLeadBody } from '@/types/lead';
import { authHandlers } from './auth';
import { bookingHandlers } from './booking';
import { paymentHandlers } from './payments';
import { throwTestPhoneError } from './test-phones';

/**
 * الداتا الوهمية لحد ما الـAPI يجهز (NEXT_PUBLIC_API_MOCKING=enabled).
 * المفتاح = اسم الـEndpoint في RTK Query. أي Endpoint جديد بيتضاف له Mock هنا (أو في ملف لوحده ويتجمع هنا).
 * اللي ليه حالة (الدخول والحجوزات) بيتحفظ في mocks/db.ts.
 * لما الـAPI يجهز: فولدر mocks كله بيتمسح.
 */
export const mockHandlers: MockHandlers = {
  createLead: ({ body }) => {
    throwTestPhoneError((body as CreateLeadBody).phone);
    return { id: crypto.randomUUID() };
  },
  requestAccountDeletion: ({ body }) => {
    throwTestPhoneError((body as AccountDeletionRequestBody).phone);
    return { id: crypto.randomUUID() };
  },
  ...authHandlers,
  ...bookingHandlers,
  ...paymentHandlers,
};
