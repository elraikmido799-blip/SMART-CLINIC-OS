import { Flex, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { maskPhone } from '../phone';
import { minutesToContact, slaState, type SlaState } from '../sla';
import { MANUAL_STAGES, isManualStage, type Lead, type LeadStage } from '../types';

const SLA_TONE: Record<SlaState, Tone> = { ok: 'success', warning: 'warning', late: 'danger' };

/** كارت الـLead على اللوحة (D-20): الاسم · الموبايل المخفي · المصدر · الحملة · الاهتمام · المسؤول · الـSLA (في عمود Lead بس) */
export function LeadCard({
  lead,
  now,
  canMove,
  onOpen,
  onMove,
}: {
  lead: Lead;
  now: number;
  canMove: boolean;
  onOpen: (lead: Lead) => void;
  onMove: (lead: Lead, stage: LeadStage) => void;
}) {
  const { t } = useTranslation('crm');
  const locale = useLocale();
  const minutes = minutesToContact(lead, now);
  const time =
    minutes < 60
      ? t('sla.minutes', { count: minutes })
      : t('sla.hours', { count: Math.floor(minutes / 60) });

  return (
    <>
      <button
        type="button"
        onClick={() => onOpen(lead)}
        style={{
          background: 'none',
          border: 0,
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
          fontWeight: 600,
          textAlign: 'start',
          color: 'inherit',
        }}
        aria-label={t('card.open', { name: lead.name })}
      >
        {lead.name}
      </button>
      <Typography.Text type="secondary" style={{ display: 'block' }}>
        <span dir="ltr">{maskPhone(lead.phone)}</span>
      </Typography.Text>
      <Flex gap={6} wrap style={{ marginBlock: 8 }}>
        <StatusTag tone="neutral">{t(`sources.${lead.source}`)}</StatusTag>
        {lead.campaign && <StatusTag tone="info">{lead.campaign.name}</StatusTag>}
        {lead.interest && <SpecialtyTag specialty={lead.interest} />}
      </Flex>
      <Flex justify="space-between" align="center" gap={8}>
        <Flex gap={6} align="center" style={{ minWidth: 0 }}>
          {lead.assigned_to ? (
            <>
              <PersonAvatar name={localized(lead.assigned_to, 'name', locale)} size={24} />
              <Typography.Text type="secondary" ellipsis>
                {localized(lead.assigned_to, 'name', locale)}
              </Typography.Text>
            </>
          ) : (
            <Typography.Text type="secondary">{t('card.unassigned')}</Typography.Text>
          )}
        </Flex>
        {lead.stage === 'lead' && (
          <StatusTag tone={SLA_TONE[slaState(minutes)]}>{t('sla.waiting', { time })}</StatusTag>
        )}
      </Flex>
      {canMove && isManualStage(lead.stage) && (
        <Select<string | null>
          size="small"
          value={null}
          aria-label={t('card.moveTo', { name: lead.name })}
          placeholder={t('card.moveToShort')}
          onChange={(stage) => stage && onMove(lead, stage as LeadStage)}
          options={MANUAL_STAGES.filter((stage) => stage !== lead.stage).map((stage) => ({
            value: stage,
            label: t(`stages.${stage}`),
          }))}
          style={{ width: '100%', marginTop: 8 }}
        />
      )}
    </>
  );
}
