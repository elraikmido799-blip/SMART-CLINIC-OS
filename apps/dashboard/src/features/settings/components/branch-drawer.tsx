import { useEffect, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Switch,
  Tabs,
  TimePicker,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useUpdateBranchSettingsMutation } from '../branches.api';
import { WEEK_DAYS, type BranchSettings } from '../branch-types';

const FORMAT = 'HH:mm';

type Values = {
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone: string;
  map_url: string;
  active: boolean;
  hours: { day: number; closed: boolean; range: [dayjs.Dayjs, dayjs.Dayjs] }[];
  rooms: { id: string; name_ar: string; name_en: string; active: boolean }[];
};

const toValues = (branch: BranchSettings): Values => ({
  name_ar: branch.name_ar,
  name_en: branch.name_en,
  address_ar: branch.address_ar,
  address_en: branch.address_en,
  phone: branch.phone,
  map_url: branch.map_url,
  active: branch.active,
  hours: branch.hours.map((entry) => ({
    day: entry.day,
    closed: entry.closed,
    range: [dayjs(entry.open, FORMAT), dayjs(entry.close, FORMAT)],
  })),
  rooms: branch.rooms,
});

/**
 * إعدادات فرع (D-36): تابات: البيانات (اسم وعنوان وتليفون ولينك الخريطة) · مواعيد العمل (يوم يوم، أو مقفول) · الأوض
 * (إضافة وتسمية وقفل، من غير حذف). للأدمن تعديل (`settings.manage`)، وغيره بيشوف.
 */
export function BranchDrawer({
  branch,
  readOnly,
  onClose,
}: {
  branch: BranchSettings | null;
  readOnly: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('settings');
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [update, { isLoading }] = useUpdateBranchSettingsMutation();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (branch) form.setFieldsValue(toValues(branch));
  }, [branch, form]);

  const save = async () => {
    if (!branch) return;
    // getFieldsValue(true): كل القيم حتى اللي حقولها مستخبية (يوم مقفول مبيعرضش من/إلى)
    const values = form.getFieldsValue(true) as Values;
    setFailed(false);
    try {
      await update({
        id: branch.id,
        name_ar: values.name_ar,
        name_en: values.name_en,
        address_ar: values.address_ar ?? '',
        address_en: values.address_en ?? '',
        phone: values.phone ?? '',
        map_url: values.map_url ?? '',
        active: values.active,
        hours: values.hours.map((entry) => ({
          day: entry.day,
          closed: entry.closed,
          open: entry.range[0].format(FORMAT),
          close: entry.range[1].format(FORMAT),
        })),
        rooms: values.rooms,
      }).unwrap();
      void message.success(t('branches.saved'));
      onClose();
    } catch {
      setFailed(true);
    }
  };

  const required = [{ required: true, whitespace: true, message: t('branches.required') }];

  return (
    <Drawer
      open={branch !== null}
      onClose={onClose}
      destroyOnHidden
      size={560}
      title={branch ? localized(branch, 'name', locale) : ''}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onClose}>{t('cancel')}</Button>
          {!readOnly && (
            <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
              {t('branches.save')}
            </Button>
          )}
        </Flex>
      }
    >
      {branch && (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          disabled={readOnly}
          initialValues={toValues(branch)}
          onFinish={save}
        >
          {failed && (
            <Alert
              type="warning"
              showIcon
              role="alert"
              style={{ marginBottom: 12 }}
              title={t('branches.invalid')}
            />
          )}
          <Tabs
            items={[
              {
                key: 'info',
                label: t('branches.tabs.info'),
                forceRender: true,
                children: (
                  <>
                    <Form.Item name="name_ar" label={t('branches.nameAr')} rules={required}>
                      <Input dir="rtl" />
                    </Form.Item>
                    <Form.Item name="name_en" label={t('branches.nameEn')} rules={required}>
                      <Input dir="ltr" />
                    </Form.Item>
                    <Form.Item name="address_ar" label={t('branches.addressAr')}>
                      <Input dir="rtl" />
                    </Form.Item>
                    <Form.Item name="address_en" label={t('branches.addressEn')}>
                      <Input dir="ltr" />
                    </Form.Item>
                    <Form.Item name="phone" label={t('branches.phone')}>
                      <Input dir="ltr" inputMode="tel" />
                    </Form.Item>
                    <Form.Item
                      name="map_url"
                      label={t('branches.mapUrl')}
                      rules={[{ type: 'url', message: t('branches.urlInvalid') }]}
                    >
                      <Input dir="ltr" placeholder="https://" />
                    </Form.Item>
                    <Form.Item name="active" label={t('branches.active')} valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'hours',
                label: t('branches.tabs.hours'),
                forceRender: true,
                children: (
                  <Form.List name="hours">
                    {(fields) =>
                      fields.map((field) => (
                        <Flex
                          key={field.key}
                          align="center"
                          gap={12}
                          wrap
                          style={{ marginBottom: 12 }}
                        >
                          <Typography.Text strong style={{ width: 70 }}>
                            {t(`branches.days.${WEEK_DAYS[field.name]}`)}
                          </Typography.Text>
                          <Form.Item name={[field.name, 'closed']} valuePropName="checked" noStyle>
                            <Switch
                              checkedChildren={t('branches.closed')}
                              unCheckedChildren={t('branches.open')}
                            />
                          </Form.Item>
                          <Form.Item
                            noStyle
                            shouldUpdate={(previous, next) =>
                              previous.hours?.[field.name]?.closed !==
                              next.hours?.[field.name]?.closed
                            }
                          >
                            {({ getFieldValue }) =>
                              !getFieldValue(['hours', field.name, 'closed']) && (
                                <Form.Item name={[field.name, 'range']} noStyle>
                                  <TimePicker.RangePicker
                                    format={FORMAT}
                                    minuteStep={15}
                                    allowClear={false}
                                    aria-label={t(`branches.days.${WEEK_DAYS[field.name]}`)}
                                  />
                                </Form.Item>
                              )
                            }
                          </Form.Item>
                        </Flex>
                      ))
                    }
                  </Form.List>
                ),
              },
              {
                key: 'rooms',
                label: t('branches.tabs.rooms'),
                forceRender: true,
                children: (
                  <Form.List name="rooms">
                    {(fields, { add }) => (
                      <>
                        {fields.map((field) => (
                          <Flex
                            key={field.key}
                            gap={8}
                            align="start"
                            wrap
                            style={{ marginBottom: 8 }}
                          >
                            <Form.Item
                              name={[field.name, 'name_ar']}
                              rules={required}
                              style={{ flex: '1 1 140px', marginBottom: 0 }}
                            >
                              <Input
                                dir="rtl"
                                aria-label={t('branches.roomAr')}
                                placeholder={t('branches.roomAr')}
                              />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, 'name_en']}
                              rules={required}
                              style={{ flex: '1 1 140px', marginBottom: 0 }}
                            >
                              <Input
                                dir="ltr"
                                aria-label={t('branches.roomEn')}
                                placeholder={t('branches.roomEn')}
                              />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, 'active']}
                              valuePropName="checked"
                              style={{ marginBottom: 0 }}
                            >
                              <Switch
                                checkedChildren={t('branches.open')}
                                unCheckedChildren={t('branches.closed')}
                              />
                            </Form.Item>
                          </Flex>
                        ))}
                        {!readOnly && (
                          <Button
                            icon={<Plus size={14} aria-hidden />}
                            onClick={() =>
                              add({
                                id: `room-new-${crypto.randomUUID().slice(0, 6)}`,
                                name_ar: '',
                                name_en: '',
                                active: true,
                              })
                            }
                          >
                            {t('branches.addRoom')}
                          </Button>
                        )}
                      </>
                    )}
                  </Form.List>
                ),
              },
            ]}
          />
        </Form>
      )}
    </Drawer>
  );
}
