import { useEffect, type ReactNode } from 'react';
import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  // أزرار الصفحة (Primary واحد بس — DEC-41)
  extra?: ReactNode;
};

/** عنوان كل صفحة (h1 واحد) + عنوان التاب في المتصفح */
export function PageHeader({ title, description, extra }: PageHeaderProps) {
  const { t } = useTranslation();
  const appName = t('app.name');

  useEffect(() => {
    document.title = `${title} · ${appName}`;
  }, [title, appName]);

  return (
    <Flex justify="space-between" align="flex-start" gap={16} wrap style={{ marginBottom: 24 }}>
      <div>
        <Typography.Title level={1} style={{ margin: 0, fontSize: 28, lineHeight: 1.3 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            {description}
          </Typography.Text>
        )}
      </div>
      {extra && (
        <Flex gap={8} wrap>
          {extra}
        </Flex>
      )}
    </Flex>
  );
}
