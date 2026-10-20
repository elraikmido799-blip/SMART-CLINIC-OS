import { Alert, App, Button, Drawer, Flex, Form, Input, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { ROLES, type Role } from '@/features/auth/permissions';
import { useCan, useMe } from '@/features/auth/use-me';
import { useGetBranchesQuery } from '@/features/branches/branches.api';
import { apiErrorCode } from '@/lib/api-error';
import { useCreateStaffMemberMutation, useUpdateStaffMemberMutation } from '../staff.api';
import { CLINICAL_ROLES, type StaffMember } from '../staff-types';

type Values = {
  name_ar: string;
  name_en: string;
  email: string;
  role: Role;
  all_branches: boolean;
  branch_ids: string[];
  specialty: Specialty | null;
  active: boolean;
};

const toValues = (member: StaffMember | null, defaultBranches: string[]): Values => ({
  name_ar: member?.name_ar ?? '',
  name_en: member?.name_en ?? '',
  email: member?.email ?? '',
  role: member?.role ?? 'reception',
  all_branches: member?.all_branches ?? false,
  branch_ids: member?.branch_ids ?? defaultBranches,
  specialty: member?.specialty ?? null,
  active: member?.active ?? true,
});

// الأدوار اللي مدير الفرع مينفعش يعيّنها (الإدارة)
const MANAGEMENT = new Set<Role>([
  'admin',
  'ceo',
  'operations_manager',
  'finance',
  'branch_manager',
]);

/**
 * موظف جديد أو تعديل موظف (D-35): الاسمين · الإيميل · الدور · الفروع (أو كل الفروع) · التخصص للأدوار الطبية · شغال/مقفول.
 * الأدمن بيعيّن أي دور وأي فرع، ومدير الفرع بيعيّن أدوار التشغيل لفرعه بس. الـAPI بيتأكد من ده كمان.
 */
export function StaffDrawer({
  member,
  open,
  onClose,
}: {
  // فاضي = موظف جديد
  member: StaffMember | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { message } = App.useApp();
  const me = useMe();
  const isAdmin = useCan('roles.manage');
  const [form] = Form.useForm<Values>();
  const [error, setError] = useState<string | null>(null);
  const branches = useGetBranchesQuery();
  const [create, createState] = useCreateStaffMemberMutation();
  const [update, updateState] = useUpdateStaffMemberMutation();
  useEffect(() => {
    if (open) form.setFieldsValue(toValues(member, me.all_branches ? [] : me.branch_ids));
  }, [open, member, me, form]);

  const role = Form.useWatch('role', form) ?? member?.role ?? 'reception';
  const allBranches = Form.useWatch('all_branches', form) ?? member?.all_branches ?? false;

  const save = async () => {
    setError(null);
    // كل القيم حتى اللي حقولها مستخبية (مدير الفرع مبيشوفش "كل الفروع")
    const values = form.getFieldsValue(true) as Values;
    const body = {
      name_ar: values.name_ar,
      name_en: values.name_en,
      email: values.email,
      role: values.role,
      all_branches: values.all_branches,
      branch_ids: values.all_branches ? [] : values.branch_ids,
      specialty: (CLINICAL_ROLES as readonly string[]).includes(values.role)
        ? values.specialty
        : null,
      active: values.active,
    };
    try {
      if (member) await update({ id: member.id, ...body }).unwrap();
      else await create(body).unwrap();
      void message.success(t(member ? 'staff.saved' : 'staff.created'));
      onClose();
    } catch (failure) {
      const code = apiErrorCode(failure as never) ?? 'generic';
      setError(
        ['DUPLICATE_EMAIL', 'FORBIDDEN_ROLE', 'FORBIDDEN_BRANCH', 'INVALID_STAFF'].includes(code)
          ? code
          : 'generic',
      );
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      size={460}
      title={member ? localized(member, 'name', locale) : t('staff.new')}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            type="primary"
            loading={createState.isLoading || updateState.isLoading}
            onClick={() => form.submit()}
          >
            {t('staff.save')}
          </Button>
        </Flex>
      }
    >
      {error && (
        <Alert
          type="warning"
          showIcon
          role="alert"
          style={{ marginBottom: 12 }}
          title={t(`staff.errors.${error as 'generic'}`)}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={toValues(member, me.all_branches ? [] : me.branch_ids)}
        onFinish={save}
      >
        <Form.Item
          name="name_ar"
          label={t('staff.fields.nameAr')}
          rules={[{ required: true, whitespace: true, message: t('staff.fields.required') }]}
        >
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item
          name="name_en"
          label={t('staff.fields.nameEn')}
          rules={[{ required: true, whitespace: true, message: t('staff.fields.required') }]}
        >
          <Input dir="ltr" />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('staff.fields.email')}
          rules={[{ required: true, type: 'email', message: t('staff.fields.emailInvalid') }]}
        >
          <Input dir="ltr" inputMode="email" />
        </Form.Item>
        <Form.Item name="role" label={t('staff.fields.role')}>
          <Select
            options={ROLES.filter((value) => isAdmin || !MANAGEMENT.has(value)).map((value) => ({
              value,
              label: tCommon(`roles.${value}`),
            }))}
          />
        </Form.Item>
        {(CLINICAL_ROLES as readonly string[]).includes(role) && (
          <Form.Item name="specialty" label={t('staff.fields.specialty')}>
            <Select
              allowClear
              options={SPECIALTIES.map((value) => ({
                value,
                label: tCommon(`specialties.${value}`),
              }))}
            />
          </Form.Item>
        )}
        {isAdmin && (
          <Form.Item
            name="all_branches"
            label={t('staff.fields.allBranches')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}
        {!allBranches && (
          <Form.Item
            name="branch_ids"
            label={t('staff.fields.branches')}
            rules={[
              {
                required: true,
                type: 'array',
                min: 1,
                message: t('staff.fields.branchesRequired'),
              },
            ]}
          >
            <Select
              mode="multiple"
              options={(branches.data ?? [])
                .filter((branch) => isAdmin || me.all_branches || me.branch_ids.includes(branch.id))
                .map((branch) => ({ value: branch.id, label: localized(branch, 'name', locale) }))}
            />
          </Form.Item>
        )}
        <Form.Item name="active" label={t('staff.fields.active')} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
