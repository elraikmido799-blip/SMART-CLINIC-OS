import { Segmented } from 'antd';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSettingsSections, type SettingsSection } from '../sections';

/** التنقل جوه الإعدادات. لو قسم واحد بس متاح مبيظهرش */
export function SettingsTabs({ active }: { active: SettingsSection }) {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const visible = useSettingsSections();

  if (visible.length < 2) return null;

  return (
    <div style={{ overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
      <Segmented
        aria-label={t('tabs.label')}
        value={active}
        onChange={(value) => {
          const target = visible.find((item) => item.key === value);
          if (target) void navigate({ to: target.to });
        }}
        options={visible.map((item) => ({ value: item.key, label: t(`tabs.${item.key}`) }))}
      />
    </div>
  );
}

/** `/settings` بيفتح أول قسم متاح للموظف */
export function SettingsHome() {
  const visible = useSettingsSections();
  return visible[0] ? <Navigate to={visible[0].to} replace /> : null;
}
