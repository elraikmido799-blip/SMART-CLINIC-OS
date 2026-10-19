import { createRouter } from '@tanstack/react-router';
import type { NavKey } from '@/components/layout/nav-items';
import { routeTree } from '@/routeTree.gen';
import { store } from '@/store/store';

export type RouterContext = { store: typeof store };

export const router = createRouter({
  routeTree,
  context: { store },
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  // كل صفحة بتقول هي تبع أنهي قسم في القايمة: الـLayout بيعلّم عليه، وبيقفل الصفحة لو مش في صلاحياتك
  interface StaticDataRouteOption {
    nav?: NavKey;
  }
}
