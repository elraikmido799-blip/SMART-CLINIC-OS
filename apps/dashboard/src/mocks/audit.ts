import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import {
  AUDIT_ACTIONS,
  type AuditAction,
  type AuditEntity,
  type AuditEntry,
} from '@/features/settings/audit-types';
import { currentStaff, toMe } from './auth';
import { ensurePatients, pick, seeded } from './clinic';
import { readDb, writeDb, type MockDb } from './db';
import { STAFF } from './seed';

/**
 * سجل العمليات الوهمي (9.7): 160 سطر في آخر 14 يوم بيتولدوا مرة واحدة، من موظفين حقيقيين في الـMocks على مرضى وفواتير
 * وعملاء. الأفعال الحساسة (تصدير · مرتجع · خصم · فتح ملف) موجودة عشان الفلتر يطلّع حاجة. مدير الفرع بيشوف فرعه بس.
 */
const DAY = 86_400_000;

const ENTITY_FOR: Record<AuditAction, AuditEntity[]> = {
  login: ['staff'],
  view: ['patient', 'encounter'],
  create: ['appointment', 'invoice', 'lead', 'patient'],
  update: ['appointment', 'patient', 'lead', 'settings', 'staff'],
  delete: ['appointment', 'lead'],
  export: ['settings'],
  refund: ['invoice'],
  discount: ['invoice'],
};

export function ensureAudit(db: MockDb) {
  if (db.audit_log.length > 0) return;
  ensurePatients(db);
  const random = seeded('oxygen-audit');
  const actors = STAFF.filter((item) => item.role !== 'ceo');
  db.audit_log = Array.from({ length: 160 }, (_, index): AuditEntry => {
    const actor = pick(random, actors);
    const action = pick(random, AUDIT_ACTIONS);
    const entity = pick(random, ENTITY_FOR[action]);
    const patient = pick(random, db.patients);
    const at = new Date(Date.now() - random() * 14 * DAY).toISOString();
    const number = String(1000 + Math.floor(random() * 900));
    const isPatient = entity === 'patient' || entity === 'encounter' || entity === 'appointment';
    return {
      id: `audit-${index + 1}`,
      at,
      actor: { id: actor.id, name_ar: actor.name_ar, name_en: actor.name_en, role: actor.role },
      action,
      entity,
      entity_label:
        entity === 'invoice'
          ? `INV-${number}`
          : isPatient
            ? patient.name_ar
            : entity === 'lead'
              ? `lead-${number}`
              : entity === 'staff'
                ? actor.email
                : 'settings',
      branch_id: patient.branch_id,
      patient_id: isPatient ? patient.id : null,
      reason:
        action === 'view' && entity === 'patient' && random() < 0.12 ? 'break-the-glass' : null,
    };
  }).sort((a, b) => b.at.localeCompare(a.at));
}

export const auditHandlers: MockHandlers = {
  getAuditLog: (args: FetchArgs) => {
    if (!toMe(currentStaff()).permissions.includes('audit.read'))
      throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureAudit);
    const { branch_id, days, action, entity, actor_id, patient_id } = (args.params ?? {}) as Record<
      string,
      string | undefined
    >;
    const staff = currentStaff();
    const since = Number(days) ? Date.now() - Number(days) * DAY : 0;
    const data = readDb().audit_log.filter(
      (entry) =>
        (staff.all_branches || staff.branch_ids.includes(entry.branch_id)) &&
        (!branch_id || branch_id === 'all' || entry.branch_id === branch_id) &&
        Date.parse(entry.at) >= since &&
        (!action || entry.action === action) &&
        (!entity || entry.entity === entity) &&
        (!actor_id || entry.actor.id === actor_id) &&
        (!patient_id || entry.patient_id === patient_id),
    );
    return { data };
  },
};
