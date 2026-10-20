import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { DecideRefundBody, Refund, RequestRefundBody } from '@/features/billing/refunds-types';
import { currentStaff, toMe } from './auth';
import { ensureInvoiceHistory } from './invoices';
import { readDb, writeDb, type MockDb } from './db';

/**
 * المرتجعات الوهمية (7.4): 4 طلبات من تاريخ الفواتير (2 مستنيين · 1 اتوافق · 1 اترفض). الطلب (المستني أو الموافق عليه)
 * بيحجز المبلغ من المتاح للاسترجاع في الفاتورة.
 */
const staffName = () => {
  const staff = currentStaff();
  return { name_ar: staff.name_ar, name_en: staff.name_en };
};

const has = (permission: 'refunds.request' | 'refunds.approve') =>
  toMe(currentStaff()).permissions.includes(permission);

const HOUR = 3_600_000;

export function ensureRefunds(db: MockDb) {
  ensureInvoiceHistory(db);
  if (db.refunds.length > 0) return;
  const paidInvoices = db.invoices.filter((invoice) => invoice.paid > 0).slice(0, 4);
  const states = ['pending', 'pending', 'approved', 'rejected'] as const;
  const reasons = ['المريض ألغى الجلسات', 'سعر غلط في الفاتورة', 'خدمة متقدمتش', 'تحصيل مرتين'];
  db.refunds = paidInvoices.map((invoice, index): Refund => {
    const status = states[index];
    const decided = status !== 'pending';
    return {
      id: `ref-${index + 1}`,
      invoice_id: invoice.id,
      invoice_number: invoice.number,
      branch_id: invoice.branch_id,
      patient: {
        id: invoice.patient.id,
        name_ar: invoice.patient.name_ar,
        name_en: invoice.patient.name_en,
      },
      amount: Math.round(invoice.paid / 2),
      reason: reasons[index],
      status,
      requested_by: { name_ar: 'أحمد إبراهيم', name_en: 'Ahmed Ibrahim' },
      requested_at: new Date(Date.now() - (index + 1) * 5 * HOUR).toISOString(),
      decided_by: decided ? { name_ar: 'هالة فتحي', name_en: 'Hala Fathy' } : null,
      decided_at: decided ? new Date(Date.now() - index * HOUR).toISOString() : null,
      decision_note: status === 'rejected' ? 'الخدمة اتقدمت فعلًا' : null,
    };
  });
}

/** المتاح للاسترجاع من الفاتورة = المدفوع ناقص (الموافق عليه + المستني) */
export const refundableOf = (db: MockDb, invoiceId: string) => {
  const invoice = db.invoices.find((item) => item.id === invoiceId);
  if (!invoice) return 0;
  const taken = db.refunds
    .filter((refund) => refund.invoice_id === invoiceId && refund.status !== 'rejected')
    .reduce((sum, refund) => sum + refund.amount, 0);
  return invoice.paid - taken;
};

export const refundHandlers: MockHandlers = {
  getRefunds: (args: FetchArgs) => {
    if (!has('refunds.request') && !has('refunds.approve'))
      throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureRefunds);
    const { branch_id } = (args.params ?? {}) as { branch_id?: string };
    const staff = currentStaff();
    const data = readDb()
      .refunds.filter(
        (refund) =>
          (staff.all_branches || staff.branch_ids.includes(refund.branch_id)) &&
          (!branch_id || branch_id === 'all' || refund.branch_id === branch_id),
      )
      .sort((a, b) => b.requested_at.localeCompare(a.requested_at));
    return { data };
  },

  requestRefund: ({ body }) => {
    if (!has('refunds.request')) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as RequestRefundBody;
    if (!input.reason.trim()) throw new MockHttpError(422, 'REASON_REQUIRED');
    writeDb(ensureRefunds);
    let created: Refund | null = null;
    writeDb((db) => {
      const invoice = db.invoices.find((item) => item.id === input.invoice_id);
      if (!invoice) throw new MockHttpError(404, 'NOT_FOUND');
      if (input.amount <= 0 || input.amount > refundableOf(db, invoice.id))
        throw new MockHttpError(422, 'REFUND_TOO_HIGH');
      created = {
        id: `ref-${Date.now()}`,
        invoice_id: invoice.id,
        invoice_number: invoice.number,
        branch_id: invoice.branch_id,
        patient: {
          id: invoice.patient.id,
          name_ar: invoice.patient.name_ar,
          name_en: invoice.patient.name_en,
        },
        amount: input.amount,
        reason: input.reason.trim(),
        status: 'pending',
        requested_by: staffName(),
        requested_at: new Date().toISOString(),
        decided_by: null,
        decided_at: null,
        decision_note: null,
      };
      db.refunds.push(created);
    });
    return created!;
  },

  decideRefund: ({ url, body }) => {
    if (!has('refunds.approve')) throw new MockHttpError(403, 'FORBIDDEN');
    const input = body as Omit<DecideRefundBody, 'id'>;
    const id = url.split('/').at(-2) ?? '';
    if (!input.approve && !input.note.trim()) throw new MockHttpError(422, 'REASON_REQUIRED');
    writeDb(ensureRefunds);
    writeDb((db) => {
      const refund = db.refunds.find((item) => item.id === id);
      if (!refund) throw new MockHttpError(404, 'NOT_FOUND');
      if (refund.status !== 'pending') throw new MockHttpError(409, 'ALREADY_DECIDED');
      refund.status = input.approve ? 'approved' : 'rejected';
      refund.decided_by = staffName();
      refund.decided_at = new Date().toISOString();
      refund.decision_note = input.note.trim() || null;
    });
    return readDb().refunds.find((item) => item.id === id)!;
  },
};
