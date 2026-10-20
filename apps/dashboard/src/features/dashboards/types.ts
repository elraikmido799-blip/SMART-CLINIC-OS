import { z } from 'zod';
import { LEAD_SOURCES, LEAD_STAGES } from '@/features/crm/types';

export const DASHBOARD_PERIODS = [1, 7, 30] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const KPI_KEYS = [
  'patients',
  'new_patients',
  'new_leads',
  'appointments',
  'no_shows',
  'revenue',
  'packages_sold',
] as const;

export type KpiKey = (typeof KPI_KEYS)[number];

/**
 * رقم في الداشبورد (docs/05 §5). `value` للفترة و`previous` للفترة اللي قبلها بنفس الطول (للسهم).
 * الإيراد بالقروش (Cash = المدفوعات ناقص المرتجعات)، والباقي أعداد.
 */
export const kpiSchema = z.object({
  key: z.enum(KPI_KEYS),
  value: z.number(),
  previous: z.number(),
});

export type Kpi = z.infer<typeof kpiSchema>;

const kpisSchema = z.array(kpiSchema);

export const revenuePointSchema = z.object({
  date: z.string(),
  // الكاش: اللي اتحصّل في اليوم. المكتسب: قيمة اللي اتنفذ فعلًا (docs/05 §5)
  cash: z.number(),
  earned: z.number(),
});

export type RevenuePoint = z.infer<typeof revenuePointSchema>;

export const FUNNEL_STEPS = ['leads', 'booked', 'visited', 'paid'] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

/** داشبورد الـCEO (D-28): الأرقام · الإيراد يوم بيوم · مقارنة الفروع · الفانل · مصادر العملاء */
export const executiveSchema = z.object({
  kpis: kpisSchema,
  revenue_series: z.array(revenuePointSchema),
  branches: z.array(
    z.object({
      branch_id: z.string(),
      revenue: z.number(),
      patients: z.number(),
      // نسبة Lead ← Paid (0 لـ1)
      conversion: z.number(),
    }),
  ),
  funnel: z.array(z.object({ step: z.enum(FUNNEL_STEPS), count: z.number() })),
  sources: z.array(z.object({ source: z.enum(LEAD_SOURCES), count: z.number() })),
});

export type Executive = z.infer<typeof executiveSchema>;

export type ExecutiveQuery = { branch_id: string; days: DashboardPeriod };

const named = { name_ar: z.string(), name_en: z.string() };

/**
 * داشبورد الفرع (D-29): نفس أرقام الـCEO لفرع واحد + أداء الدكاترة (المواعيد المكتملة · نسبة الـNo-show · الإيراد المنسوب)
 * + استخدام الأوض (% من ساعات الشغل) + حالات المواعيد. docs/05 §5 "Staff performance".
 */
export const branchDashboardSchema = z.object({
  kpis: kpisSchema,
  revenue_series: z.array(revenuePointSchema),
  doctors: z.array(
    z.object({
      id: z.string(),
      ...named,
      specialty: z.string(),
      completed: z.number(),
      // 0 لـ1
      no_show_rate: z.number(),
      revenue: z.number(),
    }),
  ),
  rooms: z.array(z.object({ id: z.string(), ...named, utilization: z.number() })),
  statuses: z.array(
    z.object({
      status: z.enum(['completed', 'confirmed', 'cancelled', 'no_show']),
      count: z.number(),
    }),
  ),
});

export type BranchDashboard = z.infer<typeof branchDashboardSchema>;

/**
 * رحلة المريض (D-30): كام عميل وصل لكل مرحلة من الـ12 (أو أبعد منها)، ونسبة اللي وقفوا بين كل مرحلتين
 * (Journey drop-off)، والوقت النموذجي (الوسيط بالأيام) من المرحلة اللي قبلها.
 */
export const journeySchema = z.object({
  total: z.number(),
  stages: z.array(
    z.object({
      stage: z.enum(LEAD_STAGES),
      reached: z.number(),
      // الوسيط بالأيام من المرحلة اللي قبلها (فاضي للأولى)
      median_days: z.number().nullable(),
    }),
  ),
});

export type Journey = z.infer<typeof journeySchema>;

export type JourneyQuery = {
  branch_id: string;
  source?: string;
  // آخر كام يوم (0 = كل الوقت)
  days: number;
};
