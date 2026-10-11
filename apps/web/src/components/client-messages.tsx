import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/**
 * الترجمات اللي بتروح للمتصفح (L-62): بدل ملف الترجمة كله في كل صفحة (~45 KB)،
 * كل جزء بيبعت الـnamespaces اللي الـComponents التفاعلية فيه بتستخدمها بس.
 * الـProvider اللي جوه بيحل محل اللي بره (مش بيدمجهم)، عشان كده BASE دايمًا معاه.
 * أي Client Component جديد بيستخدم namespace جديد: ضيفه هنا أو في الصفحة بتاعته.
 */
const BASE = [
  'nav',
  'states',
  'errorPage',
  'whatsapp',
  'leadForm',
  'bookingBar',
  'branches',
  'doctorsPage',
  'specialtyNames',
] as const;

export async function ClientMessages({
  namespaces = [],
  children,
}: {
  namespaces?: string[];
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const keys = new Set<string>([...BASE, ...namespaces]);
  const picked = Object.fromEntries(Object.entries(messages).filter(([key]) => keys.has(key)));
  return <NextIntlClientProvider messages={picked}>{children}</NextIntlClientProvider>;
}
