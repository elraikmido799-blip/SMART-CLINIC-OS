import { useState } from 'react';
import { Button, Card, DatePicker, Flex, Select, Table, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney, formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { downloadCsv, toCsv } from '@/lib/export-csv';
import { clinicToday } from '@/lib/clinic-time';
import { useGetReportQuery } from '../reports.api';
import { REPORT_CODES, type ColumnType, type Report, type ReportCode } from '../types';

type Cell = string | number;

/**
 * التقارير والتصدير (D-32 · docs/20 · 8.4): 5 تقارير جاهزة بفلتر فترة (والفرع من الـTop bar). المعاينة جدول،
 * و"Excel" بينزّل CSV بيتفتح في Excel بالعربي صح، و"PDF" بيفتح الطباعة (احفظ كـPDF). xlsx وPDF الحقيقيين شغل الباك (DEC-69).
 */
export function ReportsPage() {
  const { t } = useTranslation('reports');
  const { t: tCrm } = useTranslation('crm');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const [code, setCode] = useState<ReportCode>('revenue_daily');
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs(clinicToday()).subtract(29, 'day'),
    dayjs(clinicToday()),
  ]);
  const report = useGetReportQuery({
    code,
    branch_id: branchId,
    from: range[0].format('YYYY-MM-DD'),
    to: range[1].format('YYYY-MM-DD'),
  });
  const data = report.data;

  // قيم النص اللي هي مفاتيح (مصدر · قناة · حالة) بتتترجم، والباقي زي ما هو
  const text = (key: string, value: Cell) => {
    if (key === 'source') return tCrm(`sources.${value as 'facebook'}`);
    if (key === 'channel') return tCrm(`channels.${value as 'facebook'}`);
    if (key === 'status') return t(`statuses.${value as 'pending'}`);
    return String(value);
  };

  const show = (key: string, type: ColumnType, value: Cell) => {
    if (type === 'money') return formatMoney(Number(value), 'EGP', locale);
    if (type === 'number') return formatNumber(Number(value), locale);
    if (type === 'percent') return `${formatNumber(Math.round(Number(value) * 100), locale)}%`;
    if (type === 'date') return formatDate(String(value), locale);
    return text(key, value);
  };

  // الأرقام في الملف أرقام حقيقية (جنيه ونسبة مئوية) عشان Excel يجمعها
  const exportValue = (key: string, type: ColumnType, value: Cell): Cell => {
    if (type === 'money') return Number(value) / 100;
    if (type === 'percent') return Math.round(Number(value) * 1000) / 10;
    if (type === 'date' || type === 'number') return value;
    return text(key, value);
  };

  const exportExcel = (current: Report) =>
    downloadCsv(
      `${current.code}-${range[0].format('YYYY-MM-DD')}_${range[1].format('YYYY-MM-DD')}.csv`,
      toCsv(
        current.columns.map((column) => t(`columns.${column.key as 'date'}`)),
        current.rows.map((row) =>
          current.columns.map((column) => exportValue(column.key, column.type, row[column.key])),
        ),
      ),
    );

  return (
    <>
      <PageHeader
        title={tNav('reports')}
        description={t('description')}
        extra={
          <Flex gap={8} wrap>
            <Button
              icon={<Download size={16} aria-hidden />}
              disabled={!data?.rows.length}
              onClick={() => data && exportExcel(data)}
            >
              {t('export.excel')}
            </Button>
            <Button
              icon={<Printer size={16} aria-hidden />}
              disabled={!data?.rows.length}
              onClick={() => window.print()}
            >
              {t('export.pdf')}
            </Button>
          </Flex>
        }
      />
      <Card style={{ marginBottom: 16 }}>
        <Flex wrap gap={12} align="center">
          <Select
            aria-label={t('report')}
            value={code}
            onChange={setCode}
            options={REPORT_CODES.map((value) => ({ value, label: t(`reports.${value}`) }))}
            style={{ minWidth: 220 }}
          />
          <DatePicker.RangePicker
            allowClear={false}
            aria-label={t('range')}
            value={range}
            onChange={(value) => value?.[0] && value[1] && setRange([value[0], value[1]])}
            presets={[
              {
                label: t('presets.week'),
                value: [dayjs(clinicToday()).subtract(6, 'day'), dayjs(clinicToday())],
              },
              {
                label: t('presets.month'),
                value: [dayjs(clinicToday()).subtract(29, 'day'), dayjs(clinicToday())],
              },
              {
                label: t('presets.quarter'),
                value: [dayjs(clinicToday()).subtract(89, 'day'), dayjs(clinicToday())],
              },
            ]}
          />
        </Flex>
      </Card>
      <Card>
        <Typography.Title level={2} style={{ fontSize: 18, marginTop: 0 }}>
          {t(`reports.${code}`)}
        </Typography.Title>
        {report.isError ? (
          <ErrorState onRetry={() => void report.refetch()} />
        ) : (
          <Table<Record<string, Cell>>
            rowKey={(_, index) => String(index)}
            loading={report.isFetching}
            dataSource={data?.rows ?? []}
            pagination={{ pageSize: 20, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 560 }}
            locale={{ emptyText: <EmptyState title={t('empty')} /> }}
            columns={(data?.columns ?? []).map((column) => ({
              key: column.key,
              title: t(`columns.${column.key as 'date'}`),
              align: column.type === 'text' || column.type === 'date' ? undefined : 'end',
              render: (_: unknown, row: Record<string, Cell>) =>
                show(column.key, column.type, row[column.key]),
            }))}
          />
        )}
      </Card>
    </>
  );
}
