import { Drawer, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatDate, formatEgyptianMobile, formatSlot, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useGetBranchesQuery } from '@/features/branches/branches.api';
import type { Lead } from '../types';

/** تفاصيل الـLead (D-20 يمين · docs/20 · 6.1): البيانات الأساسية. التايم لاين والإجراءات في 6.2 */
export function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { t } = useTranslation('crm');
  const locale = useLocale();
  const { data: branches = [] } = useGetBranchesQuery();
  const branch = branches.find((item) => item.id === lead?.branch_id);

  return (
    <Drawer
      open={lead !== null}
      onClose={onClose}
      destroyOnHidden
      size={420}
      title={lead ? lead.name : ''}
    >
      {lead && (
        <>
          <Flex gap={12} align="center" style={{ marginBottom: 16 }}>
            <PersonAvatar name={lead.name} size={56} />
            <div>
              <Typography.Text strong style={{ display: 'block', fontSize: 18 }}>
                {lead.name}
              </Typography.Text>
              <Typography.Text type="secondary">
                <span dir="ltr">{formatEgyptianMobile(lead.phone)}</span>
              </Typography.Text>
            </div>
          </Flex>
          <Flex gap={6} wrap style={{ marginBottom: 16 }}>
            <StatusTag tone="primary">{t(`stages.${lead.stage}`)}</StatusTag>
            {lead.campaign && <StatusTag tone="info">{lead.campaign.name}</StatusTag>}
            {lead.interest && <SpecialtyTag specialty={lead.interest} />}
          </Flex>
          <Typography.Title level={2} style={{ fontSize: 16 }}>
            {t('drawer.details')}
          </Typography.Title>
          <dl
            style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}
          >
            <dt>
              <Typography.Text type="secondary">{t('drawer.branch')}</Typography.Text>
            </dt>
            <dd style={{ margin: 0 }}>{branch ? localized(branch, 'name', locale) : '—'}</dd>
            <dt>
              <Typography.Text type="secondary">{t('drawer.source')}</Typography.Text>
            </dt>
            <dd style={{ margin: 0 }}>{t(`sources.${lead.source}`)}</dd>
            <dt>
              <Typography.Text type="secondary">{t('drawer.campaign')}</Typography.Text>
            </dt>
            <dd style={{ margin: 0 }}>{lead.campaign?.name ?? '—'}</dd>
            <dt>
              <Typography.Text type="secondary">{t('drawer.agent')}</Typography.Text>
            </dt>
            <dd style={{ margin: 0 }}>
              {lead.assigned_to
                ? localized(lead.assigned_to, 'name', locale)
                : t('card.unassigned')}
            </dd>
            <dt>
              <Typography.Text type="secondary">{t('drawer.created')}</Typography.Text>
            </dt>
            <dd style={{ margin: 0 }}>
              {formatDate(lead.created_at.slice(0, 10), locale)} ·{' '}
              {formatSlot(lead.created_at, locale).time}
            </dd>
          </dl>
          {lead.notes && (
            <Typography.Paragraph style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">{t('drawer.notes')}: </Typography.Text>
              {lead.notes}
            </Typography.Paragraph>
          )}
        </>
      )}
    </Drawer>
  );
}
