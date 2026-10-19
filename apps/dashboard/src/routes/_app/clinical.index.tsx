import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, Col, Row, Typography } from 'antd';
import { Dumbbell, FileCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { PageHeader } from '@/components/page-header';

// العيادة: مدخل أدوات الدكاترة (مكتبة التمارين 4.5 · بنّاء الفورمات 4.9)
export const Route = createFileRoute('/_app/clinical/')({
  staticData: { nav: 'clinical' },
  component: ClinicalHub,
});

function ClinicalHub() {
  const { t } = useTranslation('exercises');
  const { t: tNav } = useTranslation('nav');

  return (
    <>
      <PageHeader title={tNav('clinical')} description={t('hub.description')} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <Link to="/clinical/exercises" style={{ display: 'block' }}>
            <Card hoverable>
              <Dumbbell size={24} color={tokens.color.primary} aria-hidden />
              <Typography.Title level={2} style={{ fontSize: 18, marginTop: 12 }}>
                {t('title')}
              </Typography.Title>
              <Typography.Text type="secondary">{t('hub.exercises')}</Typography.Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Card>
            <FileCog size={24} color={tokens.color.mutedText} aria-hidden />
            <Typography.Title level={2} style={{ fontSize: 18, marginTop: 12 }}>
              {t('hub.builder')}
            </Typography.Title>
            <Typography.Text type="secondary">{t('hub.builderSoon')}</Typography.Text>
          </Card>
        </Col>
      </Row>
    </>
  );
}
