import type { ThemeConfig } from 'antd';
import { tokens } from '@oxygen/config';

// ألوان وخطوط Oxygen في antd، من نفس الـTokens اللي الموقع بيستخدمها
export const theme: ThemeConfig = {
  token: {
    colorPrimary: tokens.color.primary,
    colorSuccess: tokens.color.success,
    colorWarning: tokens.color.warning,
    colorError: tokens.color.danger,
    colorInfo: tokens.color.info,
    colorTextBase: tokens.color.ink,
    colorBgLayout: tokens.color.background,
    colorBorder: tokens.color.border,
    borderRadius: tokens.radius,
    // "Inter Variable" هو الاسم اللي @fontsource-variable/inter بيسجّله
    fontFamily: `"${tokens.font.latin} Variable", "${tokens.font.arabic}", system-ui, sans-serif`,
  },
};
