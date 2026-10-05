import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

/** ارميها من أي Mock عشان ترجّع Error بنفس شكل الـAPI: `{ status, data: { code } }`. */
export class MockHttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export type MockHandler = (args: FetchArgs) => unknown;

/** المفتاح = اسم الـEndpoint في RTK Query (زي `createLead`). */
export type MockHandlers = Record<string, MockHandler>;

type OxygenBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

const MOCK_DELAY_MS = 400; // عشان حالة الـLoading تبان زي الحقيقة

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createMockBaseQuery(handlers: MockHandlers): OxygenBaseQuery {
  return async (args, api) => {
    const fetchArgs = typeof args === 'string' ? { url: args } : args;
    await delay(MOCK_DELAY_MS);

    const handler = handlers[api.endpoint];
    if (!handler) {
      return { error: { status: 501, data: { code: 'NO_MOCK', endpoint: api.endpoint } } };
    }

    try {
      return { data: await handler(fetchArgs) };
    } catch (error) {
      if (error instanceof MockHttpError) {
        return { error: { status: error.status, data: { code: error.code } } };
      }
      throw error;
    }
  };
}

type BaseQueryOptions = {
  baseUrl: string;
  mocking: boolean;
  mockHandlers: MockHandlers;
};

/**
 * الـbaseQuery بتاع أي أبلكيشن: الـAPI الحقيقي، أو الـMocks لو `mocking = true`.
 * الـEndpoints مكتوبة بالـURLs الحقيقية في الحالتين، فالتبديل بمتغير واحد في الـenv.
 */
export function createBaseQuery({
  baseUrl,
  mocking,
  mockHandlers,
}: BaseQueryOptions): OxygenBaseQuery {
  if (mocking) return createMockBaseQuery(mockHandlers);
  return fetchBaseQuery({ baseUrl, credentials: 'include' });
}
