import { Button, Card, Flex } from 'antd';
import { CalendarPlus, CreditCard, UserPlus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

/**
 * الإجراءات السريعة (D-02). لحد ما شاشاتها تتبني بتودّي لقسمها:
 * مريض جديد (3.3) · حجز جديد (3.2) · تحصيل (3.6)
 */
export function QuickActions() {
  const { t } = useTranslation('frontDesk');
  const navigate = useNavigate();

  const actions = [
    { key: 'newPatient', icon: UserPlus, to: '/patients' },
    { key: 'newBooking', icon: CalendarPlus, to: '/calendar' },
    { key: 'collect', icon: CreditCard, to: '/front-desk' },
  ] as const;

  return (
    <Card title={t('quick.title')}>
      <Flex vertical gap={8}>
        {actions.map(({ key, icon: Icon, to }) => (
          <Button
            key={key}
            size="large"
            icon={<Icon size={18} aria-hidden />}
            onClick={() => navigate({ to })}
            style={{ justifyContent: 'flex-start' }}
          >
            {t(`quick.${key}`)}
          </Button>
        ))}
      </Flex>
    </Card>
  );
}
