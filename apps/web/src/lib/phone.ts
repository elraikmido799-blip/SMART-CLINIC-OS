/**
 * موبايل مصري: 01X + 8 أرقام (010 · 011 · 012 · 015)، مكتوب بأي شكل
 * (مسافات، شرطة، +20، أرقام عربي ١٢٣). بيرجع "+201XXXXXXXXX" أو null لو الرقم مش صح.
 */
export function normalizeEgyptianMobile(input: string): string | null {
  const digits = input
    // أرقام عربي/فارسي ← إنجليزي
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-()]/g, '');
  const local = digits.replace(/^(\+20|0020|20)(?=1)/, '0');
  return /^01[0125]\d{8}$/.test(local) ? `+2${local}` : null;
}

/** "+201123456789" ← "+20 112 345 6789" (للعرض بس، وجوه <bdi dir="ltr">) */
export function formatEgyptianMobile(phone: string): string {
  const match = phone.match(/^\+20(\d{3})(\d{3})(\d{4})$/);
  return match ? `+20 ${match[1]} ${match[2]} ${match[3]}` : phone;
}
