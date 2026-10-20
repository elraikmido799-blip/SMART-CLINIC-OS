import { useState } from 'react';
import { Button, Card, Flex, Input, Switch, Table, Tabs, Typography } from 'antd';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoney, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { useGetCatalogQuery, useUpdateCatalogItemMutation } from '../catalog.api';
import { CATALOG_KINDS, type CatalogItem, type CatalogKind } from '../types';
import { CatalogTabs } from './catalog-tabs';
import { ItemDrawer } from './item-drawer';

/**
 * الكتالوج (D-24 · docs/20 · 7.1): خدمات · منتجات · باقات. بحث بالاسم، السعر الأساسي وعدد الفروع اللي ليها سعر خاص،
 * وتفعيل/قفل سريع. الضغط على الصف بيفتح التعديل (للي عنده `catalog.write`).
 */
export function CatalogPage() {
  const { t } = useTranslation('catalog');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const canWrite = useCan('catalog.write');
  const [kind, setKind] = useState<CatalogKind>('service');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [creating, setCreating] = useState(false);
  const catalog = useGetCatalogQuery();
  const [update] = useUpdateCatalogItemMutation();

  const text = query.trim().toLowerCase();
  const all = catalog.data ?? [];
  const rows = all.filter(
    (item) =>
      item.kind === kind &&
      (!text ||
        item.name_ar.toLowerCase().includes(text) ||
        item.name_en.toLowerCase().includes(text)),
  );

  return (
    <>
      <CatalogTabs active="items" />
      <PageHeader
        title={tNav('catalog')}
        description={t('description')}
        extra={
          canWrite ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => setCreating(true)}
            >
              {t('new')}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <Tabs
          activeKey={kind}
          onChange={(key) => setKind(key as CatalogKind)}
          items={CATALOG_KINDS.map((key) => ({
            key,
            label: `${t(`kinds.${key}`)} (${all.filter((item) => item.kind === key).length})`,
          }))}
        />
        <Flex style={{ marginBottom: 16 }}>
          <Input
            type="search"
            allowClear
            aria-label={t('search')}
            placeholder={t('search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ maxWidth: 280 }}
          />
        </Flex>
        {catalog.isError ? (
          <ErrorState onRetry={() => void catalog.refetch()} />
        ) : (
          <Table<CatalogItem>
            rowKey="id"
            loading={catalog.isLoading}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t('empty')} /> }}
            onRow={(item) => ({
              onClick: () => canWrite && setEditing(item),
              style: canWrite ? { cursor: 'pointer' } : undefined,
            })}
            columns={[
              {
                key: 'name',
                title: t('fields.name'),
                render: (_, item) => (
                  <>
                    <Typography.Text strong style={{ display: 'block' }}>
                      {localized(item, 'name', locale)}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {locale === 'ar' ? item.name_en : item.name_ar}
                    </Typography.Text>
                  </>
                ),
              },
              {
                key: 'specialty',
                title: t('fields.specialty'),
                render: (_, item) =>
                  item.specialty ? <SpecialtyTag specialty={item.specialty} /> : '—',
              },
              {
                key: 'detail',
                title: t('fields.detail'),
                render: (_, item) =>
                  item.duration_min
                    ? t('fields.durationValue', { count: item.duration_min })
                    : item.sessions
                      ? t('fields.sessionsValue', { count: item.sessions })
                      : '—',
              },
              {
                key: 'price',
                title: t('fields.price'),
                align: 'end',
                render: (_, item) => (
                  <>
                    {formatMoney(item.price, 'EGP', locale)}
                    {Object.keys(item.branch_prices).length > 0 && (
                      <Typography.Text type="secondary" style={{ display: 'block' }}>
                        {t('fields.branchOverrides', {
                          count: Object.keys(item.branch_prices).length,
                        })}
                      </Typography.Text>
                    )}
                  </>
                ),
              },
              {
                key: 'active',
                title: t('fields.active'),
                render: (_, item) =>
                  canWrite ? (
                    <Switch
                      checked={item.active}
                      aria-label={t('fields.toggle', { name: localized(item, 'name', locale) })}
                      onClick={(_checked, event) => event.stopPropagation()}
                      onChange={(checked) => void update({ ...item, active: checked })}
                    />
                  ) : (
                    <StatusTag tone={item.active ? 'success' : 'neutral'}>
                      {t(item.active ? 'fields.on' : 'fields.off')}
                    </StatusTag>
                  ),
              },
            ]}
          />
        )}
      </Card>
      <ItemDrawer
        item={editing}
        kind={kind}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
      <ItemDrawer item={null} kind={kind} open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
