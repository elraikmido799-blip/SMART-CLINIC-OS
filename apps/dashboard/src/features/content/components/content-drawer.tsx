import { useEffect } from 'react';
import { App, Button, DatePicker, Drawer, Flex, Form, Input, InputNumber, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SPECIALTIES, type Specialty } from '@oxygen/config';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useCreateContentMutation, useUpdateContentMutation } from '../content.api';
import type { ContentBody, ContentItem, ContentKind, ContentStatus } from '../types';

type Values = {
  specialty: Specialty | null;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  body_ar: string;
  body_en: string;
  video_url: string;
  // بالجنيه في الشاشة
  price_before: number | null;
  price_after: number | null;
  ends_on: Dayjs | null;
};

const toValues = (item: ContentItem | null): Values => ({
  specialty: item?.specialty ?? null,
  title_ar: item?.title_ar ?? '',
  title_en: item?.title_en ?? '',
  excerpt_ar: item?.excerpt_ar ?? '',
  excerpt_en: item?.excerpt_en ?? '',
  body_ar: item?.body_ar ?? '',
  body_en: item?.body_en ?? '',
  video_url: item?.video_url ?? '',
  price_before: item?.price_before ? item.price_before / 100 : null,
  price_after: item?.price_after ? item.price_after / 100 : null,
  ends_on: item?.ends_on ? dayjs(item.ends_on) : null,
});

/**
 * تحرير محتوى (D-33): كل الحقول بالعربي والإنجليزي جنب بعض. زرار "انشر" هو الـPrimary الوحيد، و"احفظ كمسودة"
 * Default (المسودة مبتظهرش في الموقع). المقال له ملخص ونص، والفيديو له رابط، والعرض له سعر قبل وبعد ونهاية.
 */
export function ContentDrawer({
  item,
  kind,
  open,
  onClose,
}: {
  // فاضي = عنصر جديد من نوع `kind`
  item: ContentItem | null;
  kind: ContentKind;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('content');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [create, createState] = useCreateContentMutation();
  const [update, updateState] = useUpdateContentMutation();
  useEffect(() => {
    if (open) form.setFieldsValue(toValues(item));
  }, [open, item, form]);

  const current = item?.kind ?? kind;

  const save = async (status: ContentStatus) => {
    let values: Values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const body: ContentBody = {
      kind: current,
      status,
      specialty: values.specialty,
      title_ar: values.title_ar,
      title_en: values.title_en,
      excerpt_ar: values.excerpt_ar ?? '',
      excerpt_en: values.excerpt_en ?? '',
      body_ar: values.body_ar ?? '',
      body_en: values.body_en ?? '',
      cover_url: item?.cover_url ?? null,
      video_url: current === 'video' ? values.video_url || null : null,
      price_before:
        current === 'offer' && values.price_before ? Math.round(values.price_before * 100) : null,
      price_after:
        current === 'offer' && values.price_after ? Math.round(values.price_after * 100) : null,
      ends_on: current === 'offer' && values.ends_on ? values.ends_on.format('YYYY-MM-DD') : null,
    };
    try {
      if (item) await update({ id: item.id, ...body }).unwrap();
      else await create(body).unwrap();
      void message.success(t(status === 'published' ? 'drawer.published' : 'drawer.savedDraft'));
      onClose();
    } catch {
      void message.error(t('errors.generic'));
    }
  };

  const required = [{ required: true, whitespace: true, message: t('fields.required') }];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      size={560}
      title={item ? localized(item, 'title', locale) : t(`drawer.new.${kind}`)}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            loading={createState.isLoading || updateState.isLoading}
            onClick={() => void save('draft')}
          >
            {t('drawer.saveDraft')}
          </Button>
          <Button
            type="primary"
            loading={createState.isLoading || updateState.isLoading}
            onClick={() => void save('published')}
          >
            {t('drawer.publish')}
          </Button>
        </Flex>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false} initialValues={toValues(item)}>
        <Form.Item name="specialty" label={t('fields.specialty')}>
          <Select
            allowClear
            placeholder={t('fields.general')}
            options={SPECIALTIES.map((value) => ({
              value,
              label: tCommon(`specialties.${value}`),
            }))}
          />
        </Form.Item>
        <Form.Item name="title_ar" label={t('fields.titleAr')} rules={required}>
          <Input dir="rtl" maxLength={140} />
        </Form.Item>
        <Form.Item name="title_en" label={t('fields.titleEn')} rules={required}>
          <Input dir="ltr" maxLength={140} />
        </Form.Item>
        {current !== 'video' && (
          <>
            <Form.Item name="excerpt_ar" label={t('fields.excerptAr')}>
              <Input.TextArea dir="rtl" rows={2} maxLength={240} showCount />
            </Form.Item>
            <Form.Item name="excerpt_en" label={t('fields.excerptEn')}>
              <Input.TextArea dir="ltr" rows={2} maxLength={240} showCount />
            </Form.Item>
          </>
        )}
        {current === 'article' && (
          <>
            <Form.Item name="body_ar" label={t('fields.bodyAr')}>
              <Input.TextArea dir="rtl" rows={6} />
            </Form.Item>
            <Form.Item name="body_en" label={t('fields.bodyEn')}>
              <Input.TextArea dir="ltr" rows={6} />
            </Form.Item>
          </>
        )}
        {current === 'video' && (
          <Form.Item
            name="video_url"
            label={t('fields.videoUrl')}
            rules={[{ required: true, type: 'url', message: t('fields.urlInvalid') }]}
          >
            <Input dir="ltr" placeholder="https://" />
          </Form.Item>
        )}
        {current === 'offer' && (
          <>
            <Form.Item name="price_before" label={t('fields.priceBefore')}>
              <InputNumber min={0} suffix={t('fields.currency')} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="price_after"
              label={t('fields.priceAfter')}
              rules={[{ required: true, message: t('fields.required') }]}
            >
              <InputNumber min={1} suffix={t('fields.currency')} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="ends_on"
              label={t('fields.endsOn')}
              rules={[{ required: true, message: t('fields.required') }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
}
