import { Card, Flex, Typography } from 'antd';
import { FileCheck2, FileText, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { ErrorState, LoadingState } from '@/components/states/states';
import { useGetDoctorPendingQuery } from '../doctor-day.api';

const ROWS = [
  { key: 'unsigned_notes', label: 'unsignedNotes', Icon: FileText },
  { key: 'reports_to_review', label: 'reports', Icon: FileCheck2 },
  { key: 'unread_messages', label: 'messages', Icon: MessageSquare },
] as const;

/** "مستني منك" (D-10): ملاحظات مش متوقّعة · تقارير · رسايل. أرقام بس لحد ما شاشاتها تتبني (4.3 · 4.7) */
export function PendingCard() {
  const { t } = useTranslation('doctorDay');
  const { data, isLoading, isError, refetch } = useGetDoctorPendingQuery();

  return (
    <Card title={t('pending.title')}>
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ROWS.map(({ key, label, Icon }) => (
            <li key={key} style={{ paddingBlock: 10 }}>
              <Flex align="center" gap={12}>
                <Icon size={20} color={tokens.color.primary} aria-hidden />
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{t(`pending.${label}`)}</Typography.Text>
                  <Typography.Text type="secondary" style={{ display: 'block' }}>
                    {t(`pending.${label}Hint`, { count: data[key] })}
                  </Typography.Text>
                </div>
                <Typography.Text strong>{data[key]}</Typography.Text>
              </Flex>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
