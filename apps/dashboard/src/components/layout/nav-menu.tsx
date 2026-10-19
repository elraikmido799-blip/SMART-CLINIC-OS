import { Menu } from 'antd';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { hasAny, useMe } from '@/features/auth/use-me';
import { NAV_ITEMS } from './nav-items';
import { useCurrentNav } from './use-current-nav';

/** القايمة (في الـSider وفي الـDrawer بتاع الموبايل): الأقسام اللي في صلاحيات الموظف بس */
export function NavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const me = useMe();
  const { t } = useTranslation('nav');
  const current = useCurrentNav();

  const items = NAV_ITEMS.filter((item) => hasAny(me, item.anyOf)).map(
    ({ key, to, icon: Icon }) => ({
      key,
      icon: <Icon size={18} strokeWidth={1.75} aria-hidden />,
      label: (
        <Link to={to} onClick={onNavigate}>
          {t(key)}
        </Link>
      ),
    }),
  );

  return (
    <nav aria-label={t('label')}>
      <Menu
        mode="inline"
        selectedKeys={current ? [current] : []}
        items={items}
        style={{ borderInlineEnd: 0 }}
      />
    </nav>
  );
}
