import { useEffect, useState } from 'react';
import { Alert, Card, Flex, Grid, Typography } from 'antd';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { env } from '@/lib/env';
import { useAppDispatch } from '@/store/store';
import { authApi } from '../auth.api';
import type { StaffMe } from '../types';
import { CredentialsForm, type Challenge } from './credentials-form';
import { TwoFactorForm } from './two-factor-form';

const { brandFrom, brandTo, background } = tokens.color;

// نقط هادية في البانل (زينة بس)
const PARTICLES = [
  [12, 10, 10],
  [22, 70, 6],
  [78, 14, 8],
  [64, 88, 6],
  [88, 52, 10],
  [8, 86, 8],
  [44, 6, 5],
] as const;

/**
 * البانل بتاع البراند (D-01-login.png): التدرّج هنا بس في الداشبورد (DEC-41).
 * الكلام الأبيض فوق الجزء الأزرق من التدرّج، مش الأكوا (الأبيض على الأكوا contrast 2.2).
 */
function BrandPanel({ compact }: { compact: boolean }) {
  const { t } = useTranslation('auth');
  return (
    <Flex
      component="aside"
      vertical
      align="center"
      justify="center"
      gap={compact ? 8 : 20}
      style={{
        position: 'relative',
        overflow: 'hidden',
        flex: compact ? 'none' : '0 0 42%',
        padding: compact ? '24px 16px' : 48,
        background: `linear-gradient(160deg, ${brandFrom} 0%, ${brandTo} 45%)`,
        color: '#fff',
        textAlign: 'center',
      }}
    >
      {!compact &&
        PARTICLES.map(([top, start, size]) => (
          <span
            key={`${top}-${start}`}
            aria-hidden
            style={{
              position: 'absolute',
              insetBlockStart: `${top}%`,
              insetInlineStart: `${start}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.35)',
            }}
          />
        ))}
      <img
        src="/logo-white.png"
        alt="Oxygen"
        width={compact ? 96 : 200}
        height={compact ? 88 : 184}
        style={{ position: 'relative' }}
      />
      <Typography.Text
        style={{
          color: '#fff',
          fontSize: compact ? 20 : 36,
          fontWeight: 600,
          position: 'relative',
        }}
      >
        {t('brand.portal')}
      </Typography.Text>
      {!compact && (
        <Typography.Text style={{ color: '#fff', fontSize: 18, position: 'relative' }}>
          {t('brand.tagline')}
        </Typography.Text>
      )}
    </Flex>
  );
}

/** الدخول: الإيميل والباسورد ← كود التحقق (لو الجهاز مش موثوق) ← الصفحة اللي كان رايحها */
export function LoginPage() {
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation();
  const search = useSearch({ from: '/login' });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const screens = Grid.useBreakpoint();
  const compact = screens.md === false;
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    document.title = `${t('login.pageTitle')} · ${tCommon('app.name')}`;
  }, [t, tCommon]);

  const finish = async (me: StaffMe) => {
    // الموظف بقى معروف: الـGuard مش هيطلبه تاني
    dispatch(authApi.util.upsertQueryData('getMe', undefined, me));
    await navigate({ href: search.redirect ?? '/' });
  };

  return (
    <Flex vertical={compact} style={{ minHeight: '100dvh' }}>
      <BrandPanel compact={compact} />
      <Flex
        component="main"
        flex={1}
        vertical
        align="center"
        justify="center"
        gap={16}
        style={{ background, padding: compact ? 16 : 48 }}
      >
        {search.expired && (
          <Alert
            type="info"
            showIcon
            title={tCommon('session.expired')}
            style={{ width: '100%', maxWidth: 440 }}
          />
        )}
        <Card
          style={{ width: '100%', maxWidth: 440 }}
          styles={{ body: { padding: compact ? 24 : 32 } }}
        >
          {challenge ? (
            <TwoFactorForm
              challenge={challenge}
              onSignedIn={finish}
              onBack={() => setChallenge(null)}
            />
          ) : (
            <CredentialsForm onChallenge={setChallenge} onSignedIn={finish} />
          )}
        </Card>
        {env.apiMocking && (
          <Alert
            type="info"
            title={t('demo.title')}
            description={<span dir="auto">{t('demo.body')}</span>}
            style={{ width: '100%', maxWidth: 440 }}
          />
        )}
      </Flex>
    </Flex>
  );
}
