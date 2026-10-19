import { useState } from 'react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useMarkNoShowMutation } from '../appointments.api';
import { calendarErrorKey } from '../errors';
import type { Appointment, Practitioner } from '../types';
import { AppointmentDrawer } from './appointment-drawer';
import { BookingModal } from './booking-modal';
import { CancelModal } from './cancel-modal';

type Props = {
  appointment: Appointment | null;
  practitioners: Practitioner[];
  branchId: string;
  onClose: () => void;
};

/** تفاصيل الميعاد + كل اللي بيتعمل منه (تأجيل · إلغاء · مجاش) — في شاشة اليوم والكالندر */
export function AppointmentPanel({ appointment, practitioners, branchId, onClose }: Props) {
  const { t } = useTranslation('calendar');
  const locale = useLocale();
  const { modal, message } = App.useApp();
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [markNoShow] = useMarkNoShowMutation();

  const confirmNoShow = (item: Appointment) => {
    onClose();
    void modal.confirm({
      title: t('noShow.title'),
      content: `${localized(item.patient, 'name', locale)} — ${t('noShow.body')}`,
      okText: t('noShow.confirm'),
      cancelText: t('cancel.keep'),
      onOk: async () => {
        try {
          await markNoShow({ id: item.id }).unwrap();
          void message.success(t('noShow.done'));
        } catch (error) {
          void message.error(t(calendarErrorKey(error)));
        }
      },
    });
  };

  return (
    <>
      <AppointmentDrawer
        appointment={appointment}
        practitioner={practitioners.find((item) => item.id === appointment?.practitioner_id)}
        onClose={onClose}
        onReschedule={(item) => {
          onClose();
          setRescheduling(item);
        }}
        onCancel={(item) => {
          onClose();
          setCancelling(item);
        }}
        onNoShow={confirmNoShow}
      />
      <BookingModal
        mode={rescheduling ? { kind: 'reschedule', appointment: rescheduling } : null}
        branchId={branchId}
        practitioners={practitioners}
        onClose={() => setRescheduling(null)}
      />
      <CancelModal appointment={cancelling} onClose={() => setCancelling(null)} />
    </>
  );
}
