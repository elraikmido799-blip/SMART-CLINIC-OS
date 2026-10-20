import { Button, Card, Table } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatDate, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useGetPatientEncountersQuery } from '../encounters.api';
import type { EncounterSummary } from '../types';

/** تاب "الكشوفات" في ملف المريض: كل كشوفاته (مسودة أو موقّعة) وبيفتح أي واحد */
export function EncountersTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('encounters');
  const locale = useLocale();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetPatientEncountersQuery(patientId);

  return (
    <Card>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <Table<EncounterSummary>
          rowKey="id"
          dataSource={data}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <EmptyState title={t('tab.empty')} /> }}
          columns={[
            {
              title: t('tab.date'),
              dataIndex: 'date',
              render: (value: string) => formatDate(value, locale),
            },
            {
              title: t('tab.form'),
              render: (_, item) => (
                <>
                  <SpecialtyTag specialty={item.specialty} />
                  <div>{locale === 'ar' ? item.template_title_ar : item.template_title_en}</div>
                </>
              ),
            },
            {
              title: t('tab.practitioner'),
              render: (_, item) => localized(item.practitioner, 'name', locale),
            },
            {
              title: t('tab.status'),
              render: (_, item) => (
                <StatusTag tone={item.status === 'signed' ? 'success' : 'warning'}>
                  {t(`tab.statuses.${item.status}`)}
                </StatusTag>
              ),
            },
            {
              title: t('tab.actions'),
              render: (_, item) => (
                <Button
                  size="small"
                  onClick={() =>
                    void navigate({
                      to: '/encounters/$encounterId',
                      params: { encounterId: item.id },
                    })
                  }
                >
                  {t('tab.open')}
                </Button>
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}
