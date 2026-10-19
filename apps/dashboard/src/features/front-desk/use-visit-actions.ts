import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import {
  useCompleteVisitMutation,
  useMarkNoShowMutation,
  useStartVisitMutation,
} from '@/features/appointments/appointments.api';
import { calendarErrorKey } from '@/features/appointments/errors';
import type { Appointment } from '@/features/appointments/types';
import { useCheckIn } from '@/features/appointments/use-check-in';

/** خطوات الزيارة من الطابور: وصل ← دخل للدكتور ← خلص (أو مجاش)، كل واحدة برسالة */
export function useVisitActions() {
  const { t } = useTranslation('frontDesk');
  const { t: tCalendar } = useTranslation('calendar');
  const locale = useLocale();
  const { message } = App.useApp();
  const { checkIn, pendingId: checkInPending } = useCheckIn();
  const [start, startState] = useStartVisitMutation();
  const [complete, completeState] = useCompleteVisitMutation();
  const [noShow, noShowState] = useMarkNoShowMutation();

  const run = async (
    action: (args: { id: string }) => { unwrap: () => Promise<unknown> },
    appointment: Appointment,
    done: 'queue.started' | 'queue.completed' | 'queue.noShowDone',
  ) => {
    try {
      await action({ id: appointment.id }).unwrap();
      void message.success(t(done, { name: localized(appointment.patient, 'name', locale) }));
    } catch (error) {
      void message.error(tCalendar(calendarErrorKey(error)));
    }
  };

  const pendingOf = (state: { isLoading: boolean; originalArgs?: { id: string } }) =>
    state.isLoading ? state.originalArgs?.id : undefined;

  return {
    checkIn,
    start: (item: Appointment) => run(start, item, 'queue.started'),
    complete: (item: Appointment) => run(complete, item, 'queue.completed'),
    noShow: (item: Appointment) => run(noShow, item, 'queue.noShowDone'),
    pendingId:
      checkInPending ?? pendingOf(startState) ?? pendingOf(completeState) ?? pendingOf(noShowState),
  };
}
