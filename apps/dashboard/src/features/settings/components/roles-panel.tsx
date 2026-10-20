import { useState } from 'react';
import { Alert, App, Button, Checkbox, Drawer, Flex, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState } from '@/components/states/states';
import { PERMISSIONS, type Permission } from '@/features/auth/permissions';
import { useCan } from '@/features/auth/use-me';
import { apiErrorCode } from '@/lib/api-error';
import { useGetRolesQuery, useUpdateRoleMutation } from '../staff.api';
import type { RoleEntry } from '../staff-types';

// صلاحيات متجمعة بالمورد (الجزء اللي قبل النقطة)
const GROUPS = Object.entries(
  PERMISSIONS.reduce<Record<string, Permission[]>>((groups, permission) => {
    const resource = permission.split('.')[0];
    (groups[resource] ??= []).push(permission);
    return groups;
  }, {}),
);

/**
 * الأدوار والصلاحيات (D-35): قايمة الأدوار بعدد صلاحياتها، والضغط على دور بيفتح الصلاحيات متجمعة بالمورد (Checkbox).
 * الأدمن بس بيعدّل (`roles.manage`)، وغيره بيشوف. الأدمن مينفعش يشيل إدارة الأدوار والإعدادات من دوره.
 */
export function RolesPanel() {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { message } = App.useApp();
  const canEdit = useCan('roles.manage');
  const roles = useGetRolesQuery();
  const [update, { isLoading }] = useUpdateRoleMutation();
  const [editing, setEditing] = useState<RoleEntry | null>(null);
  const [selected, setSelected] = useState<Permission[]>([]);
  const [lockout, setLockout] = useState(false);

  if (roles.isError) return <ErrorState onRetry={() => void roles.refetch()} />;

  const open = (entry: RoleEntry) => {
    setEditing(entry);
    setSelected(entry.permissions);
    setLockout(false);
  };

  const save = async () => {
    if (!editing) return;
    try {
      await update({ role: editing.role, permissions: selected }).unwrap();
      void message.success(t('staff.roles.saved'));
      setEditing(null);
    } catch (error) {
      if (apiErrorCode(error as never) === 'LOCKOUT') setLockout(true);
      else void message.error(t('staff.errors.generic'));
    }
  };

  return (
    <>
      <Typography.Paragraph type="secondary">{t('staff.roles.description')}</Typography.Paragraph>
      <Table<RoleEntry>
        rowKey="role"
        loading={roles.isLoading}
        dataSource={roles.data ?? []}
        pagination={false}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <EmptyState /> }}
        onRow={(entry) => ({ onClick: () => open(entry), style: { cursor: 'pointer' } })}
        columns={[
          {
            key: 'role',
            title: t('staff.columns.role'),
            render: (_, entry) => tCommon(`roles.${entry.role}`),
          },
          {
            key: 'count',
            title: t('staff.roles.countLabel'),
            align: 'end',
            render: (_, entry) =>
              t('staff.roles.count', { count: formatNumber(entry.permissions.length, locale) }),
          },
        ]}
      />
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        destroyOnHidden
        size={520}
        title={editing ? t('staff.roles.edit', { role: tCommon(`roles.${editing.role}`) }) : ''}
        footer={
          <Flex justify="end" gap={8}>
            <Button onClick={() => setEditing(null)}>{t('cancel')}</Button>
            {canEdit && (
              <Button type="primary" loading={isLoading} onClick={() => void save()}>
                {t('staff.save')}
              </Button>
            )}
          </Flex>
        }
      >
        {!canEdit && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            title={t('staff.roles.readOnly')}
          />
        )}
        {lockout && (
          <Alert
            type="warning"
            showIcon
            role="alert"
            style={{ marginBottom: 12 }}
            title={t('staff.roles.lockout')}
          />
        )}
        {GROUPS.map(([resource, permissions]) => (
          <fieldset key={resource} style={{ border: 0, padding: 0, margin: '0 0 16px' }}>
            <legend style={{ fontWeight: 600, marginBottom: 4 }}>
              {t(`staff.roles.groups.${resource as 'patients'}`)}
            </legend>
            <Checkbox.Group
              disabled={!canEdit}
              value={selected}
              onChange={(values) => setSelected(values as Permission[])}
              style={{ display: 'grid', gap: 4 }}
              options={permissions.map((permission) => ({
                value: permission,
                label: <code dir="ltr">{permission}</code>,
              }))}
            />
          </fieldset>
        ))}
      </Drawer>
    </>
  );
}
