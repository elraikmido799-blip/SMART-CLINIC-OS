import { Typography } from 'antd';
import {
  MessageCircle,
  NotebookPen,
  Phone,
  Sparkles,
  UserCheck,
  UserX,
  Workflow,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatSlot, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { useGetLeadActivitiesQuery } from '../crm.api';
import type { LeadActivity } from '../types';

const ICONS = {
  created: Sparkles,
  call: Phone,
  whatsapp: MessageCircle,
  note: NotebookPen,
  stage: Workflow,
  lost: UserX,
  converted: UserCheck,
} satisfies Record<LeadActivity['type'], unknown>;

/** تايم لاين الـLead (D-21): الأحدث الأول، بتاريخه ووقته وعنوان وتفصيلة وصاحب الإجراء */
export function ActivityTimeline({ leadId }: { leadId: string }) {
  const { t } = useTranslation('crm');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useGetLeadActivitiesQuery(leadId);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!data?.length) return <EmptyState title={t('timeline.empty')} />;

  const titleOf = (item: LeadActivity) => {
    switch (item.type) {
      case 'call':
        return t('timeline.call', { outcome: t(`outcomes.${item.outcome ?? 'no_answer'}`) });
      case 'whatsapp':
        return t('timeline.whatsapp');
      case 'stage':
        return t('timeline.stage', { stage: t(`stages.${item.stage ?? 'lead'}`) });
      case 'lost':
        return t('timeline.lost', { reason: t(`lostReasons.${item.reason ?? 'other'}`) });
      default:
        return t(`timeline.${item.type}`);
    }
  };

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {data.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <li key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span
              aria-hidden
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 32,
                height: 32,
                flex: '0 0 32px',
                borderRadius: '50%',
                background: tokens.color.mist,
                color: tokens.color.primary,
              }}
            >
              <Icon size={16} />
            </span>
            <div>
              <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                {formatDate(item.at.slice(0, 10), locale)} · {formatSlot(item.at, locale).time}
                {item.by && ` · ${localized(item.by, 'name', locale)}`}
              </Typography.Text>
              <Typography.Text strong>{titleOf(item)}</Typography.Text>
              {item.template && (
                <Typography.Text type="secondary" style={{ display: 'block' }}>
                  {item.template}
                </Typography.Text>
              )}
              {item.notes && <div>{item.notes}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
