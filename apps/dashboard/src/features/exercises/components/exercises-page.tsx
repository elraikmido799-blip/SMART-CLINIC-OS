import { useState } from 'react';
import { App, Button, Card, Drawer, Flex, Form, Input, Select, Switch, Table } from 'antd';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { apiErrorCode } from '@/lib/api-error';
import { useDebounced } from '@/lib/use-debounced';
import {
  useCreateExerciseMutation,
  useGetExercisesQuery,
  useUpdateExerciseMutation,
} from '../exercises.api';
import { EXERCISE_REGIONS, type Exercise, type ExerciseBody, type ExerciseRegion } from '../types';

type FormValues = Omit<ExerciseBody, 'media_url'> & { media_url: string };

const EMPTY: FormValues = {
  name_ar: '',
  name_en: '',
  region: 'knee',
  instructions_ar: '',
  instructions_en: '',
  media_url: '',
  active: true,
};

/**
 * مكتبة التمارين (D-16 · docs/20 · 4.5): قايمة بالبحث وفلتر المنطقة · إضافة وتعديل (الاسم بالغتين،
 * التعليمات، رابط الفيديو أو الصورة) · إيقاف التمرين من غير ما يتمسح من الخطط القديمة.
 */
export function ExercisesPage() {
  const { t } = useTranslation('exercises');
  const locale = useLocale();
  const { message } = App.useApp();
  const canEdit = useCan('physio.write', 'medical.write', 'builders.manage');
  const [q, setQ] = useState('');
  const [region, setRegion] = useState<ExerciseRegion>();
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing] = useState<Exercise | 'new' | null>(null);
  const [form] = Form.useForm<FormValues>();
  const search = useDebounced(q.trim());
  const { data, isLoading, isError, refetch } = useGetExercisesQuery({
    q: search || undefined,
    region,
    include_inactive: showInactive,
  });
  const [create, createState] = useCreateExerciseMutation();
  const [update, updateState] = useUpdateExerciseMutation();

  const open = (target: Exercise | 'new') => {
    setEditing(target);
    form.setFieldsValue(
      target === 'new' ? EMPTY : { ...target, media_url: target.media_url ?? '' },
    );
  };

  const submit = async (values: FormValues) => {
    const body: ExerciseBody = { ...values, media_url: values.media_url.trim() || null };
    try {
      if (editing === 'new') await create(body).unwrap();
      else if (editing) await update({ id: editing.id, ...body }).unwrap();
      void message.success(t('saved'));
      setEditing(null);
    } catch (error) {
      const code = apiErrorCode(error as never);
      void message.error(code === 'INVALID_NAME' ? t('errors.INVALID_NAME') : t('errors.generic'));
    }
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        extra={
          canEdit ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => open('new')}
            >
              {t('new')}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
          <Input
            type="search"
            allowClear
            aria-label={t('search')}
            placeholder={t('search')}
            prefix={<Search size={16} color={tokens.color.mutedText} aria-hidden />}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            style={{ flex: '1 1 260px', maxWidth: 380 }}
          />
          <Select
            allowClear
            aria-label={t('region')}
            placeholder={t('region')}
            value={region}
            onChange={setRegion}
            options={EXERCISE_REGIONS.map((value) => ({ value, label: t(`regions.${value}`) }))}
            style={{ minWidth: 170 }}
          />
          <Flex gap={8} align="center">
            <Switch
              checked={showInactive}
              onChange={setShowInactive}
              aria-labelledby="inactive-label"
            />
            <span id="inactive-label">{t('showInactive')}</span>
          </Flex>
        </Flex>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <Table<Exercise>
            rowKey="id"
            dataSource={data}
            pagination={false}
            scroll={{ x: 640 }}
            locale={{ emptyText: <EmptyState title={t('none')} /> }}
            columns={[
              {
                title: t('columns.name'),
                render: (_, item) => (
                  <>
                    <div style={{ fontWeight: 600 }}>{localized(item, 'name', locale)}</div>
                    <div style={{ color: tokens.color.mutedText }}>
                      {locale === 'ar' ? item.name_en : item.name_ar}
                    </div>
                  </>
                ),
              },
              {
                title: t('columns.region'),
                render: (_, item) => (
                  <StatusTag tone="neutral">{t(`regions.${item.region}`)}</StatusTag>
                ),
              },
              {
                title: t('columns.instructions'),
                render: (_, item) => localized(item, 'instructions', locale),
              },
              {
                title: t('columns.status'),
                render: (_, item) => (
                  <StatusTag tone={item.active ? 'success' : 'neutral'}>
                    {item.active ? t('active') : t('inactive')}
                  </StatusTag>
                ),
              },
              ...(canEdit
                ? [
                    {
                      title: t('columns.actions'),
                      render: (_: unknown, item: Exercise) => (
                        <Button size="small" onClick={() => open(item)}>
                          {t('edit')}
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Card>
      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        afterOpenChange={(opened) => !opened && form.resetFields()}
        title={editing === 'new' ? t('new') : t('editTitle')}
        size={480}
        destroyOnHidden
        footer={
          <Flex justify="end" gap={8}>
            <Button onClick={() => setEditing(null)}>{t('cancel')}</Button>
            <Button
              type="primary"
              loading={createState.isLoading || updateState.isLoading}
              onClick={() => form.submit()}
            >
              {t('save')}
            </Button>
          </Flex>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={EMPTY}
          onFinish={submit}
          requiredMark={false}
        >
          <Form.Item
            name="name_ar"
            label={t('form.nameAr')}
            rules={[{ required: true, whitespace: true, message: t('form.nameRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name_en"
            label={t('form.nameEn')}
            rules={[{ required: true, whitespace: true, message: t('form.nameRequired') }]}
          >
            <Input dir="ltr" />
          </Form.Item>
          <Form.Item name="region" label={t('region')} rules={[{ required: true }]}>
            <Select
              options={EXERCISE_REGIONS.map((value) => ({ value, label: t(`regions.${value}`) }))}
            />
          </Form.Item>
          <Form.Item name="instructions_ar" label={t('form.instructionsAr')}>
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="instructions_en" label={t('form.instructionsEn')}>
            <Input.TextArea rows={3} maxLength={500} showCount dir="ltr" />
          </Form.Item>
          <Form.Item
            name="media_url"
            label={t('form.media')}
            extra={t('form.mediaHelp')}
            rules={[{ type: 'url', message: t('form.mediaInvalid') }]}
          >
            <Input dir="ltr" placeholder="https://" />
          </Form.Item>
          <Form.Item name="active" label={t('form.active')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
