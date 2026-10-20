import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { Integration, IntegrationKey } from '@/features/settings/integration-types';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';

/**
 * الـIntegrations الوهمية (9.6): 11 خدمة من docs/11. الدفع والواتساب والـSMS والإيميل متوصلين، والباقي فيهم
 * "لسه متضبطش" و"خطأ" (Meta Lead Ads) عشان الحالات الـ3 تتجرب. اختبار الاتصال بيرجّع "متوصّل" للمضبوط، وبيفضل خطأ
 * للمعطّل. مفاتيح الخدمات ملهاش وجود هنا (بتتحط في الباك).
 */
const SEED: Integration[] = [
  { key: 'payments', enabled: true, status: 'connected', checked_at: null, phase: 'mvp' },
  { key: 'whatsapp', enabled: true, status: 'connected', checked_at: null, phase: 'mvp' },
  { key: 'sms', enabled: true, status: 'connected', checked_at: null, phase: 'mvp' },
  { key: 'email', enabled: true, status: 'connected', checked_at: null, phase: 'mvp' },
  { key: 'push', enabled: false, status: 'not_configured', checked_at: null, phase: 'mvp' },
  { key: 'meta_leads', enabled: true, status: 'error', checked_at: null, phase: 'mvp' },
  { key: 'meta_pixel', enabled: false, status: 'not_configured', checked_at: null, phase: 'mvp' },
  { key: 'tiktok', enabled: false, status: 'not_configured', checked_at: null, phase: 'p2' },
  { key: 'analytics', enabled: true, status: 'connected', checked_at: null, phase: 'mvp' },
  { key: 'maps', enabled: true, status: 'connected', checked_at: null, phase: 'mvp' },
  { key: 'video_visits', enabled: false, status: 'not_configured', checked_at: null, phase: 'mvp' },
];

export function ensureIntegrations(db: MockDb) {
  if (db.integrations.length === 0) db.integrations = structuredClone(SEED);
}

const has = (permission: 'settings.read' | 'settings.manage') =>
  toMe(currentStaff()).permissions.includes(permission);

const find = (db: MockDb, key: string) => {
  const found = db.integrations.find((item) => item.key === key);
  if (!found) throw new MockHttpError(404, 'NOT_FOUND');
  return found;
};

export const integrationHandlers: MockHandlers = {
  getIntegrations: () => {
    if (!has('settings.read') && !has('settings.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureIntegrations);
    return { data: readDb().integrations };
  },

  setIntegration: ({ url, body }) => {
    if (!has('settings.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const key = url.split('/').at(-1) as IntegrationKey;
    const { enabled } = body as { enabled: boolean };
    writeDb(ensureIntegrations);
    writeDb((db) => {
      const found = find(db, key);
      if (enabled && found.status === 'not_configured')
        throw new MockHttpError(409, 'NOT_CONFIGURED');
      found.enabled = enabled;
    });
    return find(readDb(), key);
  },

  testIntegration: ({ url }) => {
    if (!has('settings.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const key = url.split('/').at(-2) ?? '';
    writeDb(ensureIntegrations);
    writeDb((db) => {
      const found = find(db, key);
      // اللي لسه متضبطش مفيهوش اتصال يتفحص، واللي في خطأ بيفضل خطأ
      found.checked_at = new Date().toISOString();
    });
    return find(readDb(), key);
  },
};
