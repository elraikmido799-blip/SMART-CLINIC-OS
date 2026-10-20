import { Button, Card, Table } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useGetFormTemplatesQuery } from '../form-builder.api';
import type { FormTemplateSummary } from '../types';

/** قايمة فورمات الكشف (D-17 · docs/20 · 4.9): فورم لكل تخصص بنسخته وحالة المسودة */
export function FormsPage() {
  const { t } = useTranslation('formBuilder');
  const locale = useLocale();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useGetFormTemplatesQuery();
  const forbidden = !!error && 'status' in error && error.status === 403;

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Card>
        {isLoading ? (
          <LoadingState />
        ) : forbidden ? (
          <EmptyState level={1} title={t('forbidden.title')} description={t('forbidden.body')} />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <Table<FormTemplateSummary>
            rowKey="code"
            dataSource={data}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t('list.empty')} /> }}
            columns={[
              {
                title: t('list.form'),
                render: (_, item) => (
                  <>
                    <SpecialtyTag specialty={item.specialty} />
                    <div style={{ fontWeight: 600 }}>
                      {locale === 'ar' ? item.title_ar : item.title_en}
                    </div>
                  </>
                ),
              },
              {
                title: t('list.version'),
                render: (_, item) => t('version', { version: item.version }),
              },
              {
                title: t('list.status'),
                render: (_, item) =>
                  item.has_draft ? (
                    <StatusTag tone="warning">{t('state.pending')}</StatusTag>
                  ) : (
                    <StatusTag tone="success">{t('state.published')}</StatusTag>
                  ),
              },
              {
                title: t('list.updated'),
                render: (_, item) =>
                  item.updated_at ? formatDate(item.updated_at.slice(0, 10), locale) : '—',
              },
              {
                title: t('list.actions'),
                render: (_, item) => (
                  <Button
                    size="small"
                    onClick={() =>
                      void navigate({ to: '/clinical/forms/$code', params: { code: item.code } })
                    }
                  >
                    {t('list.open')}
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
