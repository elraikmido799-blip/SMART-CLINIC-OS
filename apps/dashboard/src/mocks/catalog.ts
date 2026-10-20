import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { CatalogItem, CatalogItemBody } from '@/features/catalog/types';
import type { Sellable } from '@/features/billing/types';
import { currentStaff, toMe } from './auth';
import { SERVICES } from './clinic';
import { readDb, writeDb, type MockDb } from './db';

/**
 * الكتالوج الوهمي (7.1): الخدمات (من الحجز) + باقات + منتجات. الكاشير بيقرا منه (`sellablesOf`)،
 * فتعديل سعر أو قفل عنصر هنا بيظهر في الكاشير. أسعار الفروع للعرض والتعديل بس لحد ما الـAPI يحسبها في الفاتورة.
 */
const SEED_PACKAGES: CatalogItem[] = [
  {
    id: 'pkg-phy-10',
    kind: 'package',
    name_ar: 'باقة 10 جلسات علاج طبيعي',
    name_en: '10 physio sessions',
    specialty: 'physio',
    duration_min: null,
    sessions: 10,
    price: 400000,
    branch_prices: {},
    active: true,
  },
  {
    id: 'pkg-nut-month',
    kind: 'package',
    name_ar: 'متابعة تغذية شهر (4 زيارات)',
    name_en: 'Nutrition month (4 visits)',
    specialty: 'nutrition',
    duration_min: null,
    sessions: 4,
    price: 120000,
    branch_prices: {},
    active: true,
  },
  {
    id: 'pkg-derm-laser-6',
    kind: 'package',
    name_ar: '6 جلسات ليزر',
    name_en: '6 laser sessions',
    specialty: 'derm',
    duration_min: null,
    sessions: 6,
    price: 750000,
    branch_prices: {},
    active: true,
  },
];

const SEED_PRODUCTS: CatalogItem[] = [
  {
    id: 'prod-insoles',
    kind: 'product',
    name_ar: 'نعل طبي',
    name_en: 'Medical insoles',
    specialty: 'physio',
    duration_min: null,
    sessions: null,
    price: 85000,
    branch_prices: {},
    active: true,
  },
  {
    id: 'prod-sunscreen',
    kind: 'product',
    name_ar: 'واقي شمس طبي',
    name_en: 'Medical sunscreen',
    specialty: 'derm',
    duration_min: null,
    sessions: null,
    price: 42000,
    branch_prices: {},
    active: true,
  },
  {
    id: 'prod-supplement',
    kind: 'product',
    name_ar: 'مكمل غذائي',
    name_en: 'Nutrition supplement',
    specialty: 'nutrition',
    duration_min: null,
    sessions: null,
    price: 30000,
    branch_prices: { 'branch-tanta': 28000 },
    active: true,
  },
];

export function ensureCatalog(db: MockDb) {
  if (db.catalog.length > 0) return;
  db.catalog = [
    ...SERVICES.map((service): CatalogItem => ({
      id: service.id,
      kind: 'service',
      name_ar: service.name_ar,
      name_en: service.name_en,
      specialty: service.specialty,
      duration_min: service.duration_min,
      sessions: null,
      price: service.price,
      branch_prices: {},
      active: true,
    })),
    ...SEED_PACKAGES,
    ...SEED_PRODUCTS,
  ];
}

/** اللي الكاشير بيبيعه: الخدمات والباقات المفعّلة بس */
export function sellablesOf(db: MockDb): Sellable[] {
  ensureCatalog(db);
  return db.catalog
    .filter((item) => item.active && item.kind !== 'product')
    .map((item) => ({
      id: item.id,
      kind: item.kind as Sellable['kind'],
      name_ar: item.name_ar,
      name_en: item.name_en,
      specialty: item.specialty,
      price: item.price,
      sessions: item.sessions,
    }));
}

const needs = (permission: 'catalog.read' | 'catalog.write') => {
  if (!toMe(currentStaff()).permissions.includes(permission))
    throw new MockHttpError(403, 'FORBIDDEN');
};

const clean = (input: CatalogItemBody): CatalogItemBody => {
  if (!input.name_ar.trim() || !input.name_en.trim() || input.price <= 0)
    throw new MockHttpError(422, 'INVALID_ITEM');
  return {
    ...input,
    name_ar: input.name_ar.trim(),
    name_en: input.name_en.trim(),
    duration_min: input.kind === 'service' ? input.duration_min : null,
    sessions: input.kind === 'package' ? input.sessions : null,
  };
};

export const catalogHandlers: MockHandlers = {
  getCatalog: () => {
    needs('catalog.read');
    writeDb(ensureCatalog);
    return { data: readDb().catalog };
  },

  createCatalogItem: ({ body }) => {
    needs('catalog.write');
    const input = clean(body as CatalogItemBody);
    writeDb(ensureCatalog);
    const created: CatalogItem = { id: `cat-${Date.now()}`, ...input };
    writeDb((db) => {
      db.catalog.push(created);
    });
    return created;
  },

  updateCatalogItem: ({ url, body }) => {
    needs('catalog.write');
    const id = url.split('/').at(-1) ?? '';
    const input = clean(body as CatalogItemBody);
    writeDb(ensureCatalog);
    writeDb((db) => {
      const found = db.catalog.find((item) => item.id === id);
      if (!found) throw new MockHttpError(404, 'NOT_FOUND');
      Object.assign(found, input);
    });
    return readDb().catalog.find((item) => item.id === id)!;
  },
};
