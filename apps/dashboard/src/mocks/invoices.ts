import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { invoiceStatusOf, type Invoice, type PaymentMethod } from '@/features/billing/types';
import { currentStaff, toMe } from './auth';
import { ensurePatients, pick, seeded } from './clinic';
import { sellablesOf } from './catalog';
import { readDb, writeDb, type MockDb } from './db';

/**
 * تاريخ الفواتير الوهمي (7.3): 48 فاتورة في آخر 30 يوم بتتولّد مرة واحدة، والفواتير الجديدة من الكاشير بتتضاف عليها.
 * مبتتحسبش في الخزنة (الخزنة بتقرا المدفوعات الحقيقية لليوم).
 */
const DAY = 86_400_000;
const METHODS: readonly PaymentMethod[] = ['cash', 'cash', 'card', 'wallet', 'instapay'];

export function ensureInvoiceHistory(db: MockDb) {
  if (db.generated_days.includes('invoice-history')) return;
  ensurePatients(db);
  const random = seeded('oxygen-invoice-history');
  const sellables = sellablesOf(db);
  const history: Invoice[] = [];
  for (let index = 0; index < 48; index++) {
    const patient = pick(random, db.patients);
    const lines = Array.from({ length: 1 + Math.floor(random() * 2) }, () => {
      const item = pick(random, sellables);
      const qty = item.kind === 'service' ? 1 + Math.floor(random() * 2) : 1;
      return {
        item_id: item.id,
        name_ar: item.name_ar,
        name_en: item.name_en,
        qty,
        unit_price: item.price,
        total: item.price * qty,
      };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const discount = random() < 0.25 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    const state = random();
    const paid = state < 0.75 ? total : state < 0.92 ? Math.round(total / 2) : 0;
    const created = new Date(Date.now() - (1 + Math.floor(random() * 29)) * DAY - random() * DAY);
    const date = created.toISOString().slice(0, 10);
    history.push({
      id: `inv-h${index + 1}`,
      number: `INV-${date.replace(/-/g, '')}-${String(900 + index)}`,
      branch_id: patient.branch_id,
      created_at: created.toISOString(),
      cashier_name_ar: 'أحمد إبراهيم',
      cashier_name_en: 'Ahmed Ibrahim',
      patient: {
        id: patient.id,
        name_ar: patient.name_ar,
        name_en: patient.name_en,
        file_no: patient.file_no,
      },
      lines,
      previous_balance: 0,
      subtotal,
      discount,
      total,
      paid,
      method: pick(random, METHODS),
      balance_after: total - paid,
    });
  }
  db.invoices.push(...history);
  db.generated_days.push('invoice-history');
}

export const invoiceHandlers: MockHandlers = {
  getInvoices: (args: FetchArgs) => {
    if (!toMe(currentStaff()).permissions.includes('billing.read'))
      throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureInvoiceHistory);
    const { branch_id, days, method, status, q, patient_id } = (args.params ?? {}) as Record<
      string,
      string | undefined
    >;
    const staff = currentStaff();
    const since = Number(days) ? Date.now() - Number(days) * DAY : 0;
    const text = q?.trim().toLowerCase();
    const data = readDb()
      .invoices.filter(
        (invoice) =>
          (staff.all_branches || staff.branch_ids.includes(invoice.branch_id)) &&
          (!branch_id || branch_id === 'all' || invoice.branch_id === branch_id) &&
          Date.parse(invoice.created_at) >= since &&
          (!patient_id || invoice.patient.id === patient_id) &&
          (!method || invoice.method === method) &&
          (!status || invoiceStatusOf(invoice) === status) &&
          (!text ||
            invoice.number.toLowerCase().includes(text) ||
            invoice.patient.name_ar.toLowerCase().includes(text) ||
            invoice.patient.name_en.toLowerCase().includes(text) ||
            invoice.patient.file_no.toLowerCase().includes(text)),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { data };
  },
};
