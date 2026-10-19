import { Tabs } from 'antd';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/features/auth/use-me';

/** أقسام الاستقبال: الطابور (3.4) · التحصيل (3.6) · تقفيل الخزنة (3.7) — كل واحد حسب الصلاحية */
export function FrontDeskTabs() {
  const { t } = useTranslation('billing');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const canQueue = useCan('checkin.write');
  const canCollect = useCan('billing.collect');

  const items = [
    ...(canQueue ? [{ key: '/front-desk', label: t('tabs.queue') }] : []),
    ...(canCollect
      ? [
          { key: '/front-desk/pos', label: t('tabs.pos') },
          { key: '/front-desk/closing', label: t('tabs.closing') },
        ]
      : []),
  ];

  return (
    <Tabs
      aria-label={t('tabs.label')}
      activeKey={pathname.replace(/\/$/, '')}
      onChange={(key) => navigate({ to: key })}
      items={items}
      style={{ marginTop: -12, marginBottom: 8 }}
    />
  );
}
