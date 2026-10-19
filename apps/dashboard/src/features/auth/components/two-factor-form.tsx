import { useEffect, useRef, useState, type FormEvent } from 'react';
import { App, Button, Flex, Input, Typography, type GetRef } from 'antd';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { apiErrorCode } from '@/lib/api-error';
import { useResendTwoFactorMutation, useVerifyTwoFactorMutation } from '../auth.api';
import type { StaffMe } from '../types';
import { AuthError } from './auth-error';
import type { Challenge } from './credentials-form';

const CODE_LENGTH = 6;

// 42 ← "0:42"
const asClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

type Props = {
  challenge: Challenge;
  onSignedIn: (me: StaffMe) => void;
  onBack: () => void;
};

/** الخطوة التانية: كود التحقق (بياخد مكان كارت الدخول — ملاحظة B0) */
export function TwoFactorForm({ challenge, onSignedIn, onBack }: Props) {
  const { t } = useTranslation('auth');
  const { message } = App.useApp();
  const [code, setCode] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(challenge.resend_after_seconds);
  const [verify, { isLoading }] = useVerifyTwoFactorMutation();
  const [resend, { isLoading: isResending }] = useResendTwoFactorMutation();
  const otpRef = useRef<GetRef<typeof Input.OTP>>(null);

  // بعد كود غلط الخانات بتتمسح، والمؤشر يرجع لأول خانة على طول (من غير ما يدوس تاني)
  useEffect(() => {
    if (errorCode && !isLoading) otpRef.current?.focus();
  }, [errorCode, isLoading]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (code.length !== CODE_LENGTH) return;
    setErrorCode(null);
    try {
      onSignedIn(
        await verify({
          challenge_id: challenge.challenge_id,
          code,
          remember_device: challenge.remember,
        }).unwrap(),
      );
    } catch (error) {
      setErrorCode(apiErrorCode(error as never) ?? 'generic');
      setCode('');
    }
  };

  const requestNewCode = async () => {
    setErrorCode(null);
    try {
      const result = await resend({ challenge_id: challenge.challenge_id }).unwrap();
      setSecondsLeft(result.resend_after_seconds);
      void message.success(t('twoFactor.resent'));
    } catch (error) {
      setErrorCode(apiErrorCode(error as never) ?? 'generic');
    }
  };

  const expired = errorCode === 'CHALLENGE_EXPIRED';

  return (
    <form onSubmit={submit} noValidate>
      <span
        aria-hidden
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: tokens.color.mist,
          color: tokens.color.primary,
          marginBottom: 16,
        }}
      >
        <ShieldCheck size={24} />
      </span>
      <Typography.Title level={1} style={{ fontSize: 28, margin: 0 }}>
        {t('twoFactor.title')}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBlock: '4px 24px' }}>
        {t('twoFactor.subtitle', { email: challenge.masked_email })}
      </Typography.Paragraph>

      <Typography.Text strong id="otp-label" style={{ display: 'block', marginBottom: 8 }}>
        {t('twoFactor.code')}
      </Typography.Text>
      {/* الأرقام من الشمال لليمين حتى في العربي */}
      <div dir="ltr" style={{ direction: 'ltr', marginBottom: 16 }} aria-labelledby="otp-label">
        <Input.OTP
          ref={otpRef}
          length={CODE_LENGTH}
          value={code}
          onChange={setCode}
          size="large"
          autoFocus
          disabled={isLoading || expired}
          formatter={(value) => value.replace(/\D/g, '')}
        />
      </div>

      <AuthError code={errorCode} />

      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={isLoading}
        disabled={code.length !== CODE_LENGTH || expired}
      >
        {t('twoFactor.verify')}
      </Button>

      <Flex justify="space-between" align="center" wrap gap={8} style={{ marginTop: 16 }}>
        {secondsLeft > 0 ? (
          <Typography.Text type="secondary" aria-live="polite">
            {t('twoFactor.resendIn', { time: asClock(secondsLeft) })}
          </Typography.Text>
        ) : (
          <Button
            type="link"
            onClick={requestNewCode}
            loading={isResending}
            disabled={expired}
            style={{ paddingInline: 0 }}
          >
            {t('twoFactor.resend')}
          </Button>
        )}
        <Button type="link" onClick={onBack} style={{ paddingInline: 0 }}>
          {t('twoFactor.useAnother')}
        </Button>
      </Flex>
    </form>
  );
}
