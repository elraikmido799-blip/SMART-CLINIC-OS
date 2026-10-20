import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { AuditTable } from './audit-table';

/** تاب "الوصول" في ملف المريض (9.7): مين فتح الملف أو عدّل فيه، لآخر 90 يوم. للي عنده `audit.read` بس */
export function PatientAccessTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('settings');
  return (
    <Card>
      <Typography.Paragraph type="secondary">{t('audit.patientNote')}</Typography.Paragraph>
      <AuditTable query={{ branch_id: 'all', days: 90, patient_id: patientId }} />
    </Card>
  );
}
