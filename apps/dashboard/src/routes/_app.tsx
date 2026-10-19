import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { Flex } from 'antd';
import { AppLayout } from '@/components/layout/app-layout';
import { DotsLoader, ErrorState } from '@/components/states/states';
import { authApi } from '@/features/auth/auth.api';
import { isUnauthenticated } from '@/lib/api-error';

/**
 * كل الصفحات اللي محتاجة دخول (Layout من غير URL).
 * الـGuard: مش داخل ← /login (وبعد الدخول بيرجع لنفس الصفحة). أي خطأ تاني = صفحة خطأ بزرار "جرّب تاني".
 */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const query = context.store.dispatch(authApi.endpoints.getMe.initiate());
    const result = await query;
    query.unsubscribe();
    if (isUnauthenticated(result.error)) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    if (!result.data) throw new Error('ME_FAILED');
  },
  pendingComponent: () => (
    <Flex justify="center" align="center" style={{ minHeight: '100dvh' }}>
      <DotsLoader />
    </Flex>
  ),
  errorComponent: AppError,
  component: AppLayout,
});

function AppError() {
  const router = useRouter();
  return (
    <Flex component="main" justify="center" align="center" style={{ minHeight: '100dvh' }}>
      <ErrorState level={1} onRetry={() => router.invalidate()} />
    </Flex>
  );
}
