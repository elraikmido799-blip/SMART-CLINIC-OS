import { useState } from 'react';
import { Button, Checkbox, Flex, Form, Input, Popover, Typography } from 'antd';
import { KeyRound, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { apiErrorCode } from '@/lib/api-error';
import { useLoginMutation } from '../auth.api';
import type { LoginResponse, StaffMe } from '../types';
import { AuthError } from './auth-error';

type Values = { email: string; password: string; remember: boolean };

export type Challenge = NonNullable<LoginResponse['two_factor']> & { remember: boolean };

type Props = {
  onChallenge: (challenge: Challenge) => void;
  onSignedIn: (me: StaffMe) => void;
};

const iconColor = tokens.color.mutedText;

/** الخطوة الأولى: الإيميل والباسورد (D-01-login.png) */
export function CredentialsForm({ onChallenge, onSignedIn }: Props) {
  const { t } = useTranslation('auth');
  const [login, { isLoading }] = useLoginMutation();
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const submit = async ({ email, password, remember }: Values) => {
    setErrorCode(null);
    try {
      const result = await login({ email, password }).unwrap();
      if (result.two_factor) onChallenge({ ...result.two_factor, remember });
      else if (result.me) onSignedIn(result.me);
    } catch (error) {
      setErrorCode(apiErrorCode(error as never) ?? 'generic');
    }
  };

  return (
    <>
      <Typography.Title level={1} style={{ fontSize: 28, margin: 0 }}>
        {t('login.title')}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBlock: '4px 24px' }}>
        {t('login.subtitle')}
      </Typography.Paragraph>

      <Form<Values>
        layout="vertical"
        requiredMark={false}
        initialValues={{ remember: false }}
        onFinish={submit}
        disabled={isLoading}
      >
        <Form.Item
          name="email"
          label={t('login.email')}
          rules={[
            { required: true, message: t('login.emailRequired') },
            { type: 'email', message: t('login.emailInvalid') },
          ]}
        >
          <Input
            type="email"
            autoComplete="username"
            autoFocus
            size="large"
            prefix={<Mail size={16} color={iconColor} aria-hidden />}
            dir="ltr"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('login.password')}
          rules={[{ required: true, message: t('login.passwordRequired') }]}
        >
          <Input.Password
            autoComplete="current-password"
            size="large"
            prefix={<KeyRound size={16} color={iconColor} aria-hidden />}
          />
        </Form.Item>

        <Flex justify="space-between" align="center" wrap gap={8} style={{ marginBottom: 24 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>{t('login.remember')}</Checkbox>
          </Form.Item>
          <Popover
            trigger="click"
            content={<div style={{ maxWidth: 260 }}>{t('login.forgotHelp')}</div>}
          >
            <Button type="link" style={{ paddingInline: 0 }}>
              {t('login.forgot')}
            </Button>
          </Popover>
        </Flex>

        <AuthError code={errorCode} />

        <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
          {t('login.submit')}
        </Button>
      </Form>
    </>
  );
}
