import { useState } from 'react';
import { Card, Flex, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useGetStaffMembersQuery } from '../staff.api';
import { AUDIT_ACTIONS, AUDIT_ENTITIES, type AuditAction, type AuditEntity } from '../audit-types';
import { AuditTable } from './audit-table';
import { SettingsTabs } from './settings-tabs';

const PERIODS = [
  { value: 1, key: 'today' },
  { value: 7, key: 'week' },
  { value: 14, key: 'twoWeeks' },
] as const;

/**
 * سجل العمليات (D-39 · docs/20 · 9.7): مين عمل إيه وإمتى، بفلاتر (الفترة · الفعل · على إيه · الموظف) والفرع من الـTop bar.
 * قراءة بس: مفيش تعديل ولا مسح. فلتر الموظف للي عنده `staff.manage` (قايمة الموظفين محتاجاها).
 */
export function AuditPage() {
  const { t } = useTranslation('settings');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const [days, setDays] = useState<number>(7);
  const [action, setAction] = useState<AuditAction>();
  const [entity, setEntity] = useState<AuditEntity>();
  const [actorId, setActorId] = useState<string>();
  const staff = useGetStaffMembersQuery(undefined, { skip: false });

  return (
    <>
      <SettingsTabs active="audit" />
      <PageHeader title={tNav('settings')} description={t('audit.description')} />
      <Card style={{ marginBottom: 16 }}>
        <Flex wrap gap={12}>
          <Select
            aria-label={t('audit.filters.period')}
            value={days}
            onChange={setDays}
            options={PERIODS.map((item) => ({
              value: item.value,
              label: t(`audit.periods.${item.key}`),
            }))}
            style={{ minWidth: 150 }}
          />
          <Select
            allowClear
            aria-label={t('audit.filters.action')}
            placeholder={t('audit.filters.action')}
            value={action}
            onChange={setAction}
            options={AUDIT_ACTIONS.map((value) => ({ value, label: t(`audit.actions.${value}`) }))}
            style={{ minWidth: 150 }}
          />
          <Select
            allowClear
            aria-label={t('audit.filters.entity')}
            placeholder={t('audit.filters.entity')}
            value={entity}
            onChange={setEntity}
            options={AUDIT_ENTITIES.map((value) => ({
              value,
              label: t(`audit.entities.${value}`),
            }))}
            style={{ minWidth: 150 }}
          />
          {staff.data && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              aria-label={t('audit.filters.actor')}
              placeholder={t('audit.filters.actor')}
              value={actorId}
              onChange={setActorId}
              options={staff.data.map((item) => ({
                value: item.id,
                label: localized(item, 'name', locale),
              }))}
              style={{ minWidth: 180 }}
            />
          )}
        </Flex>
      </Card>
      <Card>
        <AuditTable query={{ branch_id: branchId, days, action, entity, actor_id: actorId }} />
      </Card>
    </>
  );
}
