import { useState } from 'react';
import { Button, Card, Input, Table, Tabs, Typography } from 'antd';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { PersonAvatar } from '@/components/person-avatar';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { useGetBranchesQuery } from '@/features/branches/branches.api';
import { useGetStaffMembersQuery } from '../staff.api';
import type { StaffMember } from '../staff-types';
import { RolesPanel } from './roles-panel';
import { SettingsTabs } from './settings-tabs';
import { StaffDrawer } from './staff-drawer';

/**
 * الموظفين والأدوار (D-35 · docs/20 · 9.3): الموظفين (بحث · إضافة · تعديل · قفل) والأدوار وصلاحياتها (للأدمن).
 * مدير الفرع بيشوف موظفين فرعه بس ومن غير تاب الأدوار.
 */
export function StaffPage() {
  const { t } = useTranslation('settings');
  const { t: tNav } = useTranslation('nav');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const canStaff = useCan('staff.manage');
  const canRoles = useCan('roles.manage');
  const [tab, setTab] = useState<'people' | 'roles'>(canStaff ? 'people' : 'roles');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [creating, setCreating] = useState(false);
  const branches = useGetBranchesQuery();
  const staff = useGetStaffMembersQuery(undefined, { skip: !canStaff });

  const text = query.trim().toLowerCase();
  const rows = (staff.data ?? []).filter(
    (item) =>
      !text ||
      item.name_ar.toLowerCase().includes(text) ||
      item.name_en.toLowerCase().includes(text) ||
      item.email.toLowerCase().includes(text),
  );
  const branchName = (id: string) => {
    const branch = branches.data?.find((item) => item.id === id);
    return branch ? localized(branch, 'name', locale) : id;
  };

  const people = staff.isError ? (
    <ErrorState onRetry={() => void staff.refetch()} />
  ) : (
    <>
      <Input
        type="search"
        allowClear
        aria-label={t('staff.search')}
        placeholder={t('staff.search')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{ maxWidth: 300, marginBottom: 16 }}
      />
      <Table<StaffMember>
        rowKey="id"
        loading={staff.isLoading}
        dataSource={rows}
        pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <EmptyState title={t('staff.empty')} /> }}
        onRow={(item) => ({ onClick: () => setEditing(item), style: { cursor: 'pointer' } })}
        columns={[
          {
            key: 'name',
            title: t('staff.columns.name'),
            render: (_, item) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <PersonAvatar name={localized(item, 'name', locale)} size={32} />
                <span>
                  <Typography.Text strong style={{ display: 'block' }}>
                    {localized(item, 'name', locale)}
                  </Typography.Text>
                  <Typography.Text type="secondary" dir="ltr">
                    {item.email}
                  </Typography.Text>
                </span>
              </span>
            ),
          },
          {
            key: 'role',
            title: t('staff.columns.role'),
            render: (_, item) => tCommon(`roles.${item.role}`),
          },
          {
            key: 'branches',
            title: t('staff.columns.branches'),
            render: (_, item) => (
              <Typography.Text ellipsis style={{ maxWidth: 220 }}>
                {item.all_branches
                  ? t('staff.allBranches')
                  : item.branch_ids.map(branchName).join('، ')}
              </Typography.Text>
            ),
          },
          {
            key: 'status',
            title: t('staff.columns.status'),
            render: (_, item) => (
              <StatusTag tone={item.active ? 'success' : 'neutral'}>
                {t(item.active ? 'staff.active' : 'staff.inactive')}
              </StatusTag>
            ),
          },
        ]}
      />
    </>
  );

  return (
    <>
      <SettingsTabs active="staff" />
      <PageHeader
        title={tNav('settings')}
        description={t('staff.description')}
        extra={
          canStaff && tab === 'people' ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => setCreating(true)}
            >
              {t('staff.new')}
            </Button>
          ) : undefined
        }
      />
      <Card>
        {canStaff && canRoles ? (
          <Tabs
            activeKey={tab}
            onChange={(key) => setTab(key as 'people' | 'roles')}
            items={[
              { key: 'people', label: t('staff.tabs.people'), children: people },
              { key: 'roles', label: t('staff.tabs.roles'), children: <RolesPanel /> },
            ]}
          />
        ) : canStaff ? (
          people
        ) : (
          <RolesPanel />
        )}
      </Card>
      <StaffDrawer member={editing} open={editing !== null} onClose={() => setEditing(null)} />
      <StaffDrawer member={null} open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
