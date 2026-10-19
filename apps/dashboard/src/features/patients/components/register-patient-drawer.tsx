import { useState } from 'react';
import { Alert, Button, DatePicker, Drawer, Flex, Form, Input, Result, Radio, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized, normalizeEgyptianMobile } from '@oxygen/shared';
import type { Dayjs } from 'dayjs';
import { useLocale } from '@/app/use-locale';
import { useSearchPatientsQuery } from '@/features/appointments/appointments.api';
import type { PatientSummary } from '@/features/appointments/types';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { apiErrorCode } from '@/lib/api-error';
import { clinicToday } from '@/lib/clinic-time';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { useRegisterPatientMutation } from '../patients.api';
import { PATIENT_SOURCES, type PatientSource } from '../types';

type Values = {
  name_ar: string;
  name_en?: string;
  phone: string;
  gender: 'female' | 'male';
  birth_date?: Dayjs;
  branch_id: string;
  source: PatientSource;
  notes?: string;
};

type Props = {
  open: boolean;
  // من البحث في الحجز: الاسم أو الرقم اللي اتكتب
  prefill?: { name?: string; phone?: string };
  onClose: () => void;
  // "احجز له" (بعد التسجيل أو لما الرقم يطلع متسجل)
  onBook?: (patient: PatientSummary) => void;
  // اتسجل (الحجز بيختاره على طول)
  onRegistered?: (patient: PatientSummary) => void;
};

/**
 * تسجيل مريض سريع (D-04 · docs/20 · 3.3): الاسم · الموبايل المصري · النوع · الميلاد · الفرع · جه منين.
 * الموبايل بيتراجع وإنت بتكتب: لو متسجل، بيظهر صاحبه وزرار "احجز له هو" بدل ملف مكرر.
 */
export function RegisterPatientDrawer({ open, prefill, onClose, onBook, onRegistered }: Props) {
  const { t, i18n } = useTranslation('patients');
  const locale = useLocale();
  const [form] = Form.useForm<Values>();
  const { branchId, branches } = useBranchScope();
  const [register, { isLoading }] = useRegisterPatientMutation();
  const [created, setCreated] = useState<PatientSummary | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // الرقم صح ← دوّر عليه (بنفس بحث المرضى) عشان منعملش ملف مكرر
  const phone = normalizeEgyptianMobile(Form.useWatch('phone', form) ?? '');
  const lookup = useSearchPatientsQuery(
    { q: phone ?? '' },
    // نتيجة قديمة (من قبل ما الرقم يتسجل) متنفعش هنا (P-32)
    { skip: !phone, refetchOnMountOrArgChange: true },
  );
  const existing = phone ? lookup.data?.find((patient) => patient.phone === phone) : undefined;

  const submit = async (values: Values) => {
    setErrorCode(null);
    try {
      const patient = await register({
        name_ar: values.name_ar.trim(),
        name_en: values.name_en?.trim() || null,
        phone: normalizeEgyptianMobile(values.phone)!,
        gender: values.gender,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
        branch_id: values.branch_id,
        source: values.source,
        notes: values.notes?.trim() || null,
      }).unwrap();
      setCreated(patient);
      onRegistered?.(patient);
    } catch (error) {
      setErrorCode(apiErrorCode(error as never) ?? 'generic');
    }
  };

  const close = () => onClose();

  // بعد ما الـDrawer يقفل: فورم فاضي للمرة الجاية (الـform instance برة الـDrawer وبيحتفظ بالقيم — P-33)
  const reset = (isOpen: boolean) => {
    if (isOpen) return;
    form.resetFields();
    setCreated(null);
    setErrorCode(null);
  };

  const name = (patient: PatientSummary) => localized(patient, 'name', locale);

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t('register.title')}
      placement={i18n.dir() === 'rtl' ? 'left' : 'right'}
      size={440}
      destroyOnHidden
      afterOpenChange={reset}
      footer={
        created ? null : (
          <Flex justify="flex-end" gap={8}>
            <Button onClick={close}>{t('register.close')}</Button>
            <Button
              type="primary"
              loading={isLoading}
              onClick={() => form.submit()}
              disabled={!!existing}
            >
              {t('register.submit')}
            </Button>
          </Flex>
        )
      }
    >
      {created ? (
        <Result
          status="success"
          title={t('register.successTitle')}
          subTitle={t('register.done', { name: name(created), file: created.file_no })}
          extra={[
            onBook && (
              <Button
                key="book"
                type="primary"
                onClick={() => {
                  close();
                  onBook(created);
                }}
              >
                {t('register.bookNow')}
              </Button>
            ),
            <Button key="close" onClick={close}>
              {t('register.close')}
            </Button>,
          ]}
        />
      ) : (
        <Form<Values>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submit}
          initialValues={{
            name_ar: prefill?.name,
            phone: prefill?.phone,
            branch_id: branchId === ALL_BRANCHES ? branches[0]?.id : branchId,
            source: 'walk_in',
          }}
        >
          <Form.Item
            name="name_ar"
            label={t('register.nameAr')}
            rules={[
              { required: true, whitespace: true, message: t('register.nameRequired') },
              {
                validator: (_, value?: string) =>
                  !value || value.trim().split(/\s+/).length >= 2
                    ? Promise.resolve()
                    : Promise.reject(new Error(t('register.nameShort'))),
              },
            ]}
          >
            <Input autoFocus autoComplete="off" />
          </Form.Item>
          <Form.Item name="name_en" label={t('register.nameEn')}>
            <Input dir="ltr" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="phone"
            label={t('register.phone')}
            extra={t('register.phoneHelp')}
            rules={[
              { required: true, message: t('register.phoneRequired') },
              {
                validator: (_, value?: string) =>
                  !value || normalizeEgyptianMobile(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error(t('register.phoneInvalid'))),
              },
            ]}
          >
            <Input dir="ltr" inputMode="tel" autoComplete="off" />
          </Form.Item>

          {existing && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              title={t('register.duplicate', { name: name(existing), file: existing.file_no })}
              action={
                onBook && (
                  <Button
                    size="small"
                    onClick={() => {
                      close();
                      onBook(existing);
                    }}
                  >
                    {t('register.useExisting')}
                  </Button>
                )
              }
            />
          )}

          <Form.Item
            name="gender"
            label={t('register.gender')}
            rules={[{ required: true, message: t('register.genderRequired') }]}
          >
            {/* Radio مش Segmented: الـSegmented الفاضي بيبان كأن أول اختيار متعلّم عليه (P-31) */}
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { value: 'female', label: t('register.female') },
                { value: 'male', label: t('register.male') },
              ]}
            />
          </Form.Item>
          <Form.Item name="birth_date" label={t('register.birthDate')}>
            <DatePicker
              style={{ width: '100%' }}
              format="D MMMM YYYY"
              disabledDate={(day) => day.format('YYYY-MM-DD') > clinicToday()}
            />
          </Form.Item>
          <Form.Item name="branch_id" label={t('register.branch')}>
            <Select
              options={branches.map((branch) => ({
                value: branch.id,
                label: localized(branch, 'name', locale),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="source"
            label={t('register.source')}
            rules={[{ required: true, message: t('register.sourceRequired') }]}
          >
            <Select
              options={PATIENT_SOURCES.map((value) => ({ value, label: t(`sources.${value}`) }))}
            />
          </Form.Item>
          <Form.Item name="notes" label={t('register.notes')}>
            <Input.TextArea maxLength={300} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>

          {errorCode && (
            <Alert
              type="error"
              showIcon
              role="alert"
              title={
                errorCode === 'DUPLICATE_PHONE'
                  ? t('register.errors.DUPLICATE_PHONE')
                  : t('register.errors.generic')
              }
            />
          )}
        </Form>
      )}
    </Drawer>
  );
}
