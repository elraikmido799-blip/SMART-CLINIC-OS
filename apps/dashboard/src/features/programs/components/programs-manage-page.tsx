import { Button, Card, Table } from 'antd';
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import type { Tone } from '@/app/tones';
import { useCan } from '@/features/auth/use-me';
import { useGetProgramsQuery } from '../programs.api';
import type { ProgramStatus, ProgramSummary } from '../types';

const STATUS_TONE: Record<ProgramStatus, Tone> = {
  draft: 'warning',
  active: 'success',
  archived: 'neutral',
};

/** قايمة البرامج (D-18 · docs/20 · 5.1): البرنامج وعدد مراحله والمسجّلين فيه وحالته */
export function ProgramsManagePage() {
  const { t } = useTranslation('programs');
  const locale = useLocale();
  const navigate = useNavigate();
  const canBuild = useCan('builders.manage');
  const { data, isLoading, isError, refetch } = useGetProgramsQuery();

  return (
    <>
      <PageHeader
        title={t('manage.title')}
        description={t('manage.description')}
        extra={
          canBuild ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => void navigate({ to: '/programs/builder/$id', params: { id: 'new' } })}
            >
              {t('manage.new')}
            </Button>
          ) : undefined
        }
      />
      <Card>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <Table<ProgramSummary>
            rowKey="id"
            dataSource={data}
            pagination={false}
            scroll={{ x: 520 }}
            locale={{ emptyText: <EmptyState title={t('manage.empty')} /> }}
            columns={[
              {
                title: t('manage.program'),
                render: (_, item) => (
                  <>
                    <div style={{ fontWeight: 600 }}>{localized(item, 'name', locale)}</div>
                    <span dir="ltr">{item.code}</span>
                  </>
                ),
              },
              { title: t('manage.stages'), dataIndex: 'stage_count' },
              { title: t('manage.enrolled'), dataIndex: 'enrolled_count' },
              {
                title: t('manage.status'),
                render: (_, item) => (
                  <StatusTag tone={STATUS_TONE[item.status]}>
                    {t(`statuses.${item.status}`)}
                  </StatusTag>
                ),
              },
              {
                title: t('manage.actions'),
                render: (_, item) => (
                  <Button
                    size="small"
                    onClick={() =>
                      void navigate({ to: '/programs/builder/$id', params: { id: item.id } })
                    }
                  >
                    {canBuild ? t('manage.edit') : t('manage.view')}
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </>
  );
}
