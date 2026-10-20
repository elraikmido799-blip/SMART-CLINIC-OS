import { Card, Flex, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { PhotosSection } from '@/features/photos/components/photos-section';
import { useGetPatientOverviewQuery } from '../patients.api';

/** تاب "الملفات والصور" (4.7): الملفات (الأحدث الأول) وتحتها صور المريض بالمقارنة. الصور بصلاحية §medical.read§ */
export function DocumentsTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('patients');
  const locale = useLocale();
  const canMedical = useCan('medical.read');
  const { data, isLoading, isError, refetch } = useGetPatientOverviewQuery(patientId);

  return (
    <Flex vertical gap={16}>
      <Card title={t('documents.title')}>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <Table
            rowKey="id"
            dataSource={data?.documents}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t('overview.noDocuments')} /> }}
            columns={[
              {
                title: t('documents.name'),
                dataIndex: 'title',
                render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
              },
              {
                title: t('documents.category'),
                dataIndex: 'category',
                render: (value: string) => (
                  <StatusTag tone="neutral">
                    {t(`overview.categories.${value}` as 'overview.categories.lab')}
                  </StatusTag>
                ),
              },
              {
                title: t('documents.date'),
                dataIndex: 'date',
                render: (value: string) => formatDate(value, locale),
              },
            ]}
          />
        )}
      </Card>
      {canMedical && <PhotosSection patientId={patientId} />}
    </Flex>
  );
}
