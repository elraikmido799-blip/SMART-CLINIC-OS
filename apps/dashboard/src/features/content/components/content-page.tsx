import { useState } from 'react';
import { Button, Card, Input, Table, Tabs, Typography } from 'antd';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useGetContentQuery } from '../content.api';
import { CONTENT_KINDS, type ContentItem, type ContentKind } from '../types';
import { ContentDrawer } from './content-drawer';
import { SiteImages } from './site-images';

type TabKey = ContentKind | 'images';

/**
 * إدارة المحتوى (D-33 · docs/20 · 9.1): مقالات · فيديوهات · عروض (مسودة أو منشور، بالغتين) وصور الموقع.
 * الضغط على الصف بيفتح التحرير. المسودة مبتظهرش في الموقع، والعرض بيخلص في يوم نهايته.
 */
export function ContentPage() {
  const { t } = useTranslation('content');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const [tab, setTab] = useState<TabKey>('article');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [creating, setCreating] = useState(false);
  const content = useGetContentQuery();
  const all = content.data ?? [];
  const kind: ContentKind = tab === 'images' ? 'article' : tab;
  const text = query.trim().toLowerCase();
  const rows = all.filter(
    (item) =>
      item.kind === kind &&
      (!text ||
        item.title_ar.toLowerCase().includes(text) ||
        item.title_en.toLowerCase().includes(text)),
  );

  return (
    <>
      <PageHeader
        title={tNav('content')}
        description={t('description')}
        extra={
          tab !== 'images' ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => setCreating(true)}
            >
              {t(`new.${kind}`)}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as TabKey)}
          items={[
            ...CONTENT_KINDS.map((key) => ({
              key,
              label: `${t(`kinds.${key}`)} (${all.filter((item) => item.kind === key).length})`,
            })),
            { key: 'images', label: t('kinds.images') },
          ]}
        />
        {tab === 'images' ? (
          <SiteImages />
        ) : content.isError ? (
          <ErrorState onRetry={() => void content.refetch()} />
        ) : (
          <>
            <Input
              type="search"
              allowClear
              aria-label={t('search')}
              placeholder={t('search')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ maxWidth: 280, marginBottom: 16 }}
            />
            <Table<ContentItem>
              rowKey="id"
              loading={content.isLoading}
              dataSource={rows}
              pagination={false}
              scroll={{ x: 640 }}
              locale={{ emptyText: <EmptyState title={t('empty')} /> }}
              onRow={(item) => ({ onClick: () => setEditing(item), style: { cursor: 'pointer' } })}
              columns={[
                {
                  key: 'title',
                  title: t('columns.title'),
                  render: (_, item) => (
                    <>
                      <Typography.Text strong style={{ display: 'block' }}>
                        {localized(item, 'title', locale)}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {locale === 'ar' ? item.title_en : item.title_ar}
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  key: 'specialty',
                  title: t('columns.specialty'),
                  render: (_, item) =>
                    item.specialty ? (
                      <SpecialtyTag specialty={item.specialty} />
                    ) : (
                      t('fields.general')
                    ),
                },
                {
                  key: 'status',
                  title: t('columns.status'),
                  render: (_, item) => (
                    <StatusTag tone={item.status === 'published' ? 'success' : 'neutral'}>
                      {t(`status.${item.status}`)}
                    </StatusTag>
                  ),
                },
                {
                  key: 'updated',
                  title: t('columns.updated'),
                  render: (_, item) => formatDate(item.updated_at.slice(0, 10), locale),
                },
              ]}
            />
          </>
        )}
      </Card>
      <ContentDrawer
        item={editing}
        kind={kind}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
      <ContentDrawer item={null} kind={kind} open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
