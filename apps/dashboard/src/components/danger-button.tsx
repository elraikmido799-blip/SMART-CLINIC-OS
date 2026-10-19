import { Button, type ButtonProps } from 'antd';
import { tokens } from '@oxygen/config';

/**
 * زرار الحاجات اللي مبترجعش (إلغاء ميعاد، حذف…): الكلام كحلي والحدود حمرا،
 * زي الموقع (DEC-36)، لأن الكلام الأحمر على الأبيض contrast بتاعه ضعيف.
 */
export function DangerButton({ style, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      style={{ color: tokens.color.ink, borderColor: tokens.color.danger, ...style }}
    />
  );
}
