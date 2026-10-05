import { createFileRoute } from '@tanstack/react-router';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { tokens, type Specialty } from '@oxygen/config';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const SPECIALTIES = Object.keys(tokens.specialty) as Specialty[];

// صفحة مؤقتة عشان نتأكد إن الأساس شغال (antd RTL، الألوان، الترجمة). هتتبني بجد في خطة الداشبورد
function HomePage() {
  const { t, i18n } = useTranslation();
  const otherLanguage = i18n.language === 'ar' ? 'en' : 'ar';

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100dvh', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 560 }}>
        <Typography.Title level={2}>{t('app.title')}</Typography.Title>
        <Typography.Paragraph type="secondary">{t('app.subtitle')}</Typography.Paragraph>
        <Flex vertical gap={16}>
          <Space wrap>
            {SPECIALTIES.map((specialty) => (
              <Tag key={specialty} color={tokens.specialty[specialty]}>
                {t(`specialties.${specialty}`)}
              </Tag>
            ))}
          </Space>
          <Space>
            <Button type="primary">{t('app.login')}</Button>
            <Button onClick={() => i18n.changeLanguage(otherLanguage)}>
              {t('app.switchLanguage')}
            </Button>
          </Space>
        </Flex>
      </Card>
    </Flex>
  );
}
