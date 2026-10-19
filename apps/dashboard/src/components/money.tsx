import { formatMoney } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';

/** الفلوس جاية من الـAPI بالقروش: 1840000 ← "EGP 18,400" أو "‏18,400 ج.م.‏" */
export function Money({ amount, currency = 'EGP' }: { amount: number; currency?: string }) {
  const locale = useLocale();
  return <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(amount, currency, locale)}</span>;
}
