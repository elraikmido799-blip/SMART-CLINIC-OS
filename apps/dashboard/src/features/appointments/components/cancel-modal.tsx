import { useState } from 'react';
import { Alert, App, Button, Flex, Modal, Radio, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { DangerButton } from '@/components/danger-button';
import { useCancelAppointmentMutation } from '../appointments.api';
import { calendarErrorKey, type CalendarErrorKey } from '../errors';
import { CANCEL_REASONS, type Appointment, type CancelReason } from '../types';

/** إلغاء ميعاد بسبب (الإلغاء مبيرجعش، فالزرار كحلي بحدود حمرا — DEC-36) */
export function CancelModal({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('calendar');
  const locale = useLocale();
  const { message } = App.useApp();
  const [reason, setReason] = useState<CancelReason>('patient_request');
  const [errorKey, setErrorKey] = useState<CalendarErrorKey | null>(null);
  const [cancel, { isLoading }] = useCancelAppointmentMutation();

  const confirm = async () => {
    if (!appointment) return;
    setErrorKey(null);
    try {
      await cancel({ id: appointment.id, reason }).unwrap();
      void message.success(t('cancel.done'));
      onClose();
    } catch (error) {
      setErrorKey(calendarErrorKey(error));
    }
  };

  return (
    <Modal
      open={!!appointment}
      title={t('cancel.title')}
      onCancel={onClose}
      destroyOnHidden
      afterClose={() => {
        setReason('patient_request');
        setErrorKey(null);
      }}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>{t('cancel.keep')}</Button>
          <DangerButton loading={isLoading} onClick={confirm}>
            {t('cancel.confirm')}
          </DangerButton>
        </Flex>
      }
    >
      {appointment && (
        <Flex vertical gap={16}>
          <Typography.Text strong>{localized(appointment.patient, 'name', locale)}</Typography.Text>
          <div>
            <Typography.Text id="cancel-reason" style={{ display: 'block', marginBottom: 8 }}>
              {t('cancel.reason')}
            </Typography.Text>
            <Radio.Group
              aria-labelledby="cancel-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              options={CANCEL_REASONS.map((value) => ({
                value,
                label: t(`cancel.reasons.${value}`),
              }))}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            />
          </div>
          {errorKey && <Alert type="error" showIcon role="alert" title={t(errorKey)} />}
        </Flex>
      )}
    </Modal>
  );
}
