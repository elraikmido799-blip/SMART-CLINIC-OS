import { env } from './env';

/** لينك واتساب برسالة جاهزة. الرسالة من الترجمة عشان تبقى بلغة الزائر */
export function whatsappUrl(message: string): string {
  const text = encodeURIComponent(message);
  // لو الرقم لسه مش في الـenv، واتساب بيفتح ويختار الزائر المحادثة
  return env.whatsappNumber
    ? `https://wa.me/${env.whatsappNumber}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
