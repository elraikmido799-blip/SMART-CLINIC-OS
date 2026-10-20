import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { LEAD_SOURCES, LEAD_STAGES, type Lead } from '@/features/crm/types';
import type { Executive, Kpi, KpiKey } from '@/features/dashboards/types';
import { clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { ensurePatients, seeded } from './clinic';
import { ensureLeads } from './crm';
import { readDb, writeDb } from './db';
import { BRANCHES } from './seed';

/**
 * أرقام الداشبوردات الوهمية (8.x): أرقام اليوم والإيراد بتتولّد من بذرة ثابتة لكل فرع (مش من الحجوزات الحقيقية)،
 * والفانل ومصادر العملاء بتتحسب من العملاء الموجودين فعلًا في الـCRM عشان الشاشات تتفق.
 * كل رقم "اليوم الواحد" متوسط للفرع الواحد، والفترة بتضربه في عدد الأيام بتفاوت يومي.
 */
const DAY = 86_400_000;

// حجم كل فرع (التجمع أكبرهم) وقاعدة أرقامه في اليوم
const WEIGHT: Record<string, number> = {
  'branch-new-cairo': 1.4,
  'branch-sheikh-zayed': 1.1,
  'branch-heliopolis': 1,
  'branch-tanta': 0.8,
  'branch-tala': 0.5,
};

const BASE_PER_DAY: Record<KpiKey, number> = {
  patients: 34,
  new_patients: 5,
  new_leads: 14,
  appointments: 40,
  no_shows: 2,
  revenue: 4_200_000,
  packages_sold: 3.6,
};

const dateOf = (offset: number) =>
  new Date(Date.parse(`${clinicToday()}T12:00:00Z`) - offset * DAY).toISOString().slice(0, 10);

// عامل يومي ثابت بين 0.7 و1.3 لكل (فرع، يوم)
const dayFactor = (branchId: string, date: string) => 0.7 + seeded(`${branchId}|${date}`)() * 0.6;

const branchIds = (branch: string) =>
  branch === 'all' ? BRANCHES.map((item) => item.id) : [branch];

/** مجموع رقم على مدى أيام، لفروع معيّنة. `from` = كام يوم لورا بتبدأ الفترة */
export function sumKpi(key: KpiKey, branches: string[], days: number, from: number): number {
  let total = 0;
  for (const branchId of branches) {
    for (let offset = from; offset < from + days; offset++) {
      total += BASE_PER_DAY[key] * (WEIGHT[branchId] ?? 1) * dayFactor(branchId, dateOf(offset));
    }
  }
  return Math.round(total);
}

export const KPI_ORDER: KpiKey[] = [
  'patients',
  'new_patients',
  'new_leads',
  'appointments',
  'no_shows',
  'revenue',
  'packages_sold',
];

export function kpisFor(branches: string[], days: number): Kpi[] {
  return KPI_ORDER.map((key) => ({
    key,
    value: sumKpi(key, branches, days, 0),
    previous: sumKpi(key, branches, days, days),
  }));
}

/** عملاء الـCRM حسب الفرع (المفتوحين) */
const leadsOf = (leads: Lead[], branches: string[]) =>
  leads.filter((lead) => branches.includes(lead.branch_id));

/** كام عميل وصل لمرحلة معيّنة أو أبعد منها */
export const reached = (leads: Lead[], stage: (typeof LEAD_STAGES)[number]) =>
  leads.filter((lead) => LEAD_STAGES.indexOf(lead.stage) >= LEAD_STAGES.indexOf(stage)).length;

export function funnelFor(leads: Lead[]) {
  return [
    { step: 'leads' as const, count: leads.length },
    { step: 'booked' as const, count: reached(leads, 'booked') },
    { step: 'visited' as const, count: reached(leads, 'visited') },
    { step: 'paid' as const, count: reached(leads, 'paid') },
  ];
}

export function sourcesFor(leads: Lead[]) {
  return LEAD_SOURCES.map((source) => ({
    source,
    count: leads.filter((lead) => lead.source === source).length,
  }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

export const permitted = (permission: 'dashboards.all' | 'dashboards.branch' | 'dashboards.own') =>
  toMe(currentStaff()).permissions.includes(permission);

export const allowedBranches = (branch: string): string[] => {
  const staff = currentStaff();
  const mine = staff.all_branches ? BRANCHES.map((item) => item.id) : staff.branch_ids;
  const wanted = branchIds(branch).filter((id) => mine.includes(id));
  if (wanted.length === 0) throw new MockHttpError(403, 'FORBIDDEN_BRANCH');
  return wanted;
};

export const analyticsHandlers: MockHandlers = {
  getExecutive: (args: FetchArgs) => {
    if (!permitted('dashboards.all') && !permitted('dashboards.branch'))
      throw new MockHttpError(403, 'FORBIDDEN');
    const { branch_id = 'all', days = '30' } = (args.params ?? {}) as Record<string, string>;
    const span = Number(days);
    const branches = allowedBranches(branch_id);
    writeDb(ensurePatients);
    writeDb(ensureLeads);
    const leads = leadsOf(readDb().leads, branches);

    const revenue_series = Array.from({ length: Math.max(span, 7) }, (_, index) => {
      const offset = Math.max(span, 7) - 1 - index;
      const cash = branches.reduce(
        (sum, id) => sum + BASE_PER_DAY.revenue * (WEIGHT[id] ?? 1) * dayFactor(id, dateOf(offset)),
        0,
      );
      // المكتسب أنعم من الكاش (الباقات بتتوزع على جلساتها)
      const earned = cash * (0.9 + seeded(`earned|${dateOf(offset)}`)() * 0.25);
      return { date: dateOf(offset), cash: Math.round(cash), earned: Math.round(earned) };
    });

    const perBranch = BRANCHES.filter((item) => branches.includes(item.id)).map((item) => {
      const own = leadsOf(readDb().leads, [item.id]);
      return {
        branch_id: item.id,
        revenue: sumKpi('revenue', [item.id], span, 0),
        patients: sumKpi('patients', [item.id], span, 0),
        conversion: own.length ? reached(own, 'paid') / own.length : 0,
      };
    });

    const result: Executive = {
      kpis: kpisFor(branches, span),
      revenue_series,
      branches: perBranch,
      funnel: funnelFor(leads),
      sources: sourcesFor(leads),
    };
    return result;
  },
};
