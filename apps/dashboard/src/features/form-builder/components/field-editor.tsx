import { Button, Checkbox, Flex, Form, Input, InputNumber, Typography } from 'antd';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TemplateField } from '@/features/encounters/types';

/**
 * تعديل حقل واحد: الاسم بالغتين · التلميح · إجباري · وإعدادات نوعه (نطاق · أقصى طول · اختيارات).
 * النوع ثابت بعد الإنشاء (تغييره بيغيّر شكل القيم المتخزنة). الجدول بنعدّل اسمه بس (DEC-59).
 */
export function FieldEditor({
  field,
  onChange,
}: {
  field: TemplateField;
  onChange: (next: TemplateField) => void;
}) {
  const { t } = useTranslation('formBuilder');
  const set = (patch: Partial<TemplateField>) => onChange({ ...field, ...patch } as TemplateField);

  return (
    <Form layout="vertical" component="div">
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        {t('editor.type', { type: t(`types.${field.type}`) })}
      </Typography.Text>
      <Form.Item label={t('editor.labelAr')} required>
        <Input
          aria-label={t('editor.labelAr')}
          value={field.label_ar}
          onChange={(event) => set({ label_ar: event.target.value })}
        />
      </Form.Item>
      <Form.Item label={t('editor.labelEn')} required>
        <Input
          aria-label={t('editor.labelEn')}
          dir="ltr"
          value={field.label_en}
          onChange={(event) => set({ label_en: event.target.value })}
        />
      </Form.Item>
      <Form.Item label={t('editor.hintAr')}>
        <Input
          aria-label={t('editor.hintAr')}
          value={field.hint_ar ?? ''}
          onChange={(event) => set({ hint_ar: event.target.value || undefined })}
        />
      </Form.Item>
      <Form.Item label={t('editor.hintEn')}>
        <Input
          aria-label={t('editor.hintEn')}
          dir="ltr"
          value={field.hint_en ?? ''}
          onChange={(event) => set({ hint_en: event.target.value || undefined })}
        />
      </Form.Item>
      <Form.Item>
        <Checkbox
          checked={!!field.required}
          onChange={(event) => set({ required: event.target.checked })}
        >
          {t('editor.required')}
        </Checkbox>
      </Form.Item>

      {(field.type === 'scale' || field.type === 'number') && (
        <Flex gap={12}>
          <Form.Item label={t('editor.min')}>
            <InputNumber
              aria-label={t('editor.min')}
              value={field.min}
              onChange={(value) => set({ min: value ?? undefined } as Partial<TemplateField>)}
            />
          </Form.Item>
          <Form.Item label={t('editor.max')}>
            <InputNumber
              aria-label={t('editor.max')}
              value={field.max}
              onChange={(value) => set({ max: value ?? undefined } as Partial<TemplateField>)}
            />
          </Form.Item>
        </Flex>
      )}
      {field.type === 'number' && (
        <Form.Item label={t('editor.unit')}>
          <Input
            aria-label={t('editor.unit')}
            dir="ltr"
            style={{ maxWidth: 120 }}
            value={field.unit ?? ''}
            onChange={(event) => set({ unit: event.target.value || undefined })}
          />
        </Form.Item>
      )}
      {field.type === 'textarea' && (
        <Form.Item label={t('editor.maxLength')}>
          <InputNumber
            aria-label={t('editor.maxLength')}
            min={50}
            max={5000}
            step={50}
            value={field.max_length}
            onChange={(value) =>
              value !== null && set({ max_length: value } as Partial<TemplateField>)
            }
          />
        </Form.Item>
      )}
      {(field.type === 'select' || field.type === 'multiselect') && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 8 }}>{t('editor.options')}</legend>
          {field.options.map((option, index) => (
            <Flex key={option.value} gap={8} style={{ marginBottom: 8 }} align="center">
              <Input
                aria-label={t('editor.optionAr', { n: index + 1 })}
                placeholder={t('editor.optionAr', { n: index + 1 })}
                value={option.label_ar}
                onChange={(event) =>
                  set({
                    options: field.options.map((entry) =>
                      entry.value === option.value
                        ? { ...entry, label_ar: event.target.value }
                        : entry,
                    ),
                  } as Partial<TemplateField>)
                }
              />
              <Input
                dir="ltr"
                aria-label={t('editor.optionEn', { n: index + 1 })}
                placeholder={t('editor.optionEn', { n: index + 1 })}
                value={option.label_en}
                onChange={(event) =>
                  set({
                    options: field.options.map((entry) =>
                      entry.value === option.value
                        ? { ...entry, label_en: event.target.value }
                        : entry,
                    ),
                  } as Partial<TemplateField>)
                }
              />
              <Button
                type="text"
                aria-label={t('editor.removeOption', { n: index + 1 })}
                icon={<X size={14} aria-hidden />}
                disabled={field.options.length === 1}
                onClick={() =>
                  set({
                    options: field.options.filter((entry) => entry.value !== option.value),
                  } as Partial<TemplateField>)
                }
              />
            </Flex>
          ))}
          <Button
            size="small"
            icon={<Plus size={14} aria-hidden />}
            onClick={() =>
              set({
                options: [
                  ...field.options,
                  { value: `opt_${crypto.randomUUID().slice(0, 8)}`, label_ar: '', label_en: '' },
                ],
              } as Partial<TemplateField>)
            }
          >
            {t('editor.addOption')}
          </Button>
        </fieldset>
      )}
      {field.type === 'grid' && (
        <Typography.Text type="secondary">{t('editor.gridNote')}</Typography.Text>
      )}
    </Form>
  );
}
