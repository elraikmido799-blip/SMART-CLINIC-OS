import { useState } from 'react';
import { Button, Card, Flex, Input, Table, Typography } from 'antd';
import { Search, UserPlus } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, formatMoney, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { PersonAvatar } from '@/components/person-avatar';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useSearchPatientsQuery } from '@/features/appointments/appointments.api';
import type { PatientSummary } from '@/features/appointments/types';
import { useCan } from '@/features/auth/use-me';
import { useDebounced } from '@/lib/use-debounced';
import { rememberPatient } from '../recent';
import { RegisterPatientDrawer } from './register-patient-drawer';
import { clickableRow } from '@/lib/clickable-row';

/**
 * المرضى (D-08 · docs/20 · 3.5): بحث بالاسم أو الموبايل أو رقم الملف ونتايجه في جدول.
 * البحث في الـURL (?q=)، والصف بيفتح ملف المريض. "مريض جديد" للي عنده الصلاحية.
 */
export function PatientsPage() {
  const { t } = useTranslation('patients');
  const locale = useLocale();
  const navigate = useNavigate({ from: '/patients/' });
  const search = useSearch({ from: '/_app/patients/' });
  const canRegister = useCan('patients.write');
  const [registering, setRegistering] = useState(false);
  const query = useDebounced((search.q ?? '').trim());
  const results = useSearchPatientsQuery(
    { q: query, limit: 50 },
    { skip: query.length < 2, refetchOnMountOrArgChange: true },
  );

  const open = (patient: PatientSummary) => {
    rememberPatient(patient);
    void navigate({ to: '/patients/$patientId', params: { patientId: patient.id } });
  };

  return (
    <>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        extra={
          canRegister ? (
            <Button
              type="primary"
              icon={<UserPlus size={16} aria-hidden />}
              onClick={() => setRegistering(true)}
            >
              {t('list.newPatient')}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <Input
          type="search"
          size="large"
          allowClear
          autoFocus
          aria-label={t('search.label')}
          placeholder={t('list.description')}
          prefix={<Search size={18} color={tokens.color.mutedText} aria-hidden />}
          value={search.q ?? ''}
          onChange={(event) =>
            navigate({ search: { q: event.target.value || undefined }, replace: true })
          }
          style={{ maxWidth: 560, marginBottom: 16 }}
        />
        {query.length < 2 ? (
          <EmptyState title={t('list.empty')} />
        ) : results.isError ? (
          <ErrorState onRetry={() => void results.refetch()} />
        ) : (
          <Table<PatientSummary>
            rowKey="id"
            loading={results.isFetching}
            dataSource={results.data ?? []}
            pagination={false}
            locale={{ emptyText: <EmptyState title={t('list.noResults')} /> }}
            onRow={(patient) => clickableRow(() => open(patient))}
            scroll={{ x: 'max-content' }}
            columns={[
              {
                key: 'name',
                title: t('list.name'),
                render: (_, patient) => (
                  <Flex align="center" gap={10}>
                    <PersonAvatar name={localized(patient, 'name', locale)} size={32} />
                    <Typography.Link
                      onClick={(event) => {
                        event.stopPropagation();
                        open(patient);
                      }}
                    >
                      {localized(patient, 'name', locale)}
                    </Typography.Link>
                  </Flex>
                ),
              },
              {
                key: 'file',
                title: t('list.file'),
                render: (_, patient) => <span dir="ltr">{patient.file_no}</span>,
              },
              {
                key: 'phone',
                title: t('list.phone'),
                render: (_, patient) => (
                  <span dir="ltr">{formatEgyptianMobile(patient.phone)}</span>
                ),
              },
              {
                key: 'balance',
                title: t('list.balance'),
                render: (_, patient) =>
                  patient.balance_due > 0 ? (
                    <StatusTag tone="warning">
                      {formatMoney(patient.balance_due, 'EGP', locale)}
                    </StatusTag>
                  ) : (
                    <Typography.Text type="secondary">—</Typography.Text>
                  ),
              },
            ]}
          />
        )}
      </Card>
      <RegisterPatientDrawer
        open={registering}
        onClose={() => setRegistering(false)}
        onBook={open}
      />
    </>
  );
}
