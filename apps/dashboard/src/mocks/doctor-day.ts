import type { MockHandlers } from '@oxygen/shared';
import type { DoctorPending } from '@/features/doctor-day/doctor-day.api';
import { currentStaff } from './auth';
import { seeded } from './clinic';

/** "مستني منك" الوهمي: أرقام ثابتة لكل دكتور (لحد ما الكشوفات والتقارير والرسايل تتبني) */
export const doctorDayHandlers: MockHandlers = {
  getDoctorPending: (): DoctorPending => {
    const random = seeded(`pending-${currentStaff().id}`);
    return {
      unsigned_notes: Math.floor(random() * 4),
      reports_to_review: Math.floor(random() * 3),
      unread_messages: Math.floor(random() * 5),
    };
  },
};
