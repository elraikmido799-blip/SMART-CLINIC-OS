import type { ThemeConfig } from 'antd';
import { tokens } from '@oxygen/config';

const { color } = tokens;

/**
 * ثيم antd من tokens.ts بقواعد DEC-41: نسخة أهدى من الموقع، من غير دهبي، واللون للحالة بس.
 * المرجع: design/dashboard/D-02-reception.png (الـSidebar والـTop bar والكروت).
 */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: color.primary,
    colorSuccess: color.success,
    colorWarning: color.warning,
    colorError: color.danger,
    colorInfo: color.info,
    colorLink: color.primary,
    colorTextBase: color.ink,
    colorText: color.ink,
    colorTextSecondary: color.mutedText,
    colorTextTertiary: color.mutedText,
    // نص الـPlaceholder والـDisabled: contrast 4.5 على الأبيض (الافتراضي أفتح من كده)
    colorTextPlaceholder: color.mutedText,
    colorTextDescription: color.mutedText,
    colorBgLayout: color.background,
    colorBgContainer: color.surface,
    colorPrimaryBg: color.mist,
    // حدود الـInputs (contrast 3.2) · حدود الكروت والجداول والفواصل (Hairline)
    colorBorder: color.fieldBorder,
    colorBorderSecondary: color.border,
    colorSplit: color.border,
    borderRadius: 12,
    borderRadiusLG: tokens.radius,
    borderRadiusSM: 8,
    controlHeight: 40,
    controlHeightLG: 44,
    controlHeightSM: 32,
    fontSize: 14,
    // "Inter Variable" هو الاسم اللي @fontsource-variable/inter بيسجّله
    fontFamily: `"${tokens.font.latin} Variable", "${tokens.font.arabic}", system-ui, sans-serif`,
    // ظلال خفيفة جدًا
    boxShadow: '0 1px 2px rgba(14, 36, 64, 0.04), 0 4px 16px rgba(14, 36, 64, 0.06)',
    boxShadowSecondary: '0 4px 24px rgba(14, 36, 64, 0.1)',
    boxShadowTertiary: '0 1px 2px rgba(14, 36, 64, 0.04)',
    lineWidthFocus: 3,
  },
  components: {
    Layout: {
      siderBg: color.surface,
      headerBg: color.surface,
      bodyBg: color.background,
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: color.ink,
      itemHoverColor: color.primary,
      itemHoverBg: color.background,
      itemSelectedBg: color.mist,
      itemSelectedColor: color.primary,
      itemActiveBg: color.mist,
      itemHeight: 44,
      itemBorderRadius: 12,
      itemMarginInline: 12,
      iconSize: 18,
      collapsedIconSize: 20,
    },
    Table: {
      headerBg: color.surface,
      headerColor: color.mutedText,
      headerSplitColor: 'transparent',
      rowHoverBg: color.background,
      rowSelectedBg: color.mist,
      rowSelectedHoverBg: color.mist,
      cellPaddingBlock: 10,
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      fontWeight: 500,
    },
    Segmented: {
      itemSelectedBg: color.primary,
      itemSelectedColor: color.onPrimary,
      trackBg: color.background,
    },
    Tabs: {
      itemSelectedColor: color.primary,
      itemHoverColor: color.primary,
      inkBarColor: color.primary,
    },
    Card: {
      headerFontSize: 16,
    },
    Drawer: {
      colorBgElevated: color.surface,
    },
  },
};
