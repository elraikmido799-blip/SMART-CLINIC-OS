import { lazy, Suspense, useEffect, useState } from 'react';
import { Drawer, Grid, Layout } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { useGetMeQuery } from '@/features/auth/auth.api';
import { hasAny, useMe } from '@/features/auth/use-me';
import { ForbiddenState } from '@/components/states/states';
import { env } from '@/lib/env';
import { isUnauthenticated } from '@/lib/api-error';
import { AppHeader } from './app-header';
import { NavMenu } from './nav-menu';
import { useCurrentNav } from './use-current-nav';
import { navItem } from './nav-items';

// أدوات التجربة (مبدّل الدور وحالة الـAPI): في وضع الـMocks بس، وبتتمسح مع فولدر mocks (والسطر ده)
const MockTools = env.apiMocking ? lazy(() => import('@/mocks/mock-tools')) : null;

function Logo({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const { t: tNav } = useTranslation('nav');
  return (
    <Link
      to="/"
      aria-label={tNav('home')}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: collapsed ? '20px 0' : '20px 0 12px',
      }}
    >
      {collapsed ? (
        <img src="/logo-symbol.png" alt={t('app.logoAlt')} width={40} height={40} />
      ) : (
        <img src="/logo.png" alt={t('app.logoAlt')} width={116} height={107} />
      )}
    </Link>
  );
}

// لو الجلسة خلصت وإنت جوه: صفحة الدخول، وبعدها ترجع لنفس الصفحة
function useSessionWatch() {
  const { error } = useGetMeQuery();
  const navigate = useNavigate();
  const { href } = useLocation();

  useEffect(() => {
    if (isUnauthenticated(error))
      void navigate({ to: '/login', search: { redirect: href, expired: true } });
  }, [error, href, navigate]);
}

/**
 * الـLayout بتاع كل الصفحات اللي ورا الدخول (زي D-02-reception.png):
 * Sider أبيض (اللوجو + القايمة بس) · Top bar · المحتوى. التابلت: الـSider أيقونات · الموبايل: Drawer.
 */
export function AppLayout() {
  const me = useMe();
  const { i18n } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;
  const collapsed = screens.lg === false;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const nav = useCurrentNav();
  const allowed = !nav || hasAny(me, navItem(nav).anyOf);
  useSessionWatch();

  return (
    <Layout style={{ minHeight: '100dvh' }}>
      {!isMobile && (
        <Layout.Sider
          width={248}
          collapsedWidth={80}
          collapsed={collapsed}
          trigger={null}
          style={{
            position: 'sticky',
            top: 0,
            height: '100dvh',
            overflowY: 'auto',
            borderInlineEnd: `1px solid ${tokens.color.border}`,
          }}
        >
          <Logo collapsed={collapsed} />
          <NavMenu />
        </Layout.Sider>
      )}
      <Layout>
        <AppHeader isMobile={isMobile} onOpenMenu={() => setDrawerOpen(true)} />
        <Layout.Content style={{ padding: isMobile ? 16 : 24 }}>
          {allowed ? <Outlet /> : <ForbiddenState />}
        </Layout.Content>
      </Layout>
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement={i18n.dir() === 'rtl' ? 'right' : 'left'}
          size={280}
          styles={{ body: { padding: 0 } }}
          title={null}
        >
          <Logo collapsed={false} />
          <NavMenu onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}
      {MockTools && (
        <Suspense fallback={null}>
          <MockTools />
        </Suspense>
      )}
    </Layout>
  );
}
