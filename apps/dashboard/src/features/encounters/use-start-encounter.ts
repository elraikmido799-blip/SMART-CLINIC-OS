import { App } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@/features/appointments/types';
import { useStartEncounterMutation } from './encounters.api';
import { encounterErrorKey } from './errors';

/** "ابدأ كشف" / "كمّل الكشف": بيفتح الكشف على الميعاد (الميعاد بيبقى "مع الدكتور") وبيروّح لشاشته */
export function useStartEncounter() {
  const { t } = useTranslation('encounters');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [start, state] = useStartEncounterMutation();

  return {
    startEncounter: async (appointment: Appointment) => {
      try {
        const encounter = await start({ appointment_id: appointment.id }).unwrap();
        await navigate({ to: '/encounters/$encounterId', params: { encounterId: encounter.id } });
      } catch (error) {
        void message.error(t(encounterErrorKey(error)));
      }
    },
    pendingId: state.isLoading ? state.originalArgs?.appointment_id : undefined,
  };
}
