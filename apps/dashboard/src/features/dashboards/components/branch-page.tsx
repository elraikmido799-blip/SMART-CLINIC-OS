import { useState } from 'react';
import { Card, Col, Row, Segmented, Select, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { BarList } from '@/components/charts/bar-list';
import { Donut } from '@/components/charts/donut';
import { LineChart } from '@/components/charts/line-chart';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states/states';
import { SpecialtyTag } from '@/components/tags';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useGetBranchDashboardQuery } from '../dashboards.api';
import { DASHBOARD_PERIODS, type BranchDashboard, type DashboardPeriod } from '../types';
import { DashboardTabs } from './dashboard-tabs';
import { KpiGrid } from './kpi-grid';

/**
 * داشبورد الفرع (D-29 · docs/20 · 8.2): نفس أرقام الـCEO لفرع واحد + إيراد يوم بيوم + أداء الدكاترة
 * (مكتمل · No-show · الإيراد المنسوب) + استخدام الأوض + حالات المواعيد. لمدير الفرع فرعه، ولمدير العمليات
 * بيختار الفرع من هنا لو الـTop bar على "كل الفروع".
 */
export function BranchPage() {
  const { t } = useTranslation('dashboards');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId, branches } = useBranchScope();
  const [days, setDays] = useState<DashboardPeriod>(30);
  const [picked, setPicked] = useState<string>();
  const branch = branchId === 'all' ? (picked ?? branches[0]?.id ?? '') : branchId;
  const data = useGetBranchDashboardQuery({ branch_id: branch, days }, { skip: !branch });
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);
  const result = data.data;

  return (
    <>
      <DashboardTabs active="branch" />
      <PageHeader
        title={tNav('dashboards')}
        description={t('branch.description')}
        extra={
          <>
            {branchId === 'all' && (
              <Select
                aria-label={t('branch.pick')}
                value={branch}
                onChange={setPicked}
                options={branches.map((item) => ({
                  value: item.id,
                  label: localized(item, 'name', locale),
                }))}
                style={{ minWidth: 180, marginInlineEnd: 12 }}
              />
            )}
            <Segmented
              aria-label={t('period.label')}
              value={days}
              onChange={setDays}
              options={DASHBOARD_PERIODS.map((value) => ({
                value,
                label: t(`period.${value}`),
              }))}
            />
          </>
        }
      />
      {data.isLoading || !branch ? (
        <LoadingState />
      ) : data.isError || !result ? (
        <ErrorState onRetry={() => void data.refetch()} />
      ) : (
        <BranchBody result={result} money={money} />
      )}
    </>
  );
}

function BranchBody({
  result,
  money,
}: {
  result: BranchDashboard;
  money: (value: number) => string;
}) {
  const { t } = useTranslation('dashboards');
  const locale = useLocale();

  return (
    <>
      <KpiGrid kpis={result.kpis} />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={14}>
          <Card title={t('executive.revenue')}>
            <LineChart
              dates={result.revenue_series.map((point) => point.date)}
              series={[
                { name: t('executive.cash'), values: result.revenue_series.map((p) => p.cash) },
                { name: t('executive.earned'), values: result.revenue_series.map((p) => p.earned) },
              ]}
              summary={t('executive.revenueSummary', {
                cash: money(result.revenue_series.reduce((sum, p) => sum + p.cash, 0)),
                earned: money(result.revenue_series.reduce((sum, p) => sum + p.earned, 0)),
              })}
              format={(value) => formatNumber(Math.round(value / 100), locale)}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title={t('branch.statuses')}>
            <Donut
              label={t('branch.statuses')}
              slices={result.statuses.map((item) => ({
                id: item.status,
                label: t(`branch.status.${item.status}`),
                value: item.count,
              }))}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title={t('branch.doctors')}>
            <Table<BranchDashboard['doctors'][number]>
              rowKey="id"
              dataSource={result.doctors}
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  key: 'name',
                  title: t('branch.columns.doctor'),
                  render: (_, row) => (
                    <>
                      {localized(row, 'name', locale)}{' '}
                      <SpecialtyTag
                        specialty={row.specialty as Parameters<typeof SpecialtyTag>[0]['specialty']}
                      />
                    </>
                  ),
                },
                {
                  key: 'completed',
                  title: t('branch.columns.completed'),
                  align: 'end',
                  render: (_, row) => formatNumber(row.completed, locale),
                },
                {
                  key: 'noShow',
                  title: t('branch.columns.noShow'),
                  align: 'end',
                  render: (_, row) =>
                    `${formatNumber(Math.round(row.no_show_rate * 1000) / 10, locale)}%`,
                },
                {
                  key: 'revenue',
                  title: t('branch.columns.revenue'),
                  align: 'end',
                  render: (_, row) => money(row.revenue),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title={t('branch.rooms')}>
            <BarList
              label={t('branch.rooms')}
              items={result.rooms.map((room) => ({
                id: room.id,
                label: localized(room, 'name', locale),
                value: room.utilization,
                text: `${formatNumber(Math.round(room.utilization * 100), locale)}%`,
              }))}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
