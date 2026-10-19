import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  Form,
  Input,
  Row,
  Tag,
  Typography,
} from 'antd';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { directionOf, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { FormRenderer } from '@/features/encounters/components/form-renderer';
import type { FormTemplate } from '@/features/encounters/types';
import { useCan } from '@/features/auth/use-me';
import { apiErrorCode } from '@/lib/api-error';
import {
  BUILDER_FIELD_TYPES,
  mapField,
  mapSection,
  move,
  newField,
  newSection,
  validateTemplate,
  type BuilderFieldType,
} from '../builder-state';
import {
  useGetFormTemplateQuery,
  usePublishFormTemplateMutation,
  useSaveFormDraftMutation,
} from '../form-builder.api';
import { FieldEditor } from './field-editor';

type Selected = string | null;

function Builder({
  code,
  initial,
  publishedVersion,
  hadDraft,
}: {
  code: string;
  initial: FormTemplate;
  publishedVersion: number;
  hadDraft: boolean;
}) {
  const { t } = useTranslation('formBuilder');
  const locale = useLocale();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const canPublish = useCan('builders.manage');
  const [template, setTemplate] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [pending, setPending] = useState(hadDraft);
  const [selected, setSelected] = useState<Selected>(null);
  const [save, saveState] = useSaveFormDraftMutation();
  const [publish, publishState] = usePublishFormTemplateMutation();
  const Back = directionOf(locale) === 'rtl' ? ArrowRight : ArrowLeft;

  const dirty = JSON.stringify(template) !== saved;
  const issues = validateTemplate(template);
  const field = template.sections
    .flatMap((section) => section.fields)
    .find((item) => item.key === selected);

  const saveDraft = async () => {
    try {
      await save({ code, template }).unwrap();
      setSaved(JSON.stringify(template));
      setPending(true);
      return true;
    } catch (error) {
      void message.error(
        apiErrorCode(error as never) === 'INVALID_TEMPLATE'
          ? t('errors.invalid')
          : t('errors.generic'),
      );
      return false;
    }
  };

  const onPublish = () => {
    if (issues.length) {
      void message.error(t('publish.blocked'));
      return;
    }
    modal.confirm({
      title: t('publish.confirmTitle', { version: publishedVersion + 1 }),
      content: t('publish.confirmBody'),
      okText: t('publish.ok'),
      cancelText: t('cancel'),
      onOk: async () => {
        if (dirty && !(await saveDraft())) return;
        try {
          await publish(code).unwrap();
          setPending(false);
          void message.success(t('publish.done', { version: publishedVersion + 1 }));
        } catch {
          void message.error(t('errors.generic'));
        }
      },
    });
  };

  const addField = (sectionId: string, type: BuilderFieldType) => {
    const created = newField(type);
    setTemplate((current) =>
      mapSection(current, sectionId, (section) => ({
        ...section,
        fields: [...section.fields, created],
      })),
    );
    setSelected(created.key);
  };

  const iconButton = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    disabled = false,
  ) => (
    <Button
      type="text"
      size="small"
      aria-label={label}
      icon={icon}
      disabled={disabled}
      onClick={onClick}
    />
  );

  return (
    <>
      <PageHeader
        title={localized(template, 'title', locale)}
        description={
          <Flex gap={8} align="center" wrap component="span">
            <Tag>{t('version', { version: publishedVersion })}</Tag>
            {(pending || dirty) && (
              <Tag color="orange">{dirty ? t('state.unsaved') : t('state.pending')}</Tag>
            )}
          </Flex>
        }
        extra={
          <>
            <Button
              icon={<Back size={16} aria-hidden />}
              onClick={() => void navigate({ to: '/clinical/forms' })}
            >
              {t('back')}
            </Button>
            <Button
              loading={saveState.isLoading}
              disabled={!dirty}
              onClick={() => void saveDraft().then((ok) => ok && message.success(t('saved')))}
            >
              {t('saveDraft')}
            </Button>
            {canPublish && (
              <Button
                type="primary"
                loading={publishState.isLoading}
                disabled={!pending && !dirty}
                onClick={onPublish}
              >
                {t('publish.button')}
              </Button>
            )}
          </>
        }
      />
      {issues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title={t('issues.title')}
          description={
            <ul style={{ margin: 0, paddingInlineStart: 18 }}>
              {issues.map((issue) => (
                <li key={issue}>{t(`issues.${issue}`)}</li>
              ))}
            </ul>
          }
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <Card title={t('structure.title')}>
            <Form layout="vertical" component="div">
              <Form.Item label={t('structure.titleAr')} required>
                <Input
                  aria-label={t('structure.titleAr')}
                  value={template.title_ar}
                  onChange={(event) => setTemplate({ ...template, title_ar: event.target.value })}
                />
              </Form.Item>
              <Form.Item label={t('structure.titleEn')} required>
                <Input
                  aria-label={t('structure.titleEn')}
                  dir="ltr"
                  value={template.title_en}
                  onChange={(event) => setTemplate({ ...template, title_en: event.target.value })}
                />
              </Form.Item>
            </Form>
            {template.sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                style={{
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Flex gap={8} wrap align="center">
                  <Input
                    aria-label={t('structure.sectionAr', { n: sectionIndex + 1 })}
                    placeholder={t('structure.sectionAr', { n: sectionIndex + 1 })}
                    value={section.title_ar}
                    onChange={(event) =>
                      setTemplate(
                        mapSection(template, section.id, (item) => ({
                          ...item,
                          title_ar: event.target.value,
                        })),
                      )
                    }
                    style={{ flex: '1 1 120px' }}
                  />
                  <Input
                    dir="ltr"
                    aria-label={t('structure.sectionEn', { n: sectionIndex + 1 })}
                    placeholder={t('structure.sectionEn', { n: sectionIndex + 1 })}
                    value={section.title_en}
                    onChange={(event) =>
                      setTemplate(
                        mapSection(template, section.id, (item) => ({
                          ...item,
                          title_en: event.target.value,
                        })),
                      )
                    }
                    style={{ flex: '1 1 120px' }}
                  />
                  {iconButton(
                    t('structure.sectionUp', { n: sectionIndex + 1 }),
                    <ArrowUp size={14} aria-hidden />,
                    () =>
                      setTemplate({
                        ...template,
                        sections: move(template.sections, sectionIndex, -1),
                      }),
                    sectionIndex === 0,
                  )}
                  {iconButton(
                    t('structure.sectionDown', { n: sectionIndex + 1 }),
                    <ArrowDown size={14} aria-hidden />,
                    () =>
                      setTemplate({
                        ...template,
                        sections: move(template.sections, sectionIndex, 1),
                      }),
                    sectionIndex === template.sections.length - 1,
                  )}
                  {iconButton(
                    t('structure.sectionRemove', { n: sectionIndex + 1 }),
                    <Trash2 size={14} aria-hidden />,
                    () =>
                      setTemplate({
                        ...template,
                        sections: template.sections.filter((item) => item.id !== section.id),
                      }),
                  )}
                </Flex>
                <ul style={{ listStyle: 'none', margin: '8px 0', padding: 0 }}>
                  {section.fields.map((item, fieldIndex) => (
                    <li key={item.key}>
                      <Flex
                        gap={4}
                        align="center"
                        style={{
                          background: selected === item.key ? tokens.color.mist : undefined,
                          borderRadius: 8,
                          paddingInlineStart: 4,
                        }}
                      >
                        <Button
                          type="text"
                          style={{ flex: 1, justifyContent: 'start' }}
                          aria-pressed={selected === item.key}
                          onClick={() => setSelected(item.key)}
                        >
                          <span style={{ fontWeight: 500 }}>
                            {localized(item, 'label', locale) || t('structure.unnamed')}
                          </span>
                          <Typography.Text type="secondary" style={{ marginInlineStart: 8 }}>
                            {t(`types.${item.type}`)}
                            {item.required ? ' *' : ''}
                          </Typography.Text>
                        </Button>
                        {iconButton(
                          t('structure.fieldUp', {
                            name: localized(item, 'label', locale) || t('structure.unnamed'),
                          }),
                          <ArrowUp size={14} aria-hidden />,
                          () =>
                            setTemplate(
                              mapSection(template, section.id, (s) => ({
                                ...s,
                                fields: move(s.fields, fieldIndex, -1),
                              })),
                            ),
                          fieldIndex === 0,
                        )}
                        {iconButton(
                          t('structure.fieldDown', {
                            name: localized(item, 'label', locale) || t('structure.unnamed'),
                          }),
                          <ArrowDown size={14} aria-hidden />,
                          () =>
                            setTemplate(
                              mapSection(template, section.id, (s) => ({
                                ...s,
                                fields: move(s.fields, fieldIndex, 1),
                              })),
                            ),
                          fieldIndex === section.fields.length - 1,
                        )}
                        {iconButton(
                          t('structure.fieldRemove', {
                            name: localized(item, 'label', locale) || t('structure.unnamed'),
                          }),
                          <Trash2 size={14} aria-hidden />,
                          () => {
                            setTemplate(
                              mapSection(template, section.id, (s) => ({
                                ...s,
                                fields: s.fields.filter((entry) => entry.key !== item.key),
                              })),
                            );
                            if (selected === item.key) setSelected(null);
                          },
                        )}
                      </Flex>
                    </li>
                  ))}
                </ul>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: BUILDER_FIELD_TYPES.map((type) => ({
                      key: type,
                      label: t(`types.${type}`),
                    })),
                    onClick: ({ key }) => addField(section.id, key as BuilderFieldType),
                  }}
                >
                  <Button size="small" icon={<Plus size={14} aria-hidden />}>
                    {t('structure.addField')}
                  </Button>
                </Dropdown>
              </div>
            ))}
            <Button
              icon={<Plus size={14} aria-hidden />}
              onClick={() =>
                setTemplate({ ...template, sections: [...template.sections, newSection()] })
              }
            >
              {t('structure.addSection')}
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={7}>
          <Card title={t('editor.title')}>
            {field ? (
              <FieldEditor
                field={field}
                onChange={(next) => setTemplate(mapField(template, field.key, () => next))}
              />
            ) : (
              <EmptyState title={t('editor.none')} />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Card title={t('preview.title')}>
            <Typography.Paragraph type="secondary">{t('preview.hint')}</Typography.Paragraph>
            <Form layout="vertical" requiredMark={false}>
              <FormRenderer template={template} />
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}

/** بنّاء الفورمات (D-17 · docs/20 · 4.9): هيكل الفورم · تعديل الحقل · معاينة حيّة · حفظ مسودة · نشر (نسخة جديدة) */
export function BuilderPage() {
  const { t } = useTranslation('formBuilder');
  const { code } = useParams({ from: '/_app/clinical/forms/$code' });
  const { data, isLoading, isError, error, refetch } = useGetFormTemplateQuery(code);

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    const status = !!error && 'status' in error ? error.status : null;
    return (
      <Card>
        {status === 403 ? (
          <EmptyState level={1} title={t('forbidden.title')} description={t('forbidden.body')} />
        ) : status === 404 ? (
          <EmptyState level={1} title={t('notFound.title')} description={t('notFound.body')} />
        ) : (
          <ErrorState level={1} onRetry={() => void refetch()} />
        )}
      </Card>
    );
  }
  // key = النسخة المنشورة: بعد النشر الفورم بيبدأ من النسخة الجديدة
  return (
    <Builder
      key={`${code}-${data.published.version}`}
      code={code}
      initial={data.draft ?? data.published}
      publishedVersion={data.published.version}
      hadDraft={data.draft !== null}
    />
  );
}
