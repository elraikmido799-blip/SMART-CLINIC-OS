import { Button, Flex, FloatButton, Popover, Segmented, Select, Typography } from 'antd';
import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { MOCK_SCENARIOS, readDb, resetDb, writeDb, type MockScenario } from './db';
import { STAFF } from './seed';

/**
 * أدوات التجربة (وضع الـMocks بس — DEC-42): تدخل بأي دور، وتجرّب حالات الـAPI (فاضي · خطأ · بطيء).
 * أداة للمطوّر، فالنصوص هنا مش في ملفات الترجمة، وبتتمسح مع فولدر mocks كله.
 */
const TEXT = {
  ar: {
    title: 'أدوات التجربة',
    user: 'ادخل كـ',
    scenario: 'حالة الـAPI',
    scenarios: { ok: 'عادي', empty: 'فاضي', error: 'خطأ', slow: 'بطيء' },
    reset: 'امسح داتا التجربة',
  },
  en: {
    title: 'Test tools',
    user: 'Sign in as',
    scenario: 'API state',
    scenarios: { ok: 'Normal', empty: 'Empty', error: 'Error', slow: 'Slow' },
    reset: 'Reset test data',
  },
} satisfies Record<string, { scenarios: Record<MockScenario, string> } & Record<string, unknown>>;

export default function MockTools() {
  const { t } = useTranslation();
  const locale = useLocale();
  const text = TEXT[locale];
  const db = readDb();

  // تحميل الصفحة من جديد = كل الداتا بتتجاب تاني بالدور أو الحالة الجديدة
  const switchUser = (staffId: string) => {
    writeDb((draft) => {
      draft.session = { staff_id: staffId };
    });
    window.location.assign('/');
  };

  const setScenario = (scenario: MockScenario) => {
    writeDb((draft) => {
      draft.scenario = scenario;
    });
    window.location.reload();
  };

  const reset = () => {
    resetDb();
    window.location.assign('/login');
  };

  return (
    <Popover
      trigger="click"
      placement="topLeft"
      title={text.title}
      content={
        <Flex vertical gap={16} style={{ width: 300 }}>
          <Flex vertical gap={6}>
            <Typography.Text strong>{text.user}</Typography.Text>
            <Select
              aria-label={text.user}
              value={db.session?.staff_id}
              onChange={switchUser}
              options={STAFF.map((staff) => ({
                value: staff.id,
                label: `${localized(staff, 'name', locale)} · ${t(`roles.${staff.role}`)}`,
              }))}
            />
          </Flex>
          <Flex vertical gap={6}>
            <Typography.Text strong>{text.scenario}</Typography.Text>
            <Segmented
              block
              value={db.scenario}
              onChange={setScenario}
              options={MOCK_SCENARIOS.map((scenario) => ({
                value: scenario,
                label: text.scenarios[scenario],
              }))}
            />
          </Flex>
          <Button onClick={reset}>{text.reset}</Button>
        </Flex>
      }
    >
      <FloatButton
        aria-label={text.title}
        icon={<FlaskConical size={18} aria-hidden />}
        style={{ insetInlineStart: 24, insetInlineEnd: 'auto' }}
      />
    </Popover>
  );
}
