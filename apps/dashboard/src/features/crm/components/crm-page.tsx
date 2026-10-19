import { useState } from 'react';
import { App, Button, Card, Col, Flex, Input, Row, Select } from 'antd';
import { CalendarCheck, Clock, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { useCan, useMe } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { apiErrorCode } from '@/lib/api-error';
import { useNow } from '@/lib/use-now';
import {
  useGetCampaignsQuery,
  useGetCrmAgentsQuery,
  useGetLeadsQuery,
  useMoveLeadStageMutation,
} from '../crm.api';
import { withinSla } from '../sla';
import {
  LEAD_SOURCES,
  LEAD_STAGES,
  isManualStage,
  type Lead,
  type LeadSource,
  type LeadStage,
} from '../types';
import { LeadCard } from './lead-card';
import { LeadDrawer } from './lead-drawer';
import { NewLeadModal } from './new-lead-modal';

const PERIODS = [
  { value: 0, key: 'all' },
  { value: 1, key: 'today' },
  { value: 7, key: 'week' },
  { value: 30, key: 'month' },
] as const;

const WEEK = 7 * 86_400_000;
// المراحل اللي بعد "حجز" = اتحجز فعلًا
const BOOKED_AND_BEYOND = LEAD_STAGES.slice(LEAD_STAGES.indexOf('booked'));

/**
 * الـPipeline (D-20 · docs/20 · 6.1): فلاتر (الفرع · المصدر · الحملة · المسؤول · الفترة) · 3 أرقام (جداد الأسبوع · اتكلّموا في الـSLA · حجزوا) ·
 * لوحة بـ12 مرحلة. **3 مراحل بس بتتسحب** (Lead · Contacted · Qualified)، والباقي بيتحدث لوحده من الأحداث (docs/07 §3).
 * الـAgent أول شاشة ليه "My Leads" (فلتر المسؤول = هو).
 */
export function CrmPage() {
  const { t } = useTranslation('crm');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const me = useMe();
  const { message } = App.useApp();
  const now = useNow();
  const { branchId } = useBranchScope();
  const canCreate = useCan('leads.create');
  const canWrite = useCan('leads.write');
  const [source, setSource] = useState<LeadSource>();
  const [campaignId, setCampaignId] = useState<string>();
  const [agent, setAgent] = useState<string>(me.role === 'crm_agent' ? me.id : 'all');
  const [days, setDays] = useState<number>(0);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const campaigns = useGetCampaignsQuery();
  const agents = useGetCrmAgentsQuery();
  const leads = useGetLeadsQuery({
    branch_id: branchId,
    source,
    campaign_id: campaignId,
    assigned_to: agent === 'all' ? undefined : agent,
    days: days || undefined,
  });
  const [moveStage] = useMoveLeadStageMutation();

  const text = query.trim().toLowerCase();
  const all = leads.data ?? [];
  const visible = all.filter(
    (lead) =>
      !text ||
      lead.name.toLowerCase().includes(text) ||
      lead.phone.includes(text.replace(/^0/, '+20')),
  );
  const thisWeek = all.filter((lead) => now - Date.parse(lead.created_at) <= WEEK);
  const slaPercent = thisWeek.length
    ? Math.round((thisWeek.filter(withinSla).length / thisWeek.length) * 100)
    : 0;
  const booked = all.filter((lead) => BOOKED_AND_BEYOND.includes(lead.stage)).length;

  const move = async (lead: Lead, stage: LeadStage) => {
    try {
      await moveStage({ id: lead.id, stage }).unwrap();
    } catch (error) {
      void message.error(
        apiErrorCode(error as never) === 'STAGE_AUTOMATIC'
          ? t('errors.STAGE_AUTOMATIC')
          : t('errors.generic'),
      );
    }
  };

  const filterSelect = (
    label: string,
    value: string | undefined,
    onChange: (value: string | undefined) => void,
    options: { value: string; label: string }[],
  ) => (
    <Select
      allowClear
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={onChange}
      options={options}
      style={{ minWidth: 160 }}
    />
  );

  return (
    <>
      <PageHeader
        title={me.role === 'crm_agent' ? t('myLeads') : tNav('crm')}
        description={t('description')}
        extra={
          canCreate && branchId !== 'all' ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => setCreating(true)}
            >
              {t('new.button')}
            </Button>
          ) : undefined
        }
      />
      <Card style={{ marginBottom: 16 }}>
        <Flex wrap gap={12} align="center">
          {filterSelect(
            t('filters.source'),
            source,
            (value) => setSource(value as LeadSource | undefined),
            LEAD_SOURCES.map((value) => ({ value, label: t(`sources.${value}`) })),
          )}
          {filterSelect(
            t('filters.campaign'),
            campaignId,
            setCampaignId,
            (campaigns.data ?? []).map((item) => ({ value: item.id, label: item.name })),
          )}
          <Select
            aria-label={t('filters.agent')}
            value={agent}
            onChange={setAgent}
            options={[
              { value: 'all', label: t('filters.allAgents') },
              ...(agents.data ?? []).map((item) => ({
                value: item.id,
                label: localized(item, 'name', locale),
              })),
            ]}
            style={{ minWidth: 160 }}
          />
          <Select
            aria-label={t('filters.period')}
            value={days}
            onChange={setDays}
            options={PERIODS.map((item) => ({
              value: item.value,
              label: t(`periods.${item.key}`),
            }))}
            style={{ minWidth: 150 }}
          />
          <Input
            type="search"
            allowClear
            aria-label={t('filters.search')}
            placeholder={t('filters.search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ flex: '1 1 200px', maxWidth: 280 }}
          />
        </Flex>
      </Card>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Users size={20} />}
            label={t('kpi.newThisWeek')}
            value={formatNumber(thisWeek.length, locale)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Clock size={20} />}
            label={t('kpi.sla')}
            value={`${formatNumber(slaPercent, locale)}%`}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<CalendarCheck size={20} />}
            label={t('kpi.booked')}
            value={formatNumber(booked, locale)}
          />
        </Col>
      </Row>
      {leads.isLoading ? (
        <LoadingState />
      ) : leads.isError ? (
        <ErrorState onRetry={() => void leads.refetch()} />
      ) : all.length === 0 ? (
        <Card>
          <EmptyState title={t('empty.title')} description={t('empty.body')} />
        </Card>
      ) : (
        <KanbanBoard
          ariaLabel={t('board.region')}
          emptyText={t('board.emptyColumn')}
          columns={LEAD_STAGES.map((stage) => ({
            id: stage,
            title: t(`stages.${stage}`),
            subtitle: isManualStage(stage) ? t('board.manual') : t('board.auto'),
            count: visible.filter((lead) => lead.stage === stage).length,
          }))}
          items={visible}
          columnOf={(lead) => lead.stage}
          dragLabel={(lead) => t('card.drag', { name: lead.name })}
          onMove={canWrite ? (lead, stage) => void move(lead, stage as LeadStage) : null}
          canDrag={(lead) => isManualStage(lead.stage)}
          canDrop={(_lead, stage) => isManualStage(stage as LeadStage)}
          renderCard={(lead) => (
            <LeadCard
              lead={lead}
              now={now}
              canMove={canWrite}
              onOpen={(item) => setSelectedId(item.id)}
              onMove={(item, stage) => void move(item, stage)}
            />
          )}
        />
      )}
      <LeadDrawer
        lead={all.find((item) => item.id === selectedId) ?? null}
        onClose={() => setSelectedId(null)}
      />
      {branchId !== 'all' && (
        <NewLeadModal branchId={branchId} open={creating} onClose={() => setCreating(false)} />
      )}
    </>
  );
}
