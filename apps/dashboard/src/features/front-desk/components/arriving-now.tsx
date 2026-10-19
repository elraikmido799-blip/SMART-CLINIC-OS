import { Badge, Button, Card, Flex, Typography } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, formatMoney, formatSlot, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { StatusTag } from '@/components/tags';
import { EmptyState } from '@/components/states/states';
import type { Appointment, Practitioner } from '@/features/appointments/types';
import { useCheckIn } from '@/features/appointments/use-check-in';
import { useCan } from '@/features/auth/use-me';

type Props = {
  appointments: Appointment[];
  practitioners: Practitioner[];
};

/**
 * "واصلين دلوقتي" (D-02): كارت لكل مريض جاي، وتسجيل الوصول منه على طول.
 * الـPrimary للي عليه الدور بس، والباقي زراير عادية (ملاحظة B1).
 */
export function ArrivingNow({ appointments, practitioners }: Props) {
  const { t } = useTranslation('frontDesk');
  const { t: tAppointments } = useTranslation('appointments');
  const locale = useLocale();
  const navigate = useNavigate();
  const canCheckIn = useCan('checkin.write');
  const canCollect = useCan('billing.collect');
  const { checkIn, pendingId } = useCheckIn();

  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          {t('arriving.title')}
          <Badge count={appointments.length} color={tokens.color.primary} showZero={false} />
        </Flex>
      }
      styles={{ body: { padding: appointments.length ? 12 : 0 } }}
    >
      {appointments.length === 0 ? (
        <EmptyState title={t('arriving.empty')} />
      ) : (
        <Flex vertical gap={12} role="list">
          {appointments.map((item, index) => {
            const name = localized(item.patient, 'name', locale);
            const practitioner = practitioners.find((entry) => entry.id === item.practitioner_id);
            return (
              <div
                key={item.id}
                role="listitem"
                style={{
                  padding: 12,
                  border: `1px solid ${tokens.color.border}`,
                  borderInlineStart: `3px solid ${tokens.specialty[item.service.specialty]}`,
                  borderRadius: 12,
                }}
              >
                <Flex gap={12} align="flex-start">
                  <PersonAvatar name={name} />
                  <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
                    <Typography.Text strong ellipsis>
                      {name}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }} dir="ltr">
                      {formatEgyptianMobile(item.patient.phone)}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 13 }}>
                      {localized(item.service, 'name', locale)}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                      {t('arriving.with', {
                        time: formatSlot(item.starts_at, locale).time,
                        name: practitioner ? localized(practitioner, 'name', locale) : '',
                      })}
                    </Typography.Text>
                  </Flex>
                </Flex>
                {item.patient.balance_due > 0 && (
                  <Flex justify="space-between" align="center" gap={8} style={{ marginTop: 10 }}>
                    <StatusTag tone="warning">
                      {tAppointments('details.balanceDue', {
                        amount: formatMoney(item.patient.balance_due, 'EGP', locale),
                      })}
                    </StatusTag>
                    {canCollect && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          navigate({ to: '/front-desk/pos', search: { patient: item.patient.id } })
                        }
                      >
                        {t('arriving.collect')}
                      </Button>
                    )}
                  </Flex>
                )}
                {canCheckIn && (
                  <Button
                    type={index === 0 ? 'primary' : 'default'}
                    block
                    style={{ marginTop: 12 }}
                    loading={pendingId === item.id}
                    onClick={() => checkIn(item)}
                  >
                    {tAppointments('details.checkIn')}
                  </Button>
                )}
              </div>
            );
          })}
        </Flex>
      )}
    </Card>
  );
}
