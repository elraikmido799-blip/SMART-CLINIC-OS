/**
 * Design tokens بتوع Oxygen — المصدر الوحيد للألوان والخطوط والـradius.
 * الموقع بيحوّلها لـCSS variables (tokensToCss)، والداشبورد بيحطها في antd theme.
 * أي تغيير في الهوية بيتعمل هنا بس.
 * المرجع: design/website/A0-design-system-v2.png (DEC-23).
 */
export const tokens = {
  color: {
    // التدرّج بتاع اللوجو: للحاجات الكبيرة بس (الـHero، الحلقة، النقط)، ممنوع ورا نص صغير
    brandFrom: '#2EC4A6',
    brandTo: '#1769B0',
    primary: '#0A7672',
    onPrimary: '#FFFFFF',
    ink: '#0E2440',
    mutedText: '#4A5D73',
    mist: '#E3F6F2',
    background: '#FAF7F0',
    surface: '#FFFFFF',
    border: '#E6E1D6',
    fieldBorder: '#8291A0',
    // زرار الحجز الأساسي بس، والكلام عليه ink
    gold: '#F2A93B',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#E5484D',
    info: '#3B82F6',
  },
  specialty: {
    nutrition: '#4F7A28',
    physio: '#1769B0',
    derm: '#B8466A',
    internal: '#5B4BC4',
  },
  radius: 16,
  font: {
    arabic: 'IBM Plex Sans Arabic',
    latin: 'Inter',
  },
} as const;

export type Specialty = keyof typeof tokens.specialty;
