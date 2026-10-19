import { useEffect, useRef, useState } from 'react';
import { AutoComplete, Flex, Input, Typography, type AutoCompleteProps, type GetRef } from 'antd';
import { Search } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { useSearchPatientsQuery } from '@/features/appointments/appointments.api';
import type { PatientSummary } from '@/features/appointments/types';
import { readRecentPatients, rememberPatient } from '@/features/patients/recent';
import { useDebounced } from '@/lib/use-debounced';

// "/" بيفتح البحث من أي مكان، إلا وإنت بتكتب في خانة تانية
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * البحث عن مريض في الـTop bar (D-08 · docs/20 · 3.5): بالاسم أو الموبايل بأي شكل أو رقم الملف.
 * أول ما تدوس من غير ما تكتب: آخر مرضى اتفتحوا. الاختيار بيفتح ملف المريض.
 */
export function PatientSearch() {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const inputRef = useRef<GetRef<typeof AutoComplete>>(null);
  const [value, setValue] = useState('');
  const [recent, setRecent] = useState<PatientSummary[]>([]);
  const query = useDebounced(value.trim());
  const results = useSearchPatientsQuery(
    { q: query },
    { skip: query.length < 2, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || isTyping(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const list = query.length < 2 ? recent : (results.data ?? []);
  const option = (patient: PatientSummary) => ({
    value: patient.id,
    label: (
      <Flex align="center" gap={10}>
        <PersonAvatar name={localized(patient, 'name', locale)} size={32} />
        <div style={{ minWidth: 0 }}>
          <Typography.Text strong ellipsis style={{ display: 'block' }}>
            {localized(patient, 'name', locale)}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            <span dir="ltr">{patient.file_no}</span> ·{' '}
            <span dir="ltr">{formatEgyptianMobile(patient.phone)}</span>
          </Typography.Text>
        </div>
      </Flex>
    ),
  });

  const options: AutoCompleteProps['options'] =
    list.length === 0
      ? []
      : query.length < 2
        ? [{ label: t('search.recent'), options: list.map(option) }]
        : list.map(option);

  const open = (id: string) => {
    const patient = list.find((item) => item.id === id);
    if (patient) rememberPatient(patient);
    setValue('');
    inputRef.current?.blur();
    void navigate({ to: '/patients/$patientId', params: { patientId: id } });
  };

  return (
    <AutoComplete
      ref={inputRef}
      value={value}
      onChange={setValue}
      onSelect={open}
      onFocus={() => setRecent(readRecentPatients())}
      style={{ maxWidth: 480, flex: 1 }}
      popupMatchSelectWidth
      options={options}
      notFoundContent={
        query.length >= 2 && !results.isFetching ? (
          <Typography.Text type="secondary">{t('search.none')}</Typography.Text>
        ) : null
      }
    >
      <Input
        type="search"
        aria-label={t('search.label')}
        placeholder={tCommon('header.search')}
        prefix={<Search size={16} color={tokens.color.mutedText} aria-hidden />}
        suffix={
          <kbd
            title={t('search.shortcut')}
            style={{
              fontSize: 12,
              color: tokens.color.mutedText,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: 6,
              padding: '0 6px',
            }}
          >
            /
          </kbd>
        }
      />
    </AutoComplete>
  );
}
