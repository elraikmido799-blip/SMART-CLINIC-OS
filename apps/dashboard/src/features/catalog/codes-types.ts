import { z } from 'zod';

export const CODE_TYPES = ['percent', 'fixed'] as const;

export const CODE_APPLIES_TO = ['all', 'service', 'package'] as const;

export type CodeAppliesTo = (typeof CODE_APPLIES_TO)[number];

/**
 * كود خصم (D-25 · docs/04 `discount_codes`): نسبة أو مبلغ ثابت (بالقروش)، فترة، أقصى عدد استخدامات،
 * وبيتطبق على الكل أو الخدمات أو الباقات. `used` بيزيد مع كل فاتورة بتستخدمه.
 */
export const discountCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(CODE_TYPES),
  // نسبة مئوية لو `percent`، وقروش لو `fixed`
  value: z.number(),
  starts_on: z.string(),
  ends_on: z.string().nullable(),
  max_uses: z.number().nullable(),
  used: z.number(),
  applies_to: z.enum(CODE_APPLIES_TO),
  active: z.boolean(),
});

export type DiscountCode = z.infer<typeof discountCodeSchema>;

export type DiscountCodeBody = Omit<DiscountCode, 'id' | 'used'>;

export type UpdateDiscountCodeBody = { id: string } & DiscountCodeBody;

export type CodeState = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'off';

/** حالة الكود النهارده (`today` = يوم مصر): بالترتيب مقفول ← خلص استخداماته ← انتهى ← لسه ← شغال */
export function codeStateOf(code: DiscountCode, today: string): CodeState {
  if (!code.active) return 'off';
  if (code.max_uses !== null && code.used >= code.max_uses) return 'exhausted';
  if (code.ends_on && code.ends_on < today) return 'expired';
  if (code.starts_on > today) return 'scheduled';
  return 'active';
}
