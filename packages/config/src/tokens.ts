/**
 * Design tokens بتوع Oxygen — المصدر الوحيد للألوان والخطوط والـradius.
 * الموقع بيحوّلها لـCSS variables (tokensToCss)، والداشبورد بيحطها في antd theme.
 * أي تغيير في الهوية بيتعمل هنا بس.
 */
export const tokens = {
  color: {
    primary: '#0E8C7F',
    onPrimary: '#FFFFFF',
    ink: '#0B2E2B',
    mutedText: '#5E7A76',
    mint: '#E6F4F1',
    background: '#F7FAF9',
    surface: '#FFFFFF',
    border: '#DCE8E5',
    coral: '#FF7A59',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#E5484D',
    info: '#3B82F6',
  },
  specialty: {
    nutrition: '#65A30D',
    physio: '#3B82F6',
    derm: '#E66A8D',
    internal: '#7C5CFC',
  },
  radius: 12,
  font: {
    arabic: 'IBM Plex Sans Arabic',
    latin: 'Inter',
  },
} as const;

export type Specialty = keyof typeof tokens.specialty;
