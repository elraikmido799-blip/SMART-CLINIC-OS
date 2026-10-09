import { z } from 'zod';
import { env } from '@/lib/env';

// الصفحات التعريفية بتتبني على السيرفر، وبتتحدث كل 5 دقايق (DEC-11)
const REVALIDATE_SECONDS = 300;
// لو الـAPI مردّش في الوقت ده، بنعتبره زي النت المقطوع
const TIMEOUT_MS = 8000;

/**
 * كل الأخطاء اللي ممكن تحصل، وكل واحد ليه رسالة في messages (errors.*):
 * - network: النت مقطوع، أو الـAPI مش بيرد، أو الوقت خلص
 * - not-found: 404
 * - server: 5xx
 * - invalid-response: الرد جه بشكل غير الـSchema
 * - unknown: أي حاجة تانية (زي 4xx غير 404)
 */
export type PublicErrorKind = 'network' | 'not-found' | 'server' | 'invalid-response' | 'unknown';

export type PublicResult<T> = { ok: true; data: T } | { ok: false; error: PublicErrorKind };

class PublicHttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

type Mock<T> = { data: T; empty?: T };

// الحالة الفاضية لأي List (MOCK_SCENARIO=empty)
export const EMPTY_LIST = { data: [] };

async function httpGet(path: string): Promise<unknown> {
  const response = await fetch(`${env.apiUrl}/public/${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new PublicHttpError(response.status);
  return response.json();
}

// MOCK_SCENARIO في الـenv بيجرّب كل حالة من غير الـAPI: empty · network · server · not-found · invalid
async function mockGet<T>(mock: Mock<T>): Promise<unknown> {
  switch (env.mockScenario) {
    case 'empty':
      return mock.empty ?? mock.data;
    case 'network':
      throw new TypeError('fetch failed (mock)');
    case 'server':
      throw new PublicHttpError(500);
    case 'not-found':
      throw new PublicHttpError(404);
    case 'invalid':
      return { unexpected: true };
    default:
      return mock.data;
  }
}

function toErrorKind(error: unknown): PublicErrorKind {
  if (error instanceof PublicHttpError) {
    if (error.status === 404) return 'not-found';
    if (error.status >= 500) return 'server';
    return 'unknown';
  }
  // fetch بيرمي TypeError لما النت يقطع، وAbortSignal.timeout بيرمي TimeoutError
  if (error instanceof TypeError) return 'network';
  if (error instanceof DOMException && error.name === 'TimeoutError') return 'network';
  if (error instanceof SyntaxError) return 'invalid-response';
  return 'unknown';
}

/**
 * GET /public/<path> بيرجّع Result بدل ما يرمي Error، فكل قسم بيقرر يعرض إيه لو فشل.
 * لما الـAPI يجهز: NEXT_PUBLIC_API_MOCKING=disabled، ومفيش أي تغيير في الصفحات.
 */
export async function fetchPublic<S extends z.ZodType>(
  path: string,
  schema: S,
  mock: Mock<z.input<S>>,
): Promise<PublicResult<z.output<S>>> {
  try {
    const body = env.apiMocking ? await mockGet(mock) : await httpGet(path);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error(`[api] GET /public/${path}: invalid response`, parsed.error.issues);
      return { ok: false, error: 'invalid-response' };
    }
    return { ok: true, data: parsed.data };
  } catch (error) {
    const kind = toErrorKind(error);
    console.error(`[api] GET /public/${path}: ${kind}`, error);
    return { ok: false, error: kind };
  }
}

/** نفس fetchPublic بس لـList: الرد { data: [...] } والصفحة بتاخد الـArray على طول */
export async function fetchPublicList<S extends z.ZodType>(
  path: string,
  item: S,
  mock: { data: z.input<S>[] },
): Promise<PublicResult<z.output<S>[]>> {
  const result = await fetchPublic(path, z.object({ data: z.array(item) }), {
    data: mock,
    empty: EMPTY_LIST,
  });
  return result.ok ? { ok: true, data: result.data.data } : result;
}
