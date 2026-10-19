import { Button, Dropdown, Flex, Typography } from 'antd';
import { ChevronDown, Languages, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useLogoutMutation } from '@/features/auth/auth.api';
import { useMe } from '@/features/auth/use-me';
import { PersonAvatar } from '@/components/person-avatar';
import { baseApi } from '@/store/base-api';
import { useAppDispatch } from '@/store/store';

/** الحساب في الـTop bar: الاسم والدور · تغيير اللغة · خروج */
export function UserMenu({ compact }: { compact: boolean }) {
  const me = useMe();
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const name = localized(me, 'name', locale);

  const signOut = async () => {
    await logout();
    await navigate({ to: '/login' });
    // داتا الموظف اللي خرج متفضلش في الذاكرة
    dispatch(baseApi.util.resetApiState());
  };

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: [
          { type: 'group', key: 'account', label: me.email },
          {
            key: 'language',
            icon: <Languages size={16} aria-hidden />,
            label: t('header.switchLanguage'),
            onClick: () => i18n.changeLanguage(locale === 'ar' ? 'en' : 'ar'),
          },
          { type: 'divider' },
          {
            key: 'logout',
            icon: <LogOut size={16} aria-hidden />,
            label: t('header.logout'),
            onClick: signOut,
          },
        ],
      }}
    >
      <Button type="text" aria-label={t('header.account')} style={{ height: 48, paddingInline: 8 }}>
        <Flex align="center" gap={10}>
          <PersonAvatar name={name} />
          {!compact && (
            <Flex vertical align="start" style={{ lineHeight: 1.3 }}>
              <Typography.Text strong>{name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t(`roles.${me.role}`)}
              </Typography.Text>
            </Flex>
          )}
          <ChevronDown size={16} aria-hidden />
        </Flex>
      </Button>
    </Dropdown>
  );
}
