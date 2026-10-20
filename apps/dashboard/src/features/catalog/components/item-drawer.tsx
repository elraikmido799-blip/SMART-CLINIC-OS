import {
  App,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useGetBranchesQuery } from '@/features/branches/branches.api';
import { useCreateCatalogItemMutation, useUpdateCatalogItemMutation } from '../catalog.api';
import { CATALOG_KINDS, type CatalogItem, type CatalogKind } from '../types';

type Values = {
  kind: CatalogKind;
  name_ar: string;
  name_en: string;
  specialty: Specialty | null;
  duration_min: number | null;
  sessions: number | null;
  // بالجنيه في الشاشة، وبالقروش في الـAPI
  price: number;
  branch_prices: Record<string, number | null>;
  active: boolean;
};

const toValues = (item: CatalogItem | null, kind: CatalogKind): Values => ({
  kind: item?.kind ?? kind,
  name_ar: item?.name_ar ?? '',
  name_en: item?.name_en ?? '',
  specialty: item?.specialty ?? null,
  duration_min: item?.duration_min ?? (kind === 'service' ? 30 : null),
  sessions: item?.sessions ?? null,
  price: (item?.price ?? 0) / 100,
  branch_prices: Object.fromEntries(
    Object.entries(item?.branch_prices ?? {}).map(([id, price]) => [id, price / 100]),
  ),
  active: item?.active ?? true,
});

/**
 * إضافة أو تعديل عنصر في الكتالوج (D-24): الاسم بالعربي والإنجليزي · التخصص · المدة (للخدمة) أو عدد الجلسات (للباقة) ·
 * السعر الأساسي وسعر خاص لكل فرع (فاضي = نفس الأساسي) · مفعّل. للي عنده `catalog.write` بس.
 */
export function ItemDrawer({
  item,
  kind,
  open,
  onClose,
}: {
  // فاضي = عنصر جديد من نوع `kind`
  item: CatalogItem | null;
  kind: CatalogKind;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('catalog');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const branches = useGetBranchesQuery();
  const [create, createState] = useCreateCatalogItemMutation();
  const [update, updateState] = useUpdateCatalogItemMutation();
  const current = Form.useWatch('kind', form) ?? item?.kind ?? kind;

  const save = async (values: Values) => {
    const branch_prices = Object.fromEntries(
      Object.entries(values.branch_prices ?? {})
        .filter(([, price]) => price && price > 0)
        .map(([id, price]) => [id, Math.round((price as number) * 100)]),
    );
    const body = {
      kind: values.kind,
      name_ar: values.name_ar,
      name_en: values.name_en,
      specialty: values.specialty,
      duration_min: values.duration_min,
      sessions: values.sessions,
      price: Math.round(values.price * 100),
      branch_prices,
      active: values.active,
    };
    try {
      if (item) await update({ id: item.id, ...body }).unwrap();
      else await create(body).unwrap();
      void message.success(t(item ? 'drawer.saved' : 'drawer.created'));
      onClose();
    } catch {
      void message.error(t('errors.generic'));
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      size={460}
      title={item ? localized(item, 'name', locale) : t(`drawer.new.${kind}`)}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            type="primary"
            loading={createState.isLoading || updateState.isLoading}
            onClick={() => form.submit()}
          >
            {t('drawer.save')}
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={toValues(item, kind)}
        onFinish={save}
      >
        {!item && (
          <Form.Item name="kind" label={t('fields.kind')}>
            <Select
              options={CATALOG_KINDS.map((value) => ({ value, label: t(`kinds.${value}`) }))}
            />
          </Form.Item>
        )}
        <Form.Item
          name="name_ar"
          label={t('fields.nameAr')}
          rules={[{ required: true, whitespace: true, message: t('fields.nameRequired') }]}
        >
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item
          name="name_en"
          label={t('fields.nameEn')}
          rules={[{ required: true, whitespace: true, message: t('fields.nameRequired') }]}
        >
          <Input dir="ltr" />
        </Form.Item>
        <Form.Item name="specialty" label={t('fields.specialty')}>
          <Select
            allowClear
            placeholder={t('fields.noSpecialty')}
            options={SPECIALTIES.map((value) => ({
              value,
              label: tCommon(`specialties.${value}`),
            }))}
          />
        </Form.Item>
        {current === 'service' && (
          <Form.Item
            name="duration_min"
            label={t('fields.duration')}
            rules={[{ required: true, message: t('fields.durationRequired') }]}
          >
            <InputNumber
              min={5}
              max={480}
              step={5}
              suffix={t('fields.minutes')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
        {current === 'package' && (
          <Form.Item
            name="sessions"
            label={t('fields.sessions')}
            rules={[{ required: true, message: t('fields.sessionsRequired') }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item
          name="price"
          label={t('fields.price')}
          rules={[
            {
              validator: (_, value: number) =>
                value > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('fields.priceRequired'))),
            },
          ]}
        >
          <InputNumber min={0} step={10} suffix={t('fields.currency')} style={{ width: '100%' }} />
        </Form.Item>
        <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
          {t('fields.branchPrices')}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {t('fields.branchPricesHelp')}
        </Typography.Text>
        {(branches.data ?? []).map((branch) => (
          <Form.Item
            key={branch.id}
            name={['branch_prices', branch.id]}
            label={localized(branch, 'name', locale)}
          >
            <InputNumber
              min={0}
              step={10}
              suffix={t('fields.currency')}
              placeholder={t('fields.sameAsBase')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        ))}
        <Form.Item name="active" label={t('fields.active')} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
