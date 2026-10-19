import type { Discount } from './types';

/**
 * حساب الفاتورة (نفس حساب الـAPI، عشان الموظف يشوف الأرقام قبل ما يبعت — والـAPI هو اللي بيحسم).
 * الخصم على الخدمات بس، مش على الفلوس المتأخرة القديمة. كله بالقروش.
 */
export function invoiceTotals({
  subtotal,
  discount,
  codePercent,
  previousBalance,
  includeBalance,
}: {
  subtotal: number;
  discount: Discount | null;
  // خصم الكود (لو اتقبل)
  codePercent: number;
  previousBalance: number;
  includeBalance: boolean;
}) {
  const manual = !discount
    ? 0
    : discount.type === 'percent'
      ? Math.round((subtotal * discount.value) / 100)
      : discount.value;
  const fromCode = Math.round((subtotal * codePercent) / 100);
  const discountTotal = Math.min(subtotal, manual + fromCode);
  const carried = includeBalance ? previousBalance : 0;
  return { discount: discountTotal, total: subtotal - discountTotal + carried };
}

// أقصى خصم يدوي بالنسبة المئوية (من غير الكود)
export function discountPercentOf(subtotal: number, discount: Discount | null) {
  if (!discount || subtotal === 0) return 0;
  return discount.type === 'percent' ? discount.value : (discount.value / subtotal) * 100;
}
