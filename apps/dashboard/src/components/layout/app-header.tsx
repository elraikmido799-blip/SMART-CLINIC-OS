import { Badge, Button, Divider, Flex, Input, Layout, Popover } from 'antd';
import { Bell, Menu, Search } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { EmptyState } from '@/components/states/states';
import { BranchSelect } from './branch-select';
import { UserMenu } from './user-menu';

/**
 * الـTop bar (زي D-02-reception.png): الفرع · البحث عن مريض · الإشعارات · الحساب.
 * البحث بيتبني في 20 · 3.5، والإشعارات شكل بس لحد ما الـAPI يجهز.
 */
export function AppHeader({ isMobile, onOpenMenu }: { isMobile: boolean; onOpenMenu: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goToPatients = () => navigate({ to: '/patients' });

  return (
    <Layout.Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 8 : 16,
        lineHeight: 'normal',
        paddingInline: isMobile ? 12 : 24,
        borderBottom: `1px solid ${tokens.color.border}`,
      }}
    >
      {isMobile && (
        <Button
          type="text"
          aria-label={t('header.openMenu')}
          icon={<Menu size={20} aria-hidden />}
          onClick={onOpenMenu}
        />
      )}
      <BranchSelect width={isMobile ? 150 : 220} />
      {!isMobile && (
        <Input
          type="search"
          aria-label={t('header.search')}
          placeholder={t('header.search')}
          prefix={<Search size={16} color={tokens.color.mutedText} aria-hidden />}
          onPressEnter={goToPatients}
          style={{ maxWidth: 480, flex: 1 }}
        />
      )}
      <Flex align="center" gap={4} style={{ marginInlineStart: 'auto' }}>
        {isMobile && (
          <Button
            type="text"
            aria-label={t('header.search')}
            icon={<Search size={20} aria-hidden />}
            onClick={goToPatients}
          />
        )}
        <Popover
          trigger="click"
          placement="bottomRight"
          title={t('header.notifications')}
          content={
            <div style={{ width: 280 }}>
              <EmptyState title={t('header.noNotifications')} />
            </div>
          }
        >
          <Button
            type="text"
            aria-label={t('header.notifications')}
            icon={
              <Badge count={0} size="small">
                <Bell size={20} aria-hidden />
              </Badge>
            }
          />
        </Popover>
        {!isMobile && <Divider orientation="vertical" style={{ height: 32 }} />}
        <UserMenu compact={isMobile} />
      </Flex>
    </Layout.Header>
  );
}
