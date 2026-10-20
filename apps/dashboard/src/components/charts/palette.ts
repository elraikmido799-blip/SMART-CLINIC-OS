import { tokens } from '@oxygen/config';

/**
 * ألوان الرسومات (DEC-68): باليتة من 8 ألوان، كل لون تباينه على الأبيض 4.9 أو أكتر (اتفحصت بسكريبت).
 * الرسومات متعتمدش على اللون لوحده: كل سلسلة ليها اسم وقيمة مكتوبين (Legend أو Label).
 * بدايتها لون الهوية، ومفيهاش ألوان التخصصات (دي للتخصص بس) ولا الدهبي (ده للحجز).
 */
export const CHART_COLORS = [
  tokens.color.primary,
  '#1769B0',
  '#6D4AB5',
  '#B45309',
  '#4A5D73',
  '#9D2B6B',
  '#5F7A1F',
  '#8A5A2B',
] as const;

export const chartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

/** لون خط الشبكة والمحاور */
export const GRID = tokens.color.border;
