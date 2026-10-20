import { useState } from 'react';
import { Card, Select, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { BarList } from '@/components/charts/bar-list';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { LEAD_SOURCES, type LeadStage } from '@/features/crm/types';
import { useGetJourneyQuery } from '../dashboards.api';
import { DashboardTabs } from './dashboard-tabs';

const PERIODS = [
  { value: 30, key: 'month' },
  { value: 90, key: 'quarter' },
  { value: 0, key: 'all' },
] as const;

type Row = {
  stage: LeadStage;
  reached: number;
  share: number;
  dropOff: number | null;
  medianDays: number | null;
};

/**
 * رحلة المريض (D-30 · docs/20 · 8.3): كام عميل وصل لكل مرحلة من الـ12 (أو أبعد)، نسبة اللي وقفوا بين كل مرحلتين،
 * والوقت النموذجي بين المراحل. بفلتر المصدر والفترة، والفرع من الـTop bar. أكبر وقوف في الرحلة متعلّم.
 */
export function JourneyPage() {
  const { t } = useTranslation('dashboards');
  const { t: tCrm } = useTranslation('crm');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const [source, setSource] = useState<string>();
  const [days, setDays] = useState<number>(0);
  const journey = useGetJourneyQuery({ branch_id: branchId, source, days });
  const data = journey.data;

  const rows: Row[] = (data?.stages ?? []).map((stage, index, all) => {
    const previous = index > 0 ? all[index - 1].reached : null;
    return {
      stage: stage.stage,
      reached: stage.reached,
      share: data?.total ? stage.reached / data.total : 0,
      dropOff: previous ? Math.max(0, (previous - stage.reached) / previous) : null,
      medianDays: stage.median_days,
    };
  });
  const worst = rows.reduce<Row | null>(
    (top, row) => (row.dropOff !== null && (!top || row.dropOff > (top.dropOff ?? 0)) ? row : top),
    null,
  );
  const percent = (value: number) => `${formatNumber(Math.round(value * 100), locale)}%`;

  return (
    <>
      <DashboardTabs active="journey" />
      <PageHeader
        title={tNav('dashboards')}
        description={t('journey.description')}
        extra={
          <>
            <Select
              allowClear
              aria-label={t('journey.source')}
              placeholder={t('journey.source')}
              value={source}
              onChange={setSource}
              options={LEAD_SOURCES.map((value) => ({ value, label: tCrm(`sources.${value}`) }))}
              style={{ minWidth: 170, marginInlineEnd: 12 }}
            />
            <Select
              aria-label={t('journey.period')}
              value={days}
              onChange={setDays}
              options={PERIODS.map((item) => ({
                value: item.value,
                label: t(`journey.periods.${item.key}`),
              }))}
              style={{ minWidth: 150 }}
            />
          </>
        }
      />
      {journey.isLoading ? (
        <LoadingState />
      ) : journey.isError || !data ? (
        <ErrorState onRetry={() => void journey.refetch()} />
      ) : data.total === 0 ? (
        <Card>
          <EmptyState title={t('journey.empty')} />
        </Card>
      ) : (
        <>
          <Card
            title={t('journey.reached', { count: formatNumber(data.total, locale) })}
            style={{ marginBottom: 16 }}
          >
            <BarList
              label={t('journey.reachedLabel')}
              items={rows.map((row) => ({
                id: row.stage,
                label: tCrm(`stages.${row.stage}`),
                value: row.reached,
                text: `${formatNumber(row.reached, locale)} · ${percent(row.share)}`,
              }))}
            />
          </Card>
          <Card title={t('journey.dropOff')}>
            {worst && (
              <Typography.Paragraph>
                {t('journey.worst', {
                  stage: tCrm(`stages.${worst.stage}`),
                  percent: percent(worst.dropOff ?? 0),
                })}
              </Typography.Paragraph>
            )}
            <Table<Row>
              rowKey="stage"
              dataSource={rows}
              pagination={false}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  key: 'stage',
                  title: t('journey.columns.stage'),
                  render: (_, row) => tCrm(`stages.${row.stage}`),
                },
                {
                  key: 'reached',
                  title: t('journey.columns.reached'),
                  align: 'end',
                  render: (_, row) => formatNumber(row.reached, locale),
                },
                {
                  key: 'drop',
                  title: t('journey.columns.dropOff'),
                  align: 'end',
                  render: (_, row) =>
                    row.dropOff === null ? (
                      '—'
                    ) : row === worst ? (
                      <StatusTag tone="warning">{percent(row.dropOff)}</StatusTag>
                    ) : (
                      percent(row.dropOff)
                    ),
                },
                {
                  key: 'days',
                  title: t('journey.columns.days'),
                  align: 'end',
                  render: (_, row) =>
                    row.medianDays === null
                      ? '—'
                      : t('journey.daysValue', { count: row.medianDays }),
                },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}
