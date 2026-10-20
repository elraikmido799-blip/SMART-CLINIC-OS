import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { Permission, Role } from '@/features/auth/permissions';
import type { RoleEntry, StaffBody, StaffMember } from '@/features/settings/staff-types';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';
import { ROLE_TEMPLATES, STAFF } from './seed';

/**
 * الموظفين والأدوار الوهمية (9.3): الحسابات الأولانية من `seed.ts` + اللي بيتضاف، وصلاحيات الأدوار بتتعدّل (وبتأثر
 * على `/me` فورًا). مدير الفرع بيشوف ويعدّل موظفين فرعه بس ومينفعش يديهم أدوار الإدارة. الحسابات المضافة من هنا للعرض
 * بس (مبتدخلش من شاشة الدخول الوهمية).
 */
// الأدوار اللي مدير الفرع مينفعش يعيّنها
const MANAGEMENT_ROLES: Role[] = [
  'admin',
  'ceo',
  'operations_manager',
  'finance',
  'branch_manager',
];

export function ensureStaffMembers(db: MockDb) {
  if (db.staff_members.length > 0) return;
  db.staff_members = STAFF.map((item): StaffMember => ({
    id: item.id,
    email: item.email,
    name_ar: item.name_ar,
    name_en: item.name_en,
    role: item.role,
    branch_ids: item.branch_ids,
    all_branches: item.all_branches,
    specialty: item.specialty,
    active: true,
  }));
}

const has = (permission: Permission) => toMe(currentStaff()).permissions.includes(permission);

const needsStaff = () => {
  if (!has('staff.manage')) throw new MockHttpError(403, 'FORBIDDEN');
};

const visibleTo = (member: StaffMember) => {
  const me = currentStaff();
  return (
    me.all_branches ||
    (!member.all_branches && member.branch_ids.some((id) => me.branch_ids.includes(id)))
  );
};

// قواعد التعيين لغير الأدمن: فرعه بس ومن غير أدوار الإدارة
const checkAssignable = (input: StaffBody) => {
  const me = currentStaff();
  if (!has('roles.manage')) {
    if (MANAGEMENT_ROLES.includes(input.role) || input.all_branches)
      throw new MockHttpError(403, 'FORBIDDEN_ROLE');
    if (!me.all_branches && input.branch_ids.some((id) => !me.branch_ids.includes(id)))
      throw new MockHttpError(403, 'FORBIDDEN_BRANCH');
  }
  if (
    !input.name_ar.trim() ||
    !input.name_en.trim() ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    (!input.all_branches && input.branch_ids.length === 0)
  )
    throw new MockHttpError(422, 'INVALID_STAFF');
};

export const staffHandlers: MockHandlers = {
  getStaffMembers: () => {
    needsStaff();
    writeDb(ensureStaffMembers);
    return { data: readDb().staff_members.filter(visibleTo) };
  },

  createStaffMember: ({ body }) => {
    needsStaff();
    const input = body as StaffBody;
    checkAssignable(input);
    writeDb(ensureStaffMembers);
    let created: StaffMember | null = null;
    writeDb((db) => {
      if (db.staff_members.some((item) => item.email.toLowerCase() === input.email.toLowerCase()))
        throw new MockHttpError(409, 'DUPLICATE_EMAIL');
      created = { id: `st-new-${Date.now()}`, ...input };
      db.staff_members.push(created);
    });
    return created!;
  },

  updateStaffMember: ({ url, body }) => {
    needsStaff();
    const id = url.split('/').at(-1) ?? '';
    const input = body as StaffBody;
    checkAssignable(input);
    writeDb(ensureStaffMembers);
    writeDb((db) => {
      const found = db.staff_members.find((item) => item.id === id);
      if (!found || !visibleTo(found)) throw new MockHttpError(404, 'NOT_FOUND');
      if (found.id === currentStaff().id && !input.active)
        throw new MockHttpError(422, 'INVALID_STAFF');
      if (db.staff_members.some((item) => item.id !== id && item.email === input.email))
        throw new MockHttpError(409, 'DUPLICATE_EMAIL');
      Object.assign(found, input);
    });
    return readDb().staff_members.find((item) => item.id === id)!;
  },

  getRoles: () => {
    if (!has('roles.manage') && !has('staff.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    const overrides = readDb().role_permissions;
    const data: RoleEntry[] = (Object.keys(ROLE_TEMPLATES) as Role[]).map((role) => ({
      role,
      permissions: overrides[role] ?? ROLE_TEMPLATES[role],
    }));
    return { data };
  },

  updateRole: ({ url, body }) => {
    if (!has('roles.manage')) throw new MockHttpError(403, 'FORBIDDEN');
    // الدور في اللينك (PUT /staff/roles/:role) والصلاحيات في الـBody
    const role = url.split('/').at(-1) as Role;
    const input: RoleEntry = {
      role,
      permissions: (body as { permissions: Permission[] }).permissions,
    };
    // الأدمن مينفعش يقفل على نفسه
    if (
      input.role === 'admin' &&
      !(input.permissions.includes('roles.manage') && input.permissions.includes('settings.manage'))
    )
      throw new MockHttpError(422, 'LOCKOUT');
    writeDb((db) => {
      db.role_permissions[input.role] = input.permissions;
    });
    return input;
  },
};
