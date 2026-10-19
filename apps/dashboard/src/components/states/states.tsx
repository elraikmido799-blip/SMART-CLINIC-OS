import type { CSSProperties, ReactNode } from 'react';
import { Button, Flex, Typography } from 'antd';
import { CloudOff, Lock, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { tokens } from '@oxygen/config';
import styles from './dots.module.css';

const DOTS = 10;
const { brandFrom, brandTo } = tokens.color;

/** التحميل: النقط بتتجمع وتعمل حلقة (بتقف ثابتة مع prefers-reduced-motion) */
export function DotsLoader({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={label ?? t('states.loading')} className={styles.ring}>
      {Array.from({ length: DOTS }, (_, i) => (
        <span
          key={i}
          className={styles.dot}
          style={
            {
              '--angle': `${(360 / DOTS) * i}deg`,
              '--delay': `${i * 0.12}s`,
              background: i % 2 ? brandTo : brandFrom,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

// نقط متفرقة لسه متجمعتش = مفيش داتا لسه
function ScatteredDots() {
  const dots = [
    [14, 30, 5, brandFrom],
    [34, 14, 3, brandTo],
    [52, 34, 6, brandTo],
    [72, 18, 4, brandFrom],
    [88, 38, 3, brandTo],
    [28, 48, 3, brandFrom],
    [64, 50, 4, brandFrom],
  ] as const;
  return (
    <svg width="104" height="64" viewBox="0 0 104 64" aria-hidden className={styles.scatter}>
      {dots.map(([cx, cy, r, fill]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} opacity={0.85} />
      ))}
    </svg>
  );
}

type StateBlockProps = {
  visual: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  // h2 جوه صفحة ليها عنوان · h1 لما الحالة هي الصفحة كلها (ممنوع/مش موجودة)
  level?: 1 | 2;
};

function StateBlock({ visual, title, description, action, level = 2 }: StateBlockProps) {
  return (
    <Flex vertical align="center" gap={12} style={{ padding: '48px 16px', textAlign: 'center' }}>
      {visual}
      <Typography.Title level={level} style={{ margin: 0, fontSize: 20 }}>
        {title}
      </Typography.Title>
      {description && (
        <Typography.Paragraph type="secondary" style={{ margin: 0, maxWidth: 420 }}>
          {description}
        </Typography.Paragraph>
      )}
      {action}
    </Flex>
  );
}

export function LoadingState() {
  return (
    <Flex justify="center" style={{ padding: '64px 16px' }}>
      <DotsLoader />
    </Flex>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <StateBlock
      visual={<ScatteredDots />}
      title={title ?? t('states.emptyTitle')}
      description={description}
      action={action}
    />
  );
}

const iconStyle = { color: tokens.color.mutedText };

/** خطأ في جلب الداتا. `offline` = مفيش نت (بيتعرف من navigator.onLine) */
export function ErrorState({ onRetry, level }: { onRetry?: () => void; level?: 1 | 2 }) {
  const { t } = useTranslation();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  const Icon = offline ? CloudOff : TriangleAlert;
  return (
    <StateBlock
      visual={<Icon size={40} strokeWidth={1.5} style={iconStyle} aria-hidden />}
      title={t('states.errorTitle')}
      description={offline ? t('states.networkBody') : t('states.errorBody')}
      action={onRetry && <Button onClick={onRetry}>{t('actions.retry')}</Button>}
      level={level}
    />
  );
}

export function ForbiddenState() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <StateBlock
      visual={<Lock size={40} strokeWidth={1.5} style={iconStyle} aria-hidden />}
      level={1}
      title={t('states.forbiddenTitle')}
      description={t('states.forbiddenBody')}
      action={<Button onClick={() => navigate({ to: '/' })}>{t('actions.goHome')}</Button>}
    />
  );
}

/** صفحة مش موجودة (بره الـLayout، فليها main و h1) */
export function NotFoundState() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Flex component="main" vertical justify="center" style={{ minHeight: '100dvh' }}>
      <StateBlock
        level={1}
        visual={<ScatteredDots />}
        title={t('states.notFoundTitle')}
        description={t('states.notFoundBody')}
        action={
          <Button type="primary" onClick={() => navigate({ to: '/' })}>
            {t('actions.goHome')}
          </Button>
        }
      />
    </Flex>
  );
}
