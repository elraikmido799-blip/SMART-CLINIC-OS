import type { ReactNode } from 'react';
import { Checkbox, Flex, Form, Input, InputNumber, Select, Slider, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import type { FormTemplate, TemplateColumn, TemplateField } from '../types';

type Named = { label_ar: string; label_en: string };
type Hinted = { hint_ar?: string; hint_en?: string };

// نص للقارئ بس (من غير ما يظهر)
const HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

const labelOf = (item: Named, locale: 'ar' | 'en') =>
  locale === 'ar' ? item.label_ar : item.label_en;
const hintOf = (item: Hinted, locale: 'ar' | 'en') =>
  locale === 'ar' ? item.hint_ar : item.hint_en;

// شريط الألم: الشريط والرقم جنب بعض (الرقم بيظهر "—" لحد ما الدكتور يختار)
function ScaleInput({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value?: number;
  onChange?: (value: number) => void;
  min: number;
  max: number;
  label: string;
}) {
  const marks = Object.fromEntries(
    Array.from({ length: max - min + 1 }, (_, index) => [min + index, String(min + index)]),
  );
  return (
    <Flex gap={16} align="center">
      <Slider
        ariaLabelForHandle={label}
        min={min}
        max={max}
        step={1}
        marks={marks}
        value={value ?? min}
        onChange={onChange}
        style={{ flex: 1, marginInline: 8 }}
      />
      <output
        aria-live="polite"
        style={{
          minWidth: 48,
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 600,
          padding: '6px 10px',
          border: `1px solid ${tokens.color.border}`,
          borderRadius: 12,
        }}
      >
        {value ?? '—'}
      </output>
    </Flex>
  );
}

// خانة جوه الجدول: رقم · اختيار · علامة صح
function Cell({
  name,
  column,
  rowLabel,
  locale,
}: {
  name: (string | number)[];
  column: TemplateColumn;
  rowLabel: string;
  locale: 'ar' | 'en';
}) {
  const label = `${rowLabel} — ${labelOf(column, locale)}`;
  if (column.type === 'check') {
    return (
      <Form.Item name={name} valuePropName="checked" noStyle>
        <Checkbox aria-label={label} />
      </Form.Item>
    );
  }
  if (column.type === 'select') {
    return (
      <Form.Item name={name} noStyle>
        <Select
          allowClear
          aria-label={label}
          style={{ minWidth: 96 }}
          options={column.options.map((option) => ({
            value: option.value,
            label: labelOf(option, locale),
          }))}
        />
      </Form.Item>
    );
  }
  return (
    <Form.Item name={name} noStyle>
      <InputNumber
        aria-label={label}
        min={column.min}
        max={column.max}
        style={{ width: 96 }}
        controls={false}
      />
    </Form.Item>
  );
}

function Grid({
  field,
  locale,
}: {
  field: Extract<TemplateField, { type: 'grid' }>;
  locale: 'ar' | 'en';
}) {
  const cell = { padding: '8px 12px', borderBottom: `1px solid ${tokens.color.border}` } as const;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th scope="col" style={{ ...cell, textAlign: 'start' }}>
            <span style={HIDDEN}>{labelOf(field, locale)}</span>
          </th>
          {field.columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              style={{
                ...cell,
                textAlign: 'start',
                fontWeight: 600,
                color: tokens.color.mutedText,
              }}
            >
              {labelOf(column, locale)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {field.rows.map((row) => (
          <tr key={row.key}>
            <th scope="row" style={{ ...cell, textAlign: 'start', fontWeight: 500 }}>
              {labelOf(row, locale)}
            </th>
            {field.columns.map((column) => (
              <td key={column.key} style={cell}>
                <Cell
                  name={[field.key, row.key, column.key]}
                  column={column}
                  rowLabel={labelOf(row, locale)}
                  locale={locale}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// الـControl نفسه (لازم يبقى الابن المباشر للـForm.Item عشان القيمة توصله)
function controlOf(field: TemplateField, locale: 'ar' | 'en'): ReactNode {
  switch (field.type) {
    case 'scale':
      return <ScaleInput min={field.min} max={field.max} label={labelOf(field, locale)} />;
    case 'number':
      return (
        <InputNumber min={field.min} max={field.max} suffix={field.unit} style={{ width: 160 }} />
      );
    case 'text':
      return <Input />;
    case 'textarea':
      return <Input.TextArea rows={5} maxLength={field.max_length} showCount />;
    case 'select':
      return (
        <Select
          allowClear
          style={{ maxWidth: 320 }}
          options={field.options.map((option) => ({
            value: option.value,
            label: labelOf(option, locale),
          }))}
        />
      );
    case 'multiselect':
      return (
        <Checkbox.Group
          options={field.options.map((option) => ({
            value: option.value,
            label: labelOf(option, locale),
          }))}
        />
      );
    case 'grid':
      return null;
  }
}

/**
 * بيرسم فورم الكشف من الـTemplate (JSON): كل قسم وحقوله حسب النوع. الإجباري بيتفعّل عند "وقّع واقفل" بس
 * (المسودة بتتحفظ ناقصة). الجدول ليه Form.Item لكل خانة: القيمة جوه `[حقل][صف][عمود]`.
 */
export function FormRenderer({ template }: { template: FormTemplate }) {
  const { t } = useTranslation('encounters');
  const locale = useLocale();

  return (
    <>
      {template.sections.map((section) => (
        <section key={section.id} style={{ marginBottom: 28 }}>
          <Typography.Title level={2} style={{ fontSize: 17, marginBottom: 12 }}>
            {localized(section, 'title', locale)}
          </Typography.Title>
          {section.fields.map((field) =>
            field.type === 'grid' ? (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <Typography.Text strong>{labelOf(field, locale)}</Typography.Text>
                <Grid field={field} locale={locale} />
              </div>
            ) : (
              <Form.Item
                key={field.key}
                name={field.key}
                label={labelOf(field, locale)}
                extra={hintOf(field, locale)}
                rules={
                  field.required
                    ? [
                        {
                          required: true,
                          message: t('form.required', { field: labelOf(field, locale) }),
                        },
                      ]
                    : undefined
                }
              >
                {controlOf(field, locale)}
              </Form.Item>
            ),
          )}
        </section>
      ))}
    </>
  );
}
