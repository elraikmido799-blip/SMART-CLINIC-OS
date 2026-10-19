import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { apiErrorCode } from '@/lib/api-error';
import { baseApi } from '@/store/base-api';
import { useAppDispatch } from '@/store/store';
import { useCheckInMutation } from './appointments.api';
import type { Appointment } from './types';

/** تسجيل الوصول + رسالة النجاح أو الخطأ (من "واصلين دلوقتي" ومن تفاصيل الميعاد) */
export function useCheckIn() {
  const { t } = useTranslation('appointments');
  const { message } = App.useApp();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const [checkIn, state] = useCheckInMutation();

  const run = async (appointment: Appointment) => {
    try {
      await checkIn({ id: appointment.id }).unwrap();
      void message.success(
        t('details.checkedIn', { name: localized(appointment.patient, 'name', locale) }),
      );
      return true;
    } catch (error) {
      const code = apiErrorCode(error as never);
      // الحالة اتغيرت من جهاز تاني: نجيب الداتا من جديد زي ما الرسالة بتقول
      if (code === 'INVALID_STATUS')
        dispatch(baseApi.util.invalidateTags(['Appointments', 'FrontDeskSummary']));
      void message.error(
        code === 'INVALID_STATUS' ? t('errors.INVALID_STATUS') : t('errors.generic'),
      );
      return false;
    }
  };

  return { checkIn: run, pendingId: state.isLoading ? state.originalArgs?.id : undefined };
}
