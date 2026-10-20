import { useRef, useState } from 'react';
import { Alert, App, Button, Drawer, Flex, Form, Input, Switch, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { tokens } from '@oxygen/config';
import { useUpdateNotificationTemplateMutation } from '../settings.api';
import {
  TEMPLATE_VARIABLES,
  type NotificationTemplate,
  type TemplateVariable,
} from '../notification-types';

type Lang = 'ar' | 'en';

type Values = {
  subject_ar: string;
  subject_en: string;
  body_ar: string;
  body_en: string;
  active: boolean;
};

// أمثلة للمعاينة بنفس لغة القالب
const SAMPLE: Record<Lang, Record<TemplateVariable, string>> = {
  ar: {
    patient_name: 'سلمى أحمد',
    date: '25 أكتوبر',
    time: '4:30 م',
    doctor: 'د. عمر حسن',
    branch: 'التجمع الخامس',
    amount: '450 ج.م',
  },
  en: {
    patient_name: 'Salma Ahmed',
    date: '25 Oct',
    time: '4:30 PM',
    doctor: 'Dr. Omar Hassan',
    branch: 'New Cairo',
    amount: 'EGP 450',
  },
};

const preview = (text: string, lang: Lang) =>
  text.replace(
    /{{\s*(\w+)\s*}}/g,
    (match, name: string) => (SAMPLE[lang] as Record<string, string>)[name] ?? match,
  );

// حد الـSMS: رسالة واحدة 70 حرف عربي أو 160 إنجليزي
const SMS_LIMIT: Record<Lang, number> = { ar: 70, en: 160 };

/**
 * محرر قالب إشعار (D-34): النص بالعربي والإنجليزي، أزرار المتغيرات بتحط المتغير مكان المؤشر، ومعاينة بقيم مثال.
 * الـSMS بيحذّر لو النص أطول من رسالة. تعديل نص الواتساب بيرجع للمراجعة، وبيتقال قبل الحفظ.
 */
export function TemplateEditor({
  template,
  readOnly,
  onClose,
}: {
  template: NotificationTemplate | null;
  readOnly: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('settings');
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [update, { isLoading }] = useUpdateNotificationTemplateMutation();
  const [lang, setLang] = useState<Lang>('ar');
  const fields = useRef<Partial<Record<Lang, HTMLTextAreaElement | null>>>({});
  const bodies = {
    ar: Form.useWatch('body_ar', form) ?? '',
    en: Form.useWatch('body_en', form) ?? '',
  };

  const insert = (variable: TemplateVariable) => {
    const area = fields.current[lang];
    const field = `body_${lang}` as 'body_ar' | 'body_en';
    const current: string = form.getFieldValue(field) ?? '';
    const start = area?.selectionStart ?? current.length;
    const end = area?.selectionEnd ?? current.length;
    form.setFieldValue(field, `${current.slice(0, start)}{{${variable}}}${current.slice(end)}`);
  };

  const toValues = (item: NotificationTemplate): Values => ({
    subject_ar: item.subject_ar,
    subject_en: item.subject_en,
    body_ar: item.body_ar,
    body_en: item.body_en,
    active: item.active,
  });

  const save = async (values: Values) => {
    if (!template) return;
    try {
      await update({ id: template.id, ...values }).unwrap();
      void message.success(t('templates.saved'));
      onClose();
    } catch {
      void message.error(t('templates.invalid'));
    }
  };

  return (
    <Drawer
      open={template !== null}
      onClose={onClose}
      destroyOnHidden
      size={560}
      title={template ? t(`templates.events.${template.event}`) : ''}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onClose}>{t('cancel')}</Button>
          {!readOnly && (
            <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
              {t('templates.save')}
            </Button>
          )}
        </Flex>
      }
    >
      {template && (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          disabled={readOnly}
          initialValues={toValues(template)}
          onFinish={save}
        >
          {template.channel === 'whatsapp' && !readOnly && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              title={t('templates.whatsappNote')}
            />
          )}
          <Form.Item name="active" label={t('templates.active')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('templates.variables')}
          </Typography.Text>
          <Flex gap={6} wrap style={{ marginBottom: 12 }}>
            {TEMPLATE_VARIABLES.map((variable) => (
              <Tag
                key={variable}
                role="button"
                tabIndex={readOnly ? -1 : 0}
                onClick={() => !readOnly && insert(variable)}
                onKeyDown={(event) => {
                  if (!readOnly && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    insert(variable);
                  }
                }}
                style={{ cursor: readOnly ? 'default' : 'pointer', marginInlineEnd: 0 }}
              >
                {t(`templates.variable.${variable}`)}
              </Tag>
            ))}
          </Flex>
          {template.channel === 'email' && (
            <>
              <Form.Item name="subject_ar" label={t('templates.subjectAr')}>
                <Input dir="rtl" />
              </Form.Item>
              <Form.Item name="subject_en" label={t('templates.subjectEn')}>
                <Input dir="ltr" />
              </Form.Item>
            </>
          )}
          {(['ar', 'en'] as const).map((code) => (
            <Form.Item
              key={code}
              name={`body_${code}`}
              label={t(code === 'ar' ? 'templates.bodyAr' : 'templates.bodyEn')}
              rules={[{ required: true, whitespace: true, message: t('templates.required') }]}
              extra={
                template.channel === 'sms' && preview(bodies[code], code).length > SMS_LIMIT[code]
                  ? t('templates.smsLong', { limit: SMS_LIMIT[code] })
                  : undefined
              }
            >
              <Input.TextArea
                dir={code === 'ar' ? 'rtl' : 'ltr'}
                rows={4}
                ref={(node) => {
                  fields.current[code] = node?.resizableTextArea?.textArea ?? null;
                }}
                onFocus={() => setLang(code)}
              />
            </Form.Item>
          ))}
          <Typography.Text strong style={{ display: 'block', margin: '8px 0' }}>
            {t('templates.preview')}
          </Typography.Text>
          {(['ar', 'en'] as const).map((code) => (
            <div
              key={code}
              dir={code === 'ar' ? 'rtl' : 'ltr'}
              style={{
                background: tokens.color.mist,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
              }}
            >
              {preview(bodies[code], code) || '—'}
            </div>
          ))}
        </Form>
      )}
    </Drawer>
  );
}
