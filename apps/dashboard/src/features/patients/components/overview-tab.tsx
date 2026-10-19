import type { ReactNode } from 'react';
import { Card, Col, Flex, Row, Steps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber, formatSlot, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { SpecialtyIcon } from '@/components/specialty-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { STATUS_TONE } from '@/features/appointments/status';
import { useCan } from '@/features/auth/use-me';
import type { PatientOverview } from '../overview';
import { WeightChart } from './weight-chart';

// قايمة بسيطة (List بتاع antd deprecated)
function ItemList<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((item, index) => (
        <li key={index} style={{ borderBlockEnd: '1px solid var(--ant-color-split)' }}>
          {render(item)}
        </li>
      ))}
    </ul>
  );
}

function ListItem({ extra, children }: { extra?: ReactNode; children: ReactNode }) {
  return (
    <Flex justify="space-between" align="flex-start" gap={12} style={{ paddingBlock: 12 }}>
      <div style={{ flex: 1 }}>{children}</div>
      {extra}
    </Flex>
  );
}

function ItemMeta({
  avatar,
  title,
  description,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <Flex gap={12} align="flex-start">
      {avatar}
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ color: 'var(--ant-color-text-secondary)' }}>{description}</div>
      </div>
    </Flex>
  );
}

function OverviewCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title} style={{ height: '100%' }}>
      {children}
    </Card>
  );
}

/**
 * تاب الـOverview (D-09): الوزن · آخر علامات حيوية · الخطط · المواعيد الجاية · آخر الملفات · رحلة المريض.
 * الكروت الطبية بتستخبى من غير `medical.read` (والـAPI بيرجعها فاضية أصلًا — DEC-52).
 */
export function OverviewTab({
  overview,
  isLoading,
  isError,
  onRetry,
}: {
  overview: PatientOverview | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation('patients');
  const { t: tAppointments } = useTranslation('appointments');
  const locale = useLocale();
  const canMedical = useCan('medical.read');

  if (isLoading) return <LoadingState />;
  if (isError || !overview) return <ErrorState onRetry={onRetry} />;

  const { weight, vitals, plans, upcoming, documents, journey, next_step } = overview;
  const reached = journey.filter((item) => item.date).length;

  return (
    <Row gutter={[16, 16]}>
      {canMedical && (
        <Col xs={24} xl={16}>
          <OverviewCard title={t('overview.weight')}>
            {weight.length > 1 ? (
              <WeightChart points={weight} />
            ) : (
              <EmptyState title={t('overview.noWeight')} />
            )}
          </OverviewCard>
        </Col>
      )}
      {canMedical && (
        <Col xs={24} md={12} xl={8}>
          <OverviewCard title={t('overview.vitals')}>
            {vitals ? (
              <>
                <Row gutter={[12, 16]}>
                  {(
                    [
                      ['bloodPressure', `${vitals.systolic}/${vitals.diastolic}`],
                      ['heartRate', formatNumber(vitals.heart_rate, locale)],
                      ['bmi', formatNumber(vitals.bmi, locale)],
                    ] as const
                  ).map(([key, value]) => (
                    <Col span={12} key={key}>
                      <Typography.Text type="secondary">{t(`overview.${key}`)}</Typography.Text>
                      <div dir="ltr" style={{ fontSize: 22, fontWeight: 600, textAlign: 'start' }}>
                        {value}
                      </div>
                    </Col>
                  ))}
                </Row>
                <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                  {t('overview.measuredAt', {
                    date: formatDate(vitals.measured_at.slice(0, 10), locale),
                  })}
                </Typography.Text>
              </>
            ) : (
              <EmptyState title={t('overview.noVitals')} />
            )}
          </OverviewCard>
        </Col>
      )}
      {canMedical && (
        <Col xs={24} md={12} xl={8}>
          <OverviewCard title={t('overview.plans')}>
            {plans.length ? (
              <ItemList
                items={plans}
                render={(plan) => (
                  <ListItem key={plan.id}>
                    <ItemMeta
                      avatar={<SpecialtyIcon specialty={plan.specialty} />}
                      title={localized(plan, 'name', locale)}
                      description={
                        <>
                          {formatDate(plan.starts_on, locale)} – {formatDate(plan.ends_on, locale)}
                          {plan.home_exercises && <div>{t('overview.homeExercises')}</div>}
                        </>
                      }
                    />
                  </ListItem>
                )}
              />
            ) : (
              <EmptyState title={t('overview.noPlans')} />
            )}
          </OverviewCard>
        </Col>
      )}
      <Col xs={24} md={12} xl={8}>
        <OverviewCard title={t('overview.upcoming')}>
          {upcoming.length ? (
            <ItemList
              items={upcoming}
              render={(item) => {
                const slot = formatSlot(item.starts_at, locale);
                return (
                  <ListItem key={item.id} extra={<SpecialtyTag specialty={item.specialty} />}>
                    <ItemMeta
                      title={`${slot.day} · ${slot.time}`}
                      description={
                        <Flex gap={8} wrap align="center">
                          <span>
                            {locale === 'ar' ? item.service_name_ar : item.service_name_en} ·{' '}
                            {locale === 'ar'
                              ? item.practitioner_name_ar
                              : item.practitioner_name_en}
                          </span>
                          <StatusTag tone={STATUS_TONE[item.status]}>
                            {tAppointments(`status.${item.status}`)}
                          </StatusTag>
                        </Flex>
                      }
                    />
                  </ListItem>
                );
              }}
            />
          ) : (
            <EmptyState title={t('overview.noUpcoming')} />
          )}
        </OverviewCard>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <OverviewCard title={t('overview.documents')}>
          {documents.length ? (
            <ItemList
              items={documents}
              render={(doc) => (
                <ListItem key={doc.id}>
                  <ItemMeta
                    title={doc.title}
                    description={`${t(`overview.categories.${doc.category}`)} · ${formatDate(doc.date, locale)}`}
                  />
                </ListItem>
              )}
            />
          ) : (
            <EmptyState title={t('overview.noDocuments')} />
          )}
        </OverviewCard>
      </Col>
      <Col xs={24}>
        <OverviewCard title={t('overview.journey')}>
          <Steps
            size="small"
            current={Math.max(0, reached - 1)}
            responsive
            items={journey.map((item) => ({
              title: t(`overview.steps.${item.step}`),
              content: item.date ? formatDate(item.date, locale) : undefined,
              status: item.date ? 'finish' : 'wait',
            }))}
          />
          {next_step && (
            <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
              <Typography.Text strong>{t('overview.nextStep')}: </Typography.Text>
              {localized(next_step, 'name', locale)}
            </Typography.Paragraph>
          )}
        </OverviewCard>
      </Col>
    </Row>
  );
}
