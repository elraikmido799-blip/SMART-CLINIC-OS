import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import { invoiceTotals, discountPercentOf } from '@/features/billing/totals';
import type {
  CashClosing,
  CloseCashBody,
  CreateInvoiceBody,
  Invoice,
  MethodAmounts,
} from '@/features/billing/types';
import { clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { sellablesOf } from './catalog';
import { checkDiscountCodeOf, redeemCode } from './discount-codes';
import { readDb, writeDb } from './db';

/**
 * الكاشير الوهمي (3.6): الخدمات + الباقات · أكواد الخصم · الفاتورة (والفلوس المتأخرة على المريض).
 * الأسعار وهمية لحد ما Oxygen يبعتوا الكتالوج الحقيقي (7.1).
 */

// أكواد الخصم بتيجي من شاشة 7.2 (mocks/discount-codes.ts). OXY10 نفس كود الموقع
const checkCode = (code: string) => {
  const result = checkDiscountCodeOf(readDb(), code);
  if (!result) throw new MockHttpError(422, 'INVALID_CODE');
  return result;
};

const sumByMethod = (branchId: string, date: string): MethodAmounts => {
  const total: MethodAmounts = { cash: 0, card: 0, wallet: 0, instapay: 0 };
  for (const payment of readDb().payments) {
    if (payment.branch_id === branchId && payment.date === date)
      total[payment.method] += payment.amount;
  }
  return total;
};

const closingOf = (branchId: string, date: string): CashClosing => {
  const staff = currentStaff();
  if (!staff.all_branches && !staff.branch_ids.includes(branchId)) {
    throw new MockHttpError(403, 'FORBIDDEN_BRANCH');
  }
  const db = readDb();
  return (
    db.cash_closings.find((item) => item.branch_id === branchId && item.date === date) ?? {
      branch_id: branchId,
      date,
      invoices_count: db.invoices.filter(
        (item) => item.branch_id === branchId && item.created_at.startsWith(date),
      ).length,
      expected: sumByMethod(branchId, date),
      closing: null,
    }
  );
};

export const billingHandlers: MockHandlers = {
  getCashClosing: (args) => {
    const { branch_id, date } = (args.params ?? {}) as { branch_id?: string; date?: string };
    if (!branch_id || !date) throw new MockHttpError(400, 'DATE_REQUIRED');
    return closingOf(branch_id, date);
  },

  closeCash: ({ body }) => {
    const input = body as CloseCashBody;
    const staff = currentStaff();
    if (!toMe(staff).permissions.includes('billing.collect'))
      throw new MockHttpError(403, 'FORBIDDEN');
    const current = closingOf(input.branch_id, input.date);
    if (current.closing) throw new MockHttpError(409, 'ALREADY_CLOSED');
    const counted = input.counted;
    if (Object.values(counted).some((value) => value < 0)) {
      throw new MockHttpError(422, 'INVALID_AMOUNT');
    }
    const sum = (amounts: MethodAmounts) => Object.values(amounts).reduce((a, b) => a + b, 0);
    const difference = sum(counted) - sum(current.expected);
    const reason = input.reason?.trim() || null;
    if (difference !== 0 && !reason) throw new MockHttpError(422, 'REASON_REQUIRED');
    const closed: CashClosing = {
      ...current,
      closing: {
        counted,
        difference,
        reason,
        closed_by_name_ar: staff.name_ar,
        closed_by_name_en: staff.name_en,
        closed_at: new Date().toISOString(),
      },
    };
    writeDb((draft) => {
      draft.cash_closings.push(closed);
    });
    return closed;
  },

  getSellables: () => ({ data: sellablesOf(readDb()) }),

  checkDiscountCode: ({ body }) => checkCode((body as { code: string }).code),

  createInvoice: ({ body }) => {
    const input = body as CreateInvoiceBody;
    const staff = currentStaff();
    const me = toMe(staff);
    if (!me.permissions.includes('billing.collect')) throw new MockHttpError(403, 'FORBIDDEN');
    if (!staff.all_branches && !staff.branch_ids.includes(input.branch_id)) {
      throw new MockHttpError(403, 'FORBIDDEN_BRANCH');
    }

    const db = readDb();
    const patient = db.patients.find((item) => item.id === input.patient_id);
    if (!patient) throw new MockHttpError(404, 'NOT_FOUND');

    const lines = input.items.map((line) => {
      const item = sellablesOf(db).find((entry) => entry.id === line.item_id);
      if (!item || line.qty < 1) throw new MockHttpError(422, 'INVALID_ITEM');
      return {
        item_id: item.id,
        name_ar: item.name_ar,
        name_en: item.name_en,
        qty: line.qty,
        unit_price: item.price,
        total: item.price * line.qty,
      };
    });
    if (lines.length === 0 && !input.include_balance) throw new MockHttpError(422, 'EMPTY');

    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    if (input.discount && !me.permissions.includes('discounts.manual')) {
      throw new MockHttpError(403, 'FORBIDDEN');
    }
    if (discountPercentOf(subtotal, input.discount) > me.max_discount_percent + 0.001) {
      throw new MockHttpError(422, 'DISCOUNT_TOO_HIGH');
    }
    const code = input.code ? checkCode(input.code) : null;
    const codeBase = lines
      .filter((line) => {
        const kind = sellablesOf(db).find((entry) => entry.id === line.item_id)?.kind;
        return !code || code.applies_to === 'all' || code.applies_to === kind;
      })
      .reduce((sum, line) => sum + line.total, 0);
    const totals = invoiceTotals({
      subtotal,
      discount: input.discount,
      codePercent: code?.percent ?? 0,
      codeAmount: code?.amount ?? 0,
      codeBase,
      previousBalance: patient.balance_due,
      includeBalance: input.include_balance,
    });
    const paid = input.payment.amount;
    if (paid < 0 || paid > totals.total) throw new MockHttpError(422, 'INVALID_AMOUNT');

    const date = clinicToday();
    const sequence = db.invoices.filter((item) => item.created_at.startsWith(date)).length + 1;
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: `INV-${date.replace(/-/g, '')}-${String(sequence).padStart(3, '0')}`,
      branch_id: input.branch_id,
      created_at: new Date().toISOString(),
      cashier_name_ar: staff.name_ar,
      cashier_name_en: staff.name_en,
      patient: {
        id: patient.id,
        name_ar: patient.name_ar,
        name_en: patient.name_en,
        file_no: patient.file_no,
      },
      lines,
      previous_balance: input.include_balance ? patient.balance_due : 0,
      subtotal,
      discount: totals.discount,
      total: totals.total,
      paid,
      method: input.payment.method,
      // الرصيد القديم اللي متحصّلش + الباقي من الفاتورة دي
      balance_after: (input.include_balance ? 0 : patient.balance_due) + (totals.total - paid),
    };

    writeDb((draft) => {
      draft.invoices.push(invoice);
      if (code) redeemCode(draft, code.code);
      const stored = draft.patients.find((item) => item.id === patient.id)!;
      stored.balance_due = invoice.balance_after;
      if (input.appointment_id) {
        const appointment = draft.appointments.find((item) => item.id === input.appointment_id);
        if (appointment) appointment.invoice_id = invoice.id;
      }
      if (paid > 0) {
        draft.payments.push({
          id: `pay-${invoice.id}`,
          branch_id: input.branch_id,
          date,
          patient_id: patient.id,
          appointment_id: input.appointment_id,
          amount: paid,
          method: input.payment.method,
          invoice_id: invoice.id,
        });
      }
    });
    return invoice;
  },
};
