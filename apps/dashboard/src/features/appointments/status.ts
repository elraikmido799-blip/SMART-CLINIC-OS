import type { Tone } from '@/app/tones';
import type { AppointmentStatus } from './types';

/**
 * لون كل حالة (Tag فاتح — DEC-41). الكلام دايمًا مكتوب جنب اللون.
 * مؤكد = تيل · وصل = أزرق · مع الدكتور = برتقالي (شغال دلوقتي) · خلص = رمادي · مجاش = أحمر
 */
export const STATUS_TONE: Record<AppointmentStatus, Tone> = {
  confirmed: 'primary',
  checked_in: 'info',
  in_progress: 'warning',
  completed: 'neutral',
  no_show: 'danger',
  cancelled: 'neutral',
};
