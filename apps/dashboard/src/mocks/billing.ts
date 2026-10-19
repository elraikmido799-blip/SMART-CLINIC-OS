import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import { invoiceTotals, discountPercentOf } from '@/features/billing/totals';
import type { CreateInvoiceBody, Invoice, Sellable } from '@/features/billing/types';
import { clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { SERVICES } from './clinic';
import { readDb, writeDb } from './db';

/**
 * الكاشير الوهمي (3.6): الخدمات + الباقات · أكواد الخصم · الفاتورة (والفلوس المتأخرة على المريض).
 * الأسعار وهمية لحد ما Oxygen يبعتوا الكتالوج الحقيقي (7.1).
 */
const PACKAGES: Sellable[] = [
  {
    id: 'pkg-phy-10',
    kind: 'package',
    name_ar: 'باقة 10 جلسات علاج طبيعي',
    name_en: '10 physio sessions',
    specialty: 'physio',
    price: 400000,
    sessions: 10,
  },
  {
    id: 'pkg-nut-month',
    kind: 'package',
    name_ar: 'متابعة تغذية شهر (4 زيارات)',
    name_en: 'Nutrition month (4 visits)',
    specialty: 'nutrition',
    price: 120000,
    sessions: 4,
  },
  {
    id: 'pkg-derm-laser-6',
    kind: 'package',
    name_ar: '6 جلسات ليزر',
    name_en: '6 laser sessions',
    specialty: 'derm',
    price: 750000,
    sessions: 6,
  },
];

const SELLABLES: Sellable[] = [
  ...SERVICES.map(({ id, name_ar, name_en, specialty, price }) => ({
    id,
    kind: 'service' as const,
    name_ar,
    name_en,
    specialty,
    price,
    sessions: null,
  })),
  ...PACKAGES,
];

// أكواد الخصم (7.2 هيعمل شاشتها). OXY10 نفس كود الموقع
const CODES: Record<string, number> = { OXY10: 10, SUMMER15: 15 };

const checkCode = (code: string) => {
  const percent = CODES[code.trim().toUpperCase()];
  if (!percent) throw new MockHttpError(422, 'INVALID_CODE');
  return { code: code.trim().toUpperCase(), percent };
};

export const billingHandlers: MockHandlers = {
  getSellables: () => ({ data: SELLABLES }),

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
      const item = SELLABLES.find((entry) => entry.id === line.item_id);
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
    const codePercent = input.code ? checkCode(input.code).percent : 0;
    const totals = invoiceTotals({
      subtotal,
      discount: input.discount,
      codePercent,
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
