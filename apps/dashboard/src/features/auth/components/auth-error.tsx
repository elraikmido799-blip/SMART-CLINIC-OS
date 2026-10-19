import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';

const KNOWN = [
  'INVALID_CREDENTIALS',
  'ACCOUNT_LOCKED',
  'INVALID_CODE',
  'CHALLENGE_EXPIRED',
  'network',
] as const;
type KnownCode = (typeof KNOWN)[number];

const isKnown = (code: string): code is KnownCode => (KNOWN as readonly string[]).includes(code);

/** رسالة الخطأ في الدخول حسب كود الـAPI (أي كود تاني = رسالة عامة) */
export function AuthError({ code }: { code: string | null | undefined }) {
  const { t } = useTranslation('auth');
  if (code === null || code === undefined) return null;
  return (
    <Alert
      type="error"
      showIcon
      role="alert"
      title={isKnown(code) ? t(`errors.${code}`) : t('errors.generic')}
      style={{ marginBottom: 16 }}
    />
  );
}
