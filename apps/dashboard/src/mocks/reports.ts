import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { LEAD_SOURCES } from '@/features/crm/types';
import type { Report, ReportCode } from '@/features/reports/types';
import { clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { sumKpi, allowedBranches, reached } from './analytics';
import { ensurePatients } from './clinic';
import { CAMPAIGNS, ensureLeads } from './crm';
import { readDb, writeDb } from './db';
import { ensureInvoiceHistory } from './invoices';
import { ensureRefunds } from './refunds';

/**
 * التقارير الوهمية (8.4): 5 تقارير جاهزة بفلتر فرع وفترة. الإيراد يوم بيوم من نفس أرقام الداشبورد،
 * والباقي من الداتا الفعلية (فواتير · عملاء · حملات · مرتجعات).
 */
const DAY = 86_400_000;
const LIMIT = 366;

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY);

export const reportHandlers: MockHandlers = {
  getReport: (args: FetchArgs) => {
    if (!toMe(currentStaff()).permissions.includes('reports.export'))
      throw new MockHttpError(403, 'FORBIDDEN');
    const code = (args.url ?? '').split('/').pop()?.split('?')[0] as ReportCode;
    const {
      branch_id = 'all',
      from = '',
      to = '',
    } = (args.params ?? {}) as Record<string, string | undefined>;
    if (!from || !to || to < from || daysBetween(from, to) > LIMIT)
      throw new MockHttpError(422, 'INVALID_RANGE');
    const branches = allowedBranches(branch_id);
    writeDb(ensurePatients);
    writeDb(ensureLeads);
    writeDb(ensureInvoiceHistory);
    writeDb(ensureRefunds);
    const db = readDb();
    const inRange = (iso: string) => iso.slice(0, 10) >= from && iso.slice(0, 10) <= to;

    switch (code) {
      case 'revenue_daily': {
        const today = clinicToday();
        const rows = Array.from({ length: daysBetween(from, to) + 1 }, (_, index) => {
          const date = new Date(Date.parse(`${from}T12:00:00Z`) + index * DAY)
            .toISOString()
            .slice(0, 10);
          const cash = sumKpi('revenue', branches, 1, Math.max(0, daysBetween(date, today)));
          return { date, cash, earned: Math.round(cash * 0.96) };
        });
        return {
          code,
          columns: [
            { key: 'date', type: 'date' },
            { key: 'cash', type: 'money' },
            { key: 'earned', type: 'money' },
          ],
          rows,
        } satisfies Report;
      }
      case 'invoices':
        return {
          code,
          columns: [
            { key: 'number', type: 'text' },
            { key: 'date', type: 'date' },
            { key: 'file_no', type: 'text' },
            { key: 'total', type: 'money' },
            { key: 'paid', type: 'money' },
          ],
          rows: db.invoices
            .filter((item) => branches.includes(item.branch_id) && inRange(item.created_at))
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((item) => ({
              number: item.number,
              date: item.created_at.slice(0, 10),
              file_no: item.patient.file_no,
              total: item.total,
              paid: item.paid,
            })),
        } satisfies Report;
      case 'lead_sources': {
        const leads = db.leads.filter(
          (lead) => branches.includes(lead.branch_id) && inRange(lead.created_at),
        );
        return {
          code,
          columns: [
            { key: 'source', type: 'text' },
            { key: 'leads', type: 'number' },
            { key: 'booked', type: 'number' },
            { key: 'paid', type: 'number' },
            { key: 'conversion', type: 'percent' },
          ],
          rows: LEAD_SOURCES.map((source) => {
            const own = leads.filter((lead) => lead.source === source);
            return {
              source,
              leads: own.length,
              booked: reached(own, 'booked'),
              paid: reached(own, 'paid'),
              conversion: own.length ? reached(own, 'paid') / own.length : 0,
            };
          }).filter((row) => row.leads > 0),
        } satisfies Report;
      }
      case 'campaigns': {
        const leads = db.leads.filter(
          (lead) => branches.includes(lead.branch_id) && inRange(lead.created_at),
        );
        return {
          code,
          columns: [
            { key: 'name', type: 'text' },
            { key: 'channel', type: 'text' },
            { key: 'budget', type: 'money' },
            { key: 'leads', type: 'number' },
            { key: 'booked', type: 'number' },
            { key: 'cost_per_lead', type: 'money' },
          ],
          rows: CAMPAIGNS.map((campaign) => {
            const own = leads.filter((lead) => lead.campaign?.id === campaign.id);
            return {
              name: campaign.name,
              channel: campaign.channel,
              budget: campaign.budget,
              leads: own.length,
              booked: reached(own, 'booked'),
              cost_per_lead: own.length ? Math.round(campaign.budget / own.length) : 0,
            };
          }),
        } satisfies Report;
      }
      case 'refunds':
        return {
          code,
          columns: [
            { key: 'invoice', type: 'text' },
            { key: 'date', type: 'date' },
            { key: 'amount', type: 'money' },
            { key: 'status', type: 'text' },
            { key: 'reason', type: 'text' },
          ],
          rows: db.refunds
            .filter((item) => branches.includes(item.branch_id) && inRange(item.requested_at))
            .map((item) => ({
              invoice: item.invoice_number,
              date: item.requested_at.slice(0, 10),
              amount: item.amount,
              status: item.status,
              reason: item.reason,
            })),
        } satisfies Report;
      default:
        throw new MockHttpError(404, 'NOT_FOUND');
    }
  },
};
