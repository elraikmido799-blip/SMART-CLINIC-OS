import { useState } from 'react';
import { Button, Drawer, Flex, Typography } from 'antd';
import { CalendarPlus, MessageCircle, Phone, UserX } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatDate, formatEgyptianMobile, formatSlot, localized } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useGetPractitionersQuery } from '@/features/appointments/appointments.api';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import { useCan } from '@/features/auth/use-me';
import { useGetBranchesQuery } from '@/features/branches/branches.api';
import { useGetPatientQuery } from '@/features/patients/patients.api';
import { clinicToday } from '@/lib/clinic-time';
import { useNow } from '@/lib/use-now';
import { minutesToContact, slaState, type SlaState } from '../sla';
import type { Lead } from '../types';
import { RelatedTasks } from '@/features/tasks/components/related-tasks';
import { ActivityTimeline } from './activity-timeline';
import { ConvertModal, LogCallModal, LostModal, WhatsappModal } from './lead-actions';

const SLA_TONE: Record<SlaState, Tone> = { ok: 'success', warning: 'warning', late: 'danger' };

type Dialog = 'call' | 'whatsapp' | 'lost' | 'convert' | null;

/**
 * تفاصيل الـLead (D-20 يمين · D-21 · docs/20 · 6.2): البيانات · تايم لاين النشاط · الإجراءات:
 * سجّل مكالمة · ابعت واتساب (قالب) · احجز ميعاد (الـPrimary الوحيد) · حوّله لمريض · خسرناه (بسبب).
 * الحجز محتاج مريض، فلو الـLead لسه مش مريض بيطلب تحويله الأول.
 */
export function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { t } = useTranslation('crm');
  const locale = useLocale();
  const now = useNow();
  const canWrite = useCan('leads.write');
  const canBook = useCan('appointments.write');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [booking, setBooking] = useState<BookingMode | null>(null);
  const { data: branches = [] } = useGetBranchesQuery();
  const patient = useGetPatientQuery(lead?.patient_id ?? '', { skip: !lead?.patient_id });
  const today = clinicToday();
  const practitioners = useGetPractitionersQuery(
    { branch_id: lead?.branch_id ?? '', from: today, to: today },
    { skip: !lead || !canBook },
  );
  const branch = branches.find((item) => item.id === lead?.branch_id);
  const minutes = lead ? minutesToContact(lead, now) : 0;
  const waiting =
    minutes < 60
      ? t('sla.minutes', { count: minutes })
      : t('sla.hours', { count: Math.floor(minutes / 60) });

  const book = () => {
    if (!lead) return;
    if (!lead.patient_id) {
      setDialog('convert');
      return;
    }
    if (patient.data) setBooking({ kind: 'new', date: today, patient: patient.data });
  };

  return (
    <Drawer
      open={lead !== null}
      onClose={onClose}
      destroyOnHidden
      size={440}
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
            {lead.stage === 'lead' && (
              <StatusTag tone={SLA_TONE[slaState(minutes)]}>
                {t('sla.waiting', { time: waiting })}
              </StatusTag>
            )}
            {lead.patient_id && (
              <Link to="/patients/$patientId" params={{ patientId: lead.patient_id }}>
                <StatusTag tone="success">{t('drawer.patientFile')}</StatusTag>
              </Link>
            )}
          </Flex>

          {canWrite && (
            <Flex vertical gap={8} style={{ marginBottom: 24 }}>
              <Button
                block
                icon={<Phone size={16} aria-hidden />}
                onClick={() => setDialog('call')}
              >
                {t('actions.logCall')}
              </Button>
              <Button
                block
                icon={<MessageCircle size={16} aria-hidden />}
                onClick={() => setDialog('whatsapp')}
              >
                {t('actions.whatsapp')}
              </Button>
              {canBook && (
                <Button
                  block
                  type="primary"
                  icon={<CalendarPlus size={16} aria-hidden />}
                  loading={!!lead.patient_id && patient.isLoading}
                  onClick={book}
                >
                  {t('actions.book')}
                </Button>
              )}
              {!lead.patient_id && (
                <Button block onClick={() => setDialog('convert')}>
                  {t('actions.convert')}
                </Button>
              )}
              <Button
                block
                danger
                icon={<UserX size={16} aria-hidden />}
                onClick={() => setDialog('lost')}
              >
                {t('actions.lost')}
              </Button>
            </Flex>
          )}

          <Typography.Title level={2} style={{ fontSize: 16 }}>
            {t('drawer.details')}
          </Typography.Title>
          <dl
            style={{
              margin: '0 0 24px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '8px 16px',
            }}
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
            {lead.notes && (
              <>
                <dt>
                  <Typography.Text type="secondary">{t('drawer.notes')}</Typography.Text>
                </dt>
                <dd style={{ margin: 0 }}>{lead.notes}</dd>
              </>
            )}
          </dl>

          <RelatedTasks type="lead" id={lead.id} branchId={lead.branch_id} bare />

          <Typography.Title level={2} style={{ fontSize: 16, marginTop: 24 }}>
            {t('timeline.title')}
          </Typography.Title>
          <ActivityTimeline leadId={lead.id} />

          <LogCallModal lead={lead} open={dialog === 'call'} onClose={() => setDialog(null)} />
          <WhatsappModal lead={lead} open={dialog === 'whatsapp'} onClose={() => setDialog(null)} />
          <LostModal
            lead={lead}
            open={dialog === 'lost'}
            onClose={() => {
              setDialog(null);
              onClose();
            }}
          />
          <ConvertModal lead={lead} open={dialog === 'convert'} onClose={() => setDialog(null)} />
          <BookingModal
            mode={booking}
            branchId={lead.branch_id}
            practitioners={practitioners.data ?? []}
            onClose={() => setBooking(null)}
          />
        </>
      )}
    </Drawer>
  );
}
