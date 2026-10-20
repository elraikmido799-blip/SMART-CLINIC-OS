import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

export const CATALOG_KINDS = ['service', 'product', 'package'] as const;

export type CatalogKind = (typeof CATALOG_KINDS)[number];

/**
 * عنصر في الكتالوج (D-24 · docs/04 `products`): خدمة أو منتج أو باقة. السعر بالقروش، وممكن يتغير في فرع معيّن
 * (`branch_prices`: فرع ← سعر). الخدمة ليها مدة، والباقة ليها عدد جلسات. المقفول (`active: false`) مبيظهرش في الحجز والكاشير.
 */
export const catalogItemSchema = z.object({
  id: z.string(),
  kind: z.enum(CATALOG_KINDS),
  name_ar: z.string(),
  name_en: z.string(),
  specialty: z.custom<Specialty>(isSpecialty).nullable(),
  duration_min: z.number().nullable(),
  sessions: z.number().nullable(),
  price: z.number(),
  branch_prices: z.record(z.string(), z.number()),
  active: z.boolean(),
});

export type CatalogItem = z.infer<typeof catalogItemSchema>;

export type CatalogItemBody = Omit<CatalogItem, 'id'>;

export type UpdateCatalogItemBody = { id: string } & CatalogItemBody;
