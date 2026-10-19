import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

/**
 * كود الخطأ من رد الـAPI (`{ status, data: { code } }`) عشان الشاشة تختار الرسالة.
 * `network` = الطلب موصلش (مفيش نت)، و`undefined` = خطأ مش معروف.
 */
export function apiErrorCode(
  error: FetchBaseQueryError | SerializedError | undefined,
): string | undefined {
  if (!error || !('status' in error)) return undefined;
  if (error.status === 'FETCH_ERROR') return 'network';
  const data = error.data as { code?: unknown } | undefined;
  return typeof data?.code === 'string' ? data.code : undefined;
}

export const isUnauthenticated = (error: FetchBaseQueryError | SerializedError | undefined) =>
  !!error && 'status' in error && error.status === 401;
