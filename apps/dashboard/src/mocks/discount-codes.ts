import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { CodeResult } from '@/features/billing/types';
import {
  codeStateOf,
  type DiscountCode,
  type DiscountCodeBody,
} from '@/features/catalog/codes-types';
import { clinicToday } from '@/lib/clinic-time';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';

/**
 * أكواد الخصم الوهمية (7.2). OXY10 نفس كود الموقع. الكاشير بيفحص الكود من هنا (`checkDiscountCodeOf`)
 * وكل فاتورة بتستخدمه بتزوّد `used` (`redeemCode`).
 */
const SEED: DiscountCode[] = [
  {
    id: 'code-oxy10',
    code: 'OXY10',
    type: 'percent',
    value: 10,
    starts_on: '2026-01-01',
    ends_on: null,
    max_uses: null,
    used: 12,
    applies_to: 'all',
    active: true,
  },
  {
    id: 'code-summer15',
    code: 'SUMMER15',
    type: 'percent',
    value: 15,
    starts_on: '2026-06-01',
    ends_on: '2026-12-31',
    max_uses: 100,
    used: 38,
    applies_to: 'package',
    active: true,
  },
  {
    id: 'code-welcome50',
    code: 'WELCOME50',
    type: 'fixed',
    value: 5000,
    starts_on: '2026-01-01',
    ends_on: null,
    max_uses: 50,
    used: 50,
    applies_to: 'service',
    active: true,
  },
  {
    id: 'code-ramadan20',
    code: 'RAMADAN20',
    type: 'percent',
    value: 20,
    starts_on: '2026-02-18',
    ends_on: '2026-03-19',
    max_uses: null,
    used: 64,
    applies_to: 'all',
    active: true,
  },
];

export function ensureCodes(db: MockDb) {
  if (db.discount_codes.length === 0) db.discount_codes = structuredClone(SEED);
}

/** فحص الكود في الكاشير: شغال النهارده ولسه فيه استخدامات، وإلا `null` */
export function checkDiscountCodeOf(db: MockDb, input: string): CodeResult | null {
  ensureCodes(db);
  const code = input.trim().toUpperCase();
  const found = db.discount_codes.find((item) => item.code === code);
  if (!found || codeStateOf(found, clinicToday()) !== 'active') return null;
  return {
    code: found.code,
    percent: found.type === 'percent' ? found.value : 0,
    amount: found.type === 'fixed' ? found.value : 0,
    applies_to: found.applies_to,
  };
}

export function redeemCode(db: MockDb, input: string) {
  const found = db.discount_codes.find((item) => item.code === input);
  if (found) found.used += 1;
}

const needs = () => {
  const { permissions } = toMe(currentStaff());
  if (!permissions.includes('campaigns.manage') && !permissions.includes('catalog.write'))
    throw new MockHttpError(403, 'FORBIDDEN');
};

const clean = (input: DiscountCodeBody): DiscountCodeBody => {
  const code = input.code.trim().toUpperCase();
  const badValue =
    input.value <= 0 || (input.type === 'percent' && input.value > 100) || !input.starts_on;
  const badPeriod = !!input.ends_on && input.ends_on < input.starts_on;
  if (!/^[A-Z0-9]{3,20}$/.test(code) || badValue || badPeriod)
    throw new MockHttpError(422, 'INVALID_CODE_DATA');
  return { ...input, code };
};

export const discountCodeHandlers: MockHandlers = {
  getDiscountCodes: () => {
    needs();
    writeDb(ensureCodes);
    return { data: readDb().discount_codes };
  },

  createDiscountCode: ({ body }) => {
    needs();
    const input = clean(body as DiscountCodeBody);
    writeDb(ensureCodes);
    let created: DiscountCode | null = null;
    writeDb((db) => {
      if (db.discount_codes.some((item) => item.code === input.code))
        throw new MockHttpError(409, 'DUPLICATE_CODE');
      created = { id: `code-${Date.now()}`, used: 0, ...input };
      db.discount_codes.push(created);
    });
    return created!;
  },

  updateDiscountCode: ({ url, body }) => {
    needs();
    const id = url.split('/').at(-1) ?? '';
    const input = clean(body as DiscountCodeBody);
    writeDb(ensureCodes);
    writeDb((db) => {
      const found = db.discount_codes.find((item) => item.id === id);
      if (!found) throw new MockHttpError(404, 'NOT_FOUND');
      if (db.discount_codes.some((item) => item.id !== id && item.code === input.code))
        throw new MockHttpError(409, 'DUPLICATE_CODE');
      Object.assign(found, input);
    });
    return readDb().discount_codes.find((item) => item.id === id)!;
  },
};
