import { Card, Col, Row, Table } from 'antd';
import { Banknote, CalendarCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney, formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useGetCampaignsQuery, useGetLeadsQuery } from '../crm.api';
import { LEAD_STAGES, type Campaign } from '../types';
import { CrmTabs } from './crm-tabs';

const BOOKED_AND_BEYOND = LEAD_STAGES.slice(LEAD_STAGES.indexOf('booked'));

type Row = Campaign & { leads: number; booked: number };

/**
 * الحملات (D-23 · docs/20 · 6.4): كل حملة بقناتها وفترتها وميزانيتها، وكام عميل وحجز جابت، وتكلفة العميل.
 * الأرقام بتتحسب من العملاء المفتوحين في الفرع المختار (اللي اتحوّلوا أو خسروا مش داخلين).
 */
export function CampaignsPage() {
  const { t } = useTranslation('crm');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const campaigns = useGetCampaignsQuery();
  const leads = useGetLeadsQuery({ branch_id: branchId });

  const rows: Row[] = (campaigns.data ?? []).map((campaign) => {
    const own = (leads.data ?? []).filter((lead) => lead.campaign?.id === campaign.id);
    return {
      ...campaign,
      leads: own.length,
      booked: own.filter((lead) => BOOKED_AND_BEYOND.includes(lead.stage)).length,
    };
  });
  const budget = rows.reduce((sum, row) => sum + row.budget, 0);
  const totalLeads = rows.reduce((sum, row) => sum + row.leads, 0);
  const totalBooked = rows.reduce((sum, row) => sum + row.booked, 0);
  const costPerLead = (row: { budget: number; leads: number }) =>
    row.leads ? formatMoney(Math.round(row.budget / row.leads), 'EGP', locale) : '—';

  return (
    <>
      <CrmTabs active="campaigns" />
      <PageHeader title={tNav('crm')} description={t('campaigns.description')} />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Banknote size={20} />}
            label={t('campaigns.kpi.budget')}
            value={formatMoney(budget, 'EGP', locale)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Users size={20} />}
            label={t('campaigns.kpi.leads')}
            value={formatNumber(totalLeads, locale)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<CalendarCheck size={20} />}
            label={t('campaigns.kpi.booked')}
            value={formatNumber(totalBooked, locale)}
          />
        </Col>
      </Row>
      <Card>
        {campaigns.isError || leads.isError ? (
          <ErrorState
            onRetry={() => {
              void campaigns.refetch();
              void leads.refetch();
            }}
          />
        ) : (
          <Table<Row>
            rowKey="id"
            loading={campaigns.isLoading || leads.isLoading}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 760 }}
            locale={{ emptyText: <EmptyState title={t('campaigns.empty')} /> }}
            columns={[
              { key: 'name', title: t('campaigns.name'), dataIndex: 'name' },
              {
                key: 'channel',
                title: t('campaigns.channel'),
                render: (_, row) => (
                  <StatusTag tone="neutral">{t(`channels.${row.channel}`)}</StatusTag>
                ),
              },
              {
                key: 'period',
                title: t('campaigns.period'),
                render: (_, row) =>
                  `${formatDate(row.starts_on, locale)} → ${
                    row.ends_on ? formatDate(row.ends_on, locale) : t('campaigns.ongoing')
                  }`,
              },
              {
                key: 'budget',
                title: t('campaigns.budget'),
                align: 'end',
                render: (_, row) => formatMoney(row.budget, 'EGP', locale),
              },
              {
                key: 'leads',
                title: t('campaigns.leads'),
                align: 'end',
                render: (_, row) => formatNumber(row.leads, locale),
              },
              {
                key: 'booked',
                title: t('campaigns.booked'),
                align: 'end',
                render: (_, row) => formatNumber(row.booked, locale),
              },
              {
                key: 'cpl',
                title: t('campaigns.costPerLead'),
                align: 'end',
                render: (_, row) => costPerLead(row),
              },
            ]}
          />
        )}
      </Card>
    </>
  );
}
