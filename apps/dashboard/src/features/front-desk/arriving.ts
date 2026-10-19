import type { Appointment } from '@/features/appointments/types';
import { clinicMinutes } from '@/lib/clinic-time';

// "واصلين دلوقتي" = محجوزين ولسه مسجلوش وصول، وميعادهم من ربع ساعة فاتت لحد ساعة جاية
const WINDOW_BEFORE = 15;
const WINDOW_AFTER = 60;

export function arrivingSoon(appointments: Appointment[], nowMinutes: number) {
  return appointments.filter((item) => {
    if (item.status !== 'confirmed') return false;
    const start = clinicMinutes(item.starts_at);
    return start >= nowMinutes - WINDOW_BEFORE && start <= nowMinutes + WINDOW_AFTER;
  });
}
