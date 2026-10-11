// أخطاء الإرسال اللي ممكن ترجع من أي فورم بيبعت للـAPI، وكل واحد ليه رسالة في الترجمة (DEC-36)
export type SubmitError = 'network' | 'rate-limited' | 'invalid' | 'server';

export function toSubmitError(error: unknown): SubmitError {
  const status = (error as { status?: unknown } | null)?.status;
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') return 'network';
  if (status === 429) return 'rate-limited';
  if (status === 400 || status === 422) return 'invalid';
  return 'server';
}

// النت مقطوع: منبعتش أصلًا، والكلام اللي اتكتب يفضل
export const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;
