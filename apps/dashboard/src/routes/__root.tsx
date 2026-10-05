import { createRootRoute, Outlet } from '@tanstack/react-router';

// الـLayout العام (Sidebar + Top bar) هيتحط هنا لما نبدأ خطة الداشبورد
export const Route = createRootRoute({
  component: () => <Outlet />,
});
