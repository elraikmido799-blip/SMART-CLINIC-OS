import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { BranchSettings } from '@/features/settings/branch-types';
import { currentStaff, toMe } from './auth';
import { ROOMS } from './clinic';
import { readDb, writeDb, type MockDb } from './db';
import { BRANCHES } from './seed';

/**
 * إعدادات الفروع الوهمية (9.4): بيانات كل فرع ومواعيد الأسبوع (9 ص → 9 م، والجمعة مقفول) وأوضه.
 * الأسماء بتظهر في كل الشاشات (`getBranches` بيقرا منها). الأوض والمواعيد هنا للإدارة بس، والكالندر لسه على
 * الأوض الأولانية لحد ما الـAPI يربطهم (DEC-73).
 */
const ADDRESS: Record<string, { ar: string; en: string; phone: string }> = {
  'branch-new-cairo': {
    ar: 'التجمع الخامس، القاهرة',
    en: 'New Cairo, Cairo',
    phone: '+20 2 2555 0101',
  },
  'branch-sheikh-zayed': {
    ar: 'مدينة الشيخ زايد، الجيزة',
    en: 'Sheikh Zayed City, Giza',
    phone: '+20 2 3855 0102',
  },
  'branch-heliopolis': {
    ar: 'مصر الجديدة، القاهرة',
    en: 'Heliopolis, Cairo',
    phone: '+20 2 2455 0103',
  },
  'branch-tanta': { ar: 'طنطا، الغربية', en: 'Tanta, Gharbia', phone: '+20 40 3355 0104' },
  'branch-tala': { ar: 'تلا، المنوفية', en: 'Tala, Menoufia', phone: '+20 48 2555 0105' },
};

export function ensureBranchSettings(db: MockDb) {
  if (db.branch_settings.length > 0) return;
  db.branch_settings = BRANCHES.map((branch): BranchSettings => ({
    id: branch.id,
    name_ar: branch.name_ar,
    name_en: branch.name_en,
    address_ar: ADDRESS[branch.id]?.ar ?? '',
    address_en: ADDRESS[branch.id]?.en ?? '',
    phone: ADDRESS[branch.id]?.phone ?? '',
    map_url: `https://maps.google.com/?q=Oxygen+${encodeURIComponent(branch.name_en)}`,
    active: true,
    hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      closed: day === 6,
      open: '09:00',
      close: '21:00',
    })),
    rooms: ROOMS.filter((room) => room.branch_id === branch.id).map((room) => ({
      id: room.id,
      name_ar: room.name_ar,
      name_en: room.name_en,
      active: true,
    })),
  }));
}

const has = (permission: 'settings.read' | 'settings.manage') =>
  toMe(currentStaff()).permissions.includes(permission);

const valid = (input: BranchSettings) =>
  input.name_ar.trim() &&
  input.name_en.trim() &&
  input.hours.length === 7 &&
  input.hours.every((entry) => entry.closed || entry.open < entry.close) &&
  input.rooms.every((room) => room.name_ar.trim() && room.name_en.trim());

export const branchSettingsHandlers: MockHandlers = {
  getBranchSettings: () => {
    if (!has('settings.read') && !has('settings.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureBranchSettings);
    return { data: readDb().branch_settings };
  },

  updateBranchSettings: ({ url, body }) => {
    if (!has('settings.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const id = url.split('/').at(-1) ?? '';
    const input = body as BranchSettings;
    if (!valid(input)) throw new MockHttpError(422, 'INVALID_BRANCH');
    writeDb(ensureBranchSettings);
    writeDb((db) => {
      const index = db.branch_settings.findIndex((item) => item.id === id);
      if (index < 0) throw new MockHttpError(404, 'NOT_FOUND');
      db.branch_settings[index] = { ...input, id };
    });
    return readDb().branch_settings.find((item) => item.id === id)!;
  },
};
