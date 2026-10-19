import { Button, Descriptions, Drawer, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatSlot, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { STATUS_TONE } from '../status';
import type { Appointment, Practitioner } from '../types';
import { useCheckIn } from '../use-check-in';

type Props = {
  appointment: Appointment | null;
  practitioner: Practitioner | undefined;
  onClose: () => void;
};

/** تفاصيل الميعاد لما تدوس عليه في الكالندر، ومنها تسجيل الوصول */
export function AppointmentDrawer({ appointment, practitioner, onClose }: Props) {
  const { t, i18n } = useTranslation('appointments');
  const locale = useLocale();
  const canCheckIn = useCan('checkin.write');
  const { checkIn, pendingId } = useCheckIn();

  const content =
    appointment &&
    (() => {
      const name = localized(appointment.patient, 'name', locale);
      const start = formatSlot(appointment.starts_at, locale);
      const end = formatSlot(appointment.ends_at, locale).time;
      return (
        <Flex vertical gap={20}>
          <Flex align="center" gap={12}>
            <PersonAvatar name={name} size={48} />
            <div>
              <Typography.Title level={3} style={{ margin: 0, fontSize: 20 }}>
                {name}
              </Typography.Title>
              <StatusTag tone={STATUS_TONE[appointment.status]}>
                {t(`status.${appointment.status}`)}
              </StatusTag>
            </div>
          </Flex>

          {appointment.patient.balance_due > 0 && (
            <div>
              <StatusTag tone="warning">
                {t('details.balanceDue', {
                  amount: formatMoney(appointment.patient.balance_due, 'EGP', locale),
                })}
              </StatusTag>
            </div>
          )}

          <Descriptions
            column={1}
            size="small"
            items={[
              {
                key: 'time',
                label: t('details.time'),
                children: `${start.day} · ${start.time} – ${end}`,
              },
              {
                key: 'service',
                label: t('details.service'),
                children: (
                  <Flex gap={8} align="center" wrap>
                    {localized(appointment.service, 'name', locale)}
                    <SpecialtyTag specialty={appointment.service.specialty} />
                  </Flex>
                ),
              },
              {
                key: 'practitioner',
                label: t('details.practitioner'),
                children: practitioner ? localized(practitioner, 'name', locale) : '—',
              },
              {
                key: 'file',
                label: t('details.fileNo'),
                children: <span dir="ltr">{appointment.patient.file_no}</span>,
              },
              {
                key: 'phone',
                label: t('details.phone'),
                children: <span dir="ltr">{appointment.patient.phone}</span>,
              },
              ...(appointment.checked_in_at
                ? [
                    {
                      key: 'arrived',
                      label: t('details.status'),
                      children: t('details.checkedInAt', {
                        time: formatSlot(appointment.checked_in_at, locale).time,
                      }),
                    },
                  ]
                : []),
            ]}
          />

          {canCheckIn && appointment.status === 'confirmed' && (
            <Button
              type="primary"
              size="large"
              block
              loading={pendingId === appointment.id}
              onClick={async () => {
                if (await checkIn(appointment)) onClose();
              }}
            >
              {t('details.checkIn')}
            </Button>
          )}
        </Flex>
      );
    })();

  return (
    <Drawer
      open={!!appointment}
      onClose={onClose}
      title={t('details.title')}
      placement={i18n.dir() === 'rtl' ? 'left' : 'right'}
      size={400}
    >
      {content}
    </Drawer>
  );
}
