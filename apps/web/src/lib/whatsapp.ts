import { env } from './env';

/**
 * لينك واتساب برسالة جاهزة. الرسالة من الترجمة عشان تبقى بلغة الزائر.
 * number: رقم فرع معيّن (صفحة الفرع). من غيره بيروح لرقم Oxygen العام اللي في الـenv
 */
export function whatsappUrl(message: string, number?: string | null): string {
  const text = encodeURIComponent(message);
  const target = number || env.whatsappNumber;
  // لو مفيش رقم خالص، واتساب بيفتح ويختار الزائر المحادثة
  return target ? `https://wa.me/${target}?text=${text}` : `https://wa.me/?text=${text}`;
}
