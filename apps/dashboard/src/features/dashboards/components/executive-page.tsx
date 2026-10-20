import { useState } from 'react';
import { Card, Col, Row, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { BarList } from '@/components/charts/bar-list';
import { Donut } from '@/components/charts/donut';
import { LineChart } from '@/components/charts/line-chart';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states/states';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useGetExecutiveQuery } from '../dashboards.api';
import { DASHBOARD_PERIODS, type DashboardPeriod } from '../types';
import { KpiGrid } from './kpi-grid';

/**
 * داشبورد الـCEO (D-28 · docs/20 · 8.1): الأرقام السبعة بمقارنتها بالفترة اللي قبلها · الإيراد Cash مقابل المكتسب ·
 * مقارنة الفروع (لما يكون أكتر من فرع) · الـFunnel (Lead ← حجز ← زيارة ← دفع) · مصادر العملاء.
 * الفرع من الـTop bar، والفترة من هنا.
 */
export function ExecutivePage() {
  const { t } = useTranslation('dashboards');
  const { t: tCrm } = useTranslation('crm');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId, branches } = useBranchScope();
  const [days, setDays] = useState<DashboardPeriod>(30);
  const data = useGetExecutiveQuery({ branch_id: branchId, days });
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);

  const nameOf = (id: string) => {
    const branch = branches.find((item) => item.id === id);
    return branch ? localized(branch, 'name', locale) : id;
  };

  const result = data.data;
  const funnelTop = result?.funnel[0]?.count ?? 0;

  return (
    <>
      <PageHeader
        title={tNav('dashboards')}
        description={t('executive.description')}
        extra={
          <Segmented
            aria-label={t('period.label')}
            value={days}
            onChange={setDays}
            options={DASHBOARD_PERIODS.map((value) => ({
              value,
              label: t(`period.${value}`),
            }))}
          />
        }
      />
      {data.isLoading ? (
        <LoadingState />
      ) : data.isError || !result ? (
        <ErrorState onRetry={() => void data.refetch()} />
      ) : (
        <>
          <KpiGrid kpis={result.kpis} />
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} xl={result.branches.length > 1 ? 14 : 24}>
              <Card title={t('executive.revenue')}>
                <LineChart
                  dates={result.revenue_series.map((point) => point.date)}
                  series={[
                    { name: t('executive.cash'), values: result.revenue_series.map((p) => p.cash) },
                    {
                      name: t('executive.earned'),
                      values: result.revenue_series.map((p) => p.earned),
                    },
                  ]}
                  summary={t('executive.revenueSummary', {
                    cash: money(result.revenue_series.reduce((sum, p) => sum + p.cash, 0)),
                    earned: money(result.revenue_series.reduce((sum, p) => sum + p.earned, 0)),
                  })}
                  format={(value) => formatNumber(Math.round(value / 100), locale)}
                />
              </Card>
            </Col>
            {result.branches.length > 1 && (
              <Col xs={24} xl={10}>
                <Card title={t('executive.branches')}>
                  <BarList
                    label={t('executive.branches')}
                    items={[...result.branches]
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((item) => ({
                        id: item.branch_id,
                        label: nameOf(item.branch_id),
                        value: item.revenue,
                        text: money(item.revenue),
                        hint: t('executive.branchHint', {
                          patients: formatNumber(item.patients, locale),
                          conversion: formatNumber(Math.round(item.conversion * 100), locale),
                        }),
                      }))}
                  />
                </Card>
              </Col>
            )}
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <Card title={t('executive.funnel')}>
                <BarList
                  label={t('executive.funnel')}
                  items={result.funnel.map((step) => ({
                    id: step.step,
                    label: t(`funnel.${step.step}`),
                    value: step.count,
                    text: `${formatNumber(step.count, locale)} · ${
                      funnelTop
                        ? formatNumber(Math.round((step.count / funnelTop) * 100), locale)
                        : 0
                    }%`,
                  }))}
                />
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card title={t('executive.sources')}>
                <Donut
                  label={t('executive.sources')}
                  slices={result.sources.map((item) => ({
                    id: item.source,
                    label: tCrm(`sources.${item.source}`),
                    value: item.count,
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
