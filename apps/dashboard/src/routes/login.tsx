import { createFileRoute, redirect } from '@tanstack/react-router';
import { authApi } from '@/features/auth/auth.api';
import { LoginPage } from '@/features/auth/components/login-page';

export type LoginSearch = {
  // الصفحة اللي كان فيها قبل الدخول (لينك جوه الداشبورد بس)
  redirect?: string;
  // الجلسة خلصت وهو جوه
  expired?: boolean;
};

const isInternalPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');

// الدخول (D-01 · docs/20 · 2.1). لو داخل أصلًا ← يكمّل على طول
export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: isInternalPath(search.redirect) ? search.redirect : undefined,
    expired: search.expired === true || search.expired === 'true' ? true : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    const query = context.store.dispatch(authApi.endpoints.getMe.initiate());
    const result = await query;
    query.unsubscribe();
    if (result.data) throw redirect({ href: search.redirect ?? '/' });
  },
  component: LoginPage,
});
