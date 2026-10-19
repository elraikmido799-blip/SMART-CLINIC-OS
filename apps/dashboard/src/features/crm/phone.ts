/** 0101****23: أول 4 أرقام وآخر 2 (الموبايل الكامل في تفاصيل الـLead) */
export function maskPhone(phone: string) {
  const local = phone.replace(/^\+2/, '');
  return `${local.slice(0, 4)}****${local.slice(-2)}`;
}
