import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { RouterContext } from '@/app/router';
import { NotFoundState } from '@/components/states/states';

// الأساس: صفحة الدخول بره، وكل الباقي جوه _app (الـGuard + الـLayout)
export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundState,
});
