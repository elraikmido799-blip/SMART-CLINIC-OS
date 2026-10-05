import type { MockHandlers } from '@oxygen/shared';

/**
 * الداتا الوهمية لحد ما الـAPI يجهز (NEXT_PUBLIC_API_MOCKING=enabled).
 * المفتاح = اسم الـEndpoint في RTK Query. أي Endpoint جديد بيتضاف له Mock هنا.
 * لما الـAPI يجهز: فولدر mocks كله بيتمسح.
 */
export const mockHandlers: MockHandlers = {
  createLead: () => ({ id: crypto.randomUUID() }),
};
